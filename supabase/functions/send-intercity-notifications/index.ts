
// Supabase Edge Function: send-intercity-notifications
// Envoie des notifications Email (Resend) et WhatsApp (Twilio) pour les livraisons inter-régions

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Production mode flag - set via environment variable
const isProduction = Deno.env.get("IS_PRODUCTION_MODE") === "true";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_WHATSAPP_FROM = Deno.env.get('TWILIO_WHATSAPP_FROM') || 'whatsapp:+14155238886';

const YOMBAL_EMAIL = 'woyofaldem@gmail.com';
const YOMBAL_WHATSAPP = '+221765676486';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  senderName?: string;
  senderPhone?: string;
  recipientName?: string;
  recipientPhone?: string;
  departureRegion?: string;
  destinationRegion?: string;
  destinationDepartment?: string;
  description?: string;
  pricingTotal?: number;
  weight?: number;
  // For direct email/WhatsApp calls
  emailOnly?: boolean;
  emailTo?: string;
  emailSubject?: string;
  emailHtml?: string;
  whatsappOnly?: boolean;
  whatsappPhone?: string;
  whatsappMessage?: string;
}

async function sendEmail(data: NotificationRequest): Promise<{ success: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    // Check if this is a direct email call
    let emailBody: string;
    let emailTo: string;
    let emailSubject: string;

    if (data.emailOnly && data.emailHtml && data.emailTo && data.emailSubject) {
      // Direct email call
      emailBody = data.emailHtml;
      emailTo = data.emailTo;
      emailSubject = data.emailSubject;
    } else {
      // Standard inter-region delivery notification
      emailBody = `
        <h2>Nouvelle livraison inter régions</h2>
        <p><strong>Client :</strong> ${data.senderName}</p>
        <p><strong>Téléphone :</strong> ${data.senderPhone}</p>
        <p><strong>Départ :</strong> ${data.departureRegion}</p>
        <p><strong>Arrivée :</strong> ${data.destinationRegion}${data.destinationDepartment ? ` (${data.destinationDepartment})` : ''}</p>
        ${data.weight ? `<p><strong>Poids :</strong> ${data.weight} kg</p>` : ''}
        <p><strong>Prix estimé :</strong> ${data.pricingTotal?.toLocaleString()} FCFA</p>
        <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Dakar' })}</p>
        
        <hr>
        
        <h3>👤 Destinataire</h3>
        <p><strong>Nom :</strong> ${data.recipientName}</p>
        <p><strong>Téléphone :</strong> ${data.recipientPhone}</p>
        
        ${data.description ? `
        <h3>📝 Description</h3>
        <p>${data.description}</p>
        ` : ''}
      `;
      emailTo = YOMBAL_EMAIL;
      emailSubject = 'Nouvelle commande - Livraison Inter Régions';
    }

    console.log(`📧 Sending email [Mode: ${isProduction ? 'Production' : 'Test'}]`);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Yombal Yoon <notifications@yombalyoon.com>',
        to: [emailTo],
        subject: emailSubject,
        html: emailBody,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend API error:', errorText);
      return { success: false, error: `Email failed: ${errorText}` };
    }

    const result = await response.json();
    console.log('✅ Email sent successfully:', result);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

async function sendWhatsApp(data: NotificationRequest): Promise<{ success: boolean; error?: string }> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.error('Twilio credentials not configured');
    return { success: false, error: 'WhatsApp service not configured' };
  }

  try {
    // Check if this is a direct WhatsApp call
    let message: string;
    let whatsappTo: string;

    if (data.whatsappOnly && data.whatsappMessage && data.whatsappPhone) {
      // Direct WhatsApp call
      message = data.whatsappMessage;
      whatsappTo = data.whatsappPhone;
    } else {
      // Standard inter-region delivery notification
      message = `
🚚 Nouvelle commande - Livraison Inter Régions

👤 Client : ${data.senderName}
📞 Tel : ${data.senderPhone}

📍 Départ : ${data.departureRegion}
📍 Arrivée : ${data.destinationRegion}${data.destinationDepartment ? ` (${data.destinationDepartment})` : ''}

${data.weight ? `📦 Poids : ${data.weight} kg\n` : ''}💰 Prix estimé : ${data.pricingTotal?.toLocaleString()} FCFA

🕒 ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Dakar' })}

Merci de traiter cette commande rapidement.
      `.trim();
      whatsappTo = YOMBAL_WHATSAPP;
    }

    console.log(`📱 Sending WhatsApp [Mode: ${isProduction ? 'Production' : 'Test'}]`);

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    const formData = new URLSearchParams();
    formData.append('From', TWILIO_WHATSAPP_FROM);
    formData.append('To', `whatsapp:${whatsappTo}`);
    formData.append('Body', message);

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Twilio API error:', errorText);
      return { success: false, error: `WhatsApp failed: ${errorText}` };
    }

    const result = await response.json();
    console.log('✅ WhatsApp sent successfully:', result);
    return { success: true };
  } catch (error) {
    console.error('Error sending WhatsApp:', error);
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const data: NotificationRequest = await req.json();

    console.log('📥 Processing notification request:', {
      emailOnly: data.emailOnly,
      whatsappOnly: data.whatsappOnly,
      sender: data.senderName,
      destination: data.destinationRegion,
      mode: isProduction ? 'Production' : 'Test',
    });

    // Handle email-only requests
    if (data.emailOnly) {
      const emailResult = await sendEmail(data);
      return new Response(
        JSON.stringify({
          success: emailResult.success,
          email: emailResult,
          message: emailResult.success 
            ? 'Email envoyé avec succès' 
            : 'Échec de l\'envoi de l\'email',
          mode: isProduction ? 'production' : 'test',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: emailResult.success ? 200 : 500,
        }
      );
    }

    // Handle WhatsApp-only requests
    if (data.whatsappOnly) {
      const whatsappResult = await sendWhatsApp(data);
      return new Response(
        JSON.stringify({
          success: whatsappResult.success,
          whatsapp: whatsappResult,
          message: whatsappResult.success 
            ? 'WhatsApp envoyé avec succès' 
            : 'Échec de l\'envoi du WhatsApp',
          mode: isProduction ? 'production' : 'test',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: whatsappResult.success ? 200 : 500,
        }
      );
    }

    // Send both notifications in parallel (standard inter-region delivery)
    const [emailResult, whatsappResult] = await Promise.all([
      sendEmail(data),
      sendWhatsApp(data),
    ]);

    // Return success if at least one notification was sent
    const success = emailResult.success || whatsappResult.success;

    return new Response(
      JSON.stringify({
        success,
        email: emailResult,
        whatsapp: whatsappResult,
        message: success 
          ? 'Notifications envoyées avec succès' 
          : 'Échec de l\'envoi des notifications',
        mode: isProduction ? 'production' : 'test',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: success ? 200 : 500,
      }
    );
  } catch (error) {
    console.error('❌ Error in send-intercity-notifications:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        mode: isProduction ? 'production' : 'test',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
