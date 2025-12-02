
import { createClient } from 'jsr:@supabase/supabase-js@2';

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Response helper
function response(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Generate OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Envoi de l'OTP via Twilio (WhatsApp ou SMS)
async function sendViaTwilio(
  phone: string, 
  otp: string, 
  method: 'whatsapp' | 'sms' = 'whatsapp'
): Promise<{ success: boolean; error?: string; method?: string }> {
  const sid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const token = Deno.env.get("TWILIO_AUTH_TOKEN");
  const wa = Deno.env.get("TWILIO_WHATSAPP_NUMBER");
  const smsNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

  if (!sid || !token) {
    return { success: false, error: "Twilio non configuré." };
  }

  const auth = btoa(`${sid}:${token}`);
  let fromNumber: string;
  let toNumber: string;

  // Try WhatsApp first, fallback to SMS if WhatsApp fails
  if (method === 'whatsapp' && wa) {
    fromNumber = `whatsapp:${wa}`;
    toNumber = `whatsapp:${phone}`;
  } else if (smsNumber) {
    fromNumber = smsNumber;
    toNumber = phone;
    method = 'sms';
  } else {
    return { success: false, error: "Aucun numéro Twilio configuré." };
  }

  console.log(`📤 Sending OTP via ${method} from ${fromNumber} to ${toNumber}`);

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: fromNumber,
        To: toNumber,
        Body: `Votre code OTP Yombal Yoon est : ${otp}. Valide pendant 10 minutes.`,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(`❌ Twilio ${method} error:`, data);
      
      // If WhatsApp fails, try SMS as fallback
      if (method === 'whatsapp' && smsNumber) {
        console.log('🔄 WhatsApp failed, trying SMS fallback...');
        return await sendViaTwilio(phone, otp, 'sms');
      }
      
      return { 
        success: false, 
        error: data.message || `Erreur d'envoi ${method}` 
      };
    }

    console.log(`✅ OTP sent successfully via ${method}`);
    return { success: true, method };
  } catch (error) {
    console.error(`❌ Error sending via ${method}:`, error);
    
    // If WhatsApp fails, try SMS as fallback
    if (method === 'whatsapp' && smsNumber) {
      console.log('🔄 WhatsApp failed, trying SMS fallback...');
      return await sendViaTwilio(phone, otp, 'sms');
    }
    
    return { 
      success: false, 
      error: `Erreur d'envoi ${method}` 
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const action = body.action;

    console.log("📥 Request:", { action, phoneNumber: body.phoneNumber, userId: body.userId });

    // ---------- ACTION = SEND ----------
    if (action === "send") {
      const { phoneNumber, userId, method } = body;

      if (!phoneNumber) {
        return response({ success: false, error: "Numéro requis" }, 400);
      }

      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Save OTP to database
      const { error: saveErr } = await supabase.from("phone_verifications").insert({
        phone_number: phoneNumber,
        otp_code: otp,
        expires_at: expiresAt.toISOString(),
        user_id: userId ?? null,
        verification_method: method ?? "whatsapp",
      });

      if (saveErr) {
        console.error("❌ DB ERROR:", saveErr);
        return response({ success: false, error: "Erreur de sauvegarde" }, 500);
      }

      // Send OTP via Twilio
      const sent = await sendViaTwilio(phoneNumber, otp, method);

      if (!sent.success) {
        return response({ 
          success: false, 
          error: sent.error || "Erreur d'envoi. Vérifiez que le numéro est correct et enregistré sur WhatsApp." 
        }, 500);
      }

      return response({
        success: true,
        message: `Code envoyé par ${sent.method === 'sms' ? 'SMS' : 'WhatsApp'}`,
        method: sent.method,
      });
    }

    // ---------- ACTION = VERIFY ----------
    if (action === "verify") {
      const { phoneNumber, otpCode, userId } = body;

      console.log("🔍 Verifying OTP:", { phoneNumber, userId });

      if (!phoneNumber || !otpCode) {
        return response({ success: false, error: "Données manquantes" }, 400);
      }

      // Fetch the most recent OTP for this phone number
      const { data, error } = await supabase
        .from("phone_verifications")
        .select("*")
        .eq("phone_number", phoneNumber)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error || !data || data.length === 0) {
        console.error("❌ DB FETCH ERROR:", error);
        return response({ success: false, error: "OTP introuvable" }, 400);
      }

      const entry = data[0];

      console.log("📋 OTP Entry:", { 
        id: entry.id, 
        phone: entry.phone_number, 
        expires_at: entry.expires_at,
        is_verified: entry.is_verified 
      });

      // Check if OTP has expired
      const now = new Date();
      const expiresAt = new Date(entry.expires_at);
      if (now > expiresAt) {
        console.error("❌ OTP expired:", { now, expiresAt });
        return response({ success: false, error: "Code expiré. Veuillez demander un nouveau code." }, 400);
      }

      // Check if OTP code matches
      if (entry.otp_code !== otpCode) {
        console.error("❌ OTP mismatch");
        return response({ success: false, error: "Code incorrect" }, 400);
      }

      // Mark the OTP as verified
      const { error: updateOtpError } = await supabase
        .from("phone_verifications")
        .update({
          is_verified: true,
          verified_at: new Date().toISOString(),
        })
        .eq("id", entry.id);

      if (updateOtpError) {
        console.error("❌ Error updating OTP:", updateOtpError);
      }

      // Update user profile if userId is provided
      if (userId) {
        console.log("📝 Updating user profile:", userId);
        
        // First check if profile exists
        const { data: existingProfile, error: fetchError } = await supabase
          .from("user_profiles")
          .select("id, phone_number")
          .eq("id", userId)
          .single();

        if (fetchError) {
          console.error("❌ Error fetching profile:", fetchError);
          return response({ 
            success: false, 
            error: "Erreur lors de la récupération du profil" 
          }, 500);
        }

        console.log("📋 Existing profile:", existingProfile);

        // Check if phone number is already used by another user
        if (existingProfile.phone_number !== phoneNumber) {
          const { data: phoneCheck, error: phoneCheckError } = await supabase
            .from("user_profiles")
            .select("id")
            .eq("phone_number", phoneNumber)
            .neq("id", userId);

          if (phoneCheckError) {
            console.error("❌ Error checking phone:", phoneCheckError);
          } else if (phoneCheck && phoneCheck.length > 0) {
            console.error("❌ Phone number already in use");
            return response({ 
              success: false, 
              error: "Ce numéro est déjà utilisé par un autre compte" 
            }, 400);
          }
        }

        // Update the profile
        const { error: updateUserError } = await supabase
          .from("user_profiles")
          .update({
            is_phone_verified: true,
            phone_verified_at: new Date().toISOString(),
            phone_number: phoneNumber,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (updateUserError) {
          console.error("❌ Error updating user profile:", updateUserError);
          return response({ 
            success: false, 
            error: "Erreur lors de la mise à jour du profil: " + updateUserError.message 
          }, 500);
        }

        console.log("✅ User profile updated successfully");
      }

      console.log("✅ OTP verified successfully");
      return response({ 
        success: true, 
        message: "Numéro vérifié avec succès" 
      });
    }

    // ---------- ACTION NON RECONNUE ----------
    return response({ success: false, error: "Action invalide" }, 400);
  } catch (e) {
    console.error("❌ SERVER ERROR:", e);
    return response({ 
      success: false, 
      error: "Erreur interne: " + (e.message || "Erreur inconnue") 
    }, 500);
  }
});
