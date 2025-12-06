
import { createClient } from 'jsr:@supabase/supabase-js@2';

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Production mode flag - set via environment variable
const IS_PRODUCTION_MODE = Deno.env.get("IS_PRODUCTION_MODE") === "true";

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

  console.log(`📤 Sending OTP via ${method} from ${fromNumber} to ${toNumber} [Mode: ${IS_PRODUCTION_MODE ? 'Production' : 'Test'}]`);

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

    console.log("📥 Request:", { 
      action, 
      phoneNumber: body.phoneNumber, 
      userId: body.userId,
      mode: IS_PRODUCTION_MODE ? 'Production' : 'Test'
    });

    // ---------- ACTION = SEND ----------
    if (action === "send") {
      const { phoneNumber, userId, method } = body;

      if (!phoneNumber) {
        return response({ success: false, error: "Numéro requis" }, 400);
      }

      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // In test mode, delete old OTP entries for this phone number to allow reuse
      if (!IS_PRODUCTION_MODE) {
        console.log('🧪 Test mode: Cleaning old OTP entries for phone:', phoneNumber);
        const { error: deleteError } = await supabase
          .from("phone_verifications")
          .delete()
          .eq("phone_number", phoneNumber);
        
        if (deleteError) {
          console.error("⚠️ Error cleaning old OTP entries:", deleteError);
          // Don't fail here, just log the error
        } else {
          console.log('✅ Old OTP entries cleaned successfully');
        }
      }

      // Save OTP to database
      console.log('💾 Saving OTP to database...');
      const { data: insertData, error: saveErr } = await supabase
        .from("phone_verifications")
        .insert({
          phone_number: phoneNumber,
          otp_code: otp,
          expires_at: expiresAt.toISOString(),
          user_id: userId ?? null,
          verification_method: method ?? "whatsapp",
        })
        .select();

      if (saveErr) {
        console.error("❌ DB SAVE ERROR:", {
          code: saveErr.code,
          message: saveErr.message,
          details: saveErr.details,
          hint: saveErr.hint,
        });
        
        // Provide more detailed error message
        let errorMessage = "Erreur de sauvegarde";
        if (saveErr.code === '23505') {
          errorMessage = "Une vérification est déjà en cours pour ce numéro. Veuillez réessayer dans quelques minutes.";
        } else if (saveErr.code === '23503') {
          errorMessage = "Erreur de référence utilisateur. Veuillez vous reconnecter.";
        } else {
          errorMessage = `Erreur de sauvegarde: ${saveErr.message}`;
        }
        
        return response({ 
          success: false, 
          error: errorMessage,
          details: IS_PRODUCTION_MODE ? undefined : saveErr.message 
        }, 500);
      }

      console.log('✅ OTP saved to database:', insertData);

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
        message: `Code envoyé par ${sent.method === 'sms' ? 'SMS' : 'WhatsApp'}${!IS_PRODUCTION_MODE ? ' (Mode Test)' : ''}`,
        method: sent.method,
        mode: IS_PRODUCTION_MODE ? 'production' : 'test',
      });
    }

    // ---------- ACTION = VERIFY ----------
    if (action === "verify") {
      const { phoneNumber, otpCode, userId } = body;

      console.log("🔍 Verifying OTP:", { phoneNumber, userId, mode: IS_PRODUCTION_MODE ? 'Production' : 'Test' });

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
        return response({ success: false, error: "OTP introuvable. Veuillez demander un nouveau code." }, 400);
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
          
          // If profile doesn't exist, create it
          if (fetchError.code === 'PGRST116') {
            console.log("📝 Profile doesn't exist, creating new profile...");
            const { error: createError } = await supabase
              .from("user_profiles")
              .insert({
                id: userId,
                phone_number: phoneNumber,
                is_phone_verified: true,
                phone_verified_at: new Date().toISOString(),
                full_name: 'Utilisateur',
                roles: {
                  driver: true,
                  passenger: true,
                  delivery: false,
                  sender: false,
                },
              });
            
            if (createError) {
              console.error("❌ Error creating profile:", createError);
              return response({ 
                success: false, 
                error: "Erreur lors de la création du profil: " + createError.message 
              }, 500);
            }
            
            console.log("✅ Profile created successfully");
          } else {
            return response({ 
              success: false, 
              error: "Erreur lors de la récupération du profil: " + fetchError.message 
            }, 500);
          }
        } else {
          console.log("📋 Existing profile:", existingProfile);

          // In production mode, check if phone number is already used by another user
          // In test mode, allow phone number reuse
          if (IS_PRODUCTION_MODE && existingProfile.phone_number !== phoneNumber) {
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
          } else if (!IS_PRODUCTION_MODE) {
            console.log('🧪 Test mode: Skipping duplicate phone check');
            
            // In test mode, clear the phone number from any other profile
            const { error: clearError } = await supabase
              .from("user_profiles")
              .update({ phone_number: null, is_phone_verified: false })
              .eq("phone_number", phoneNumber)
              .neq("id", userId);
            
            if (clearError) {
              console.error("⚠️ Error clearing phone from other profiles:", clearError);
            } else {
              console.log('✅ Phone cleared from other profiles');
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
      }

      console.log("✅ OTP verified successfully");
      return response({ 
        success: true, 
        message: `Numéro vérifié avec succès${!IS_PRODUCTION_MODE ? ' (Mode Test)' : ''}`,
        mode: IS_PRODUCTION_MODE ? 'production' : 'test',
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
