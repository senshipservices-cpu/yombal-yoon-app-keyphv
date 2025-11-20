
// Supabase Edge Function: send-intercity-notifications
// Envoie des notifications Email (Resend) et WhatsApp (Twilio) pour les livraisons inter-régions

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_WHATSAPP_FROM = Deno.env.get('TWILIO_WHATSAPP_FROM') || 'whatsapp:+14155238886';

const YOMBAL_EMAIL = 'senshipservices@gmail.com';
const YOMBAL_WHATSAPP = '+221765676486';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  senderName: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  departureRegion: string;
  destinationRegion: string;
  destinationDepartment?: string;
  description?: string;
  pricingTotal: number;
}

async function sendEmail(data: NotificationRequest): Promise<{ success: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const emailBody = `
      <h2>🚚 Nouvelle Demande de Livraison Inter-Régions</h2>
      
      <h3>📦 Détails de la Livraison</h3>
      <ul>
        <li><strong>Départ:</strong> ${data.departureRegion}</li>
        <li><strong>Destination:</strong> ${data.destinationRegion}${data.destinationDepartment ? ` (${data.destinationDepartment})` : ''}</li>
        <li><strong>Prix Total:</strong> ${data.pricingTotal.toLocaleString()} FCFA</li>
      </ul>
      
      <h3>👤 Expéditeur</h3>
      <ul>
        <li><strong>Nom:</strong> ${data.senderName}</li>
        <li><strong>Téléphone:</strong> ${data.senderPhone}</li>
      </ul>
      
      <h3>👤 Destinataire</h3>
      <ul>
        <li><strong>Nom:</strong> ${data.recipientName}</li>
        <li><strong>Téléphone:</strong> ${data.recipientPhone}</li>
      </ul>
      
      ${data.description ? `
      <h3>📝 Description</h3>
      <p>${data.description}</p>
      ` : ''}
      
      <hr>
      <p><em>Cette demande a été créée via l'application Yombal Yoon</em></p>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Yombal Yoon <notifications@yombalyoon.com>',
        to: [YOMBAL_EMAIL],
        subject: `🚚 Nouvelle Livraison: ${data.departureRegion} → ${data.destinationRegion}`,
        html: emailBody,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend API error:', errorText);
      return { success: false, error: `Email failed: ${errorText}` };
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);
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
    const message = `
🚚 *Nouvelle Livraison Inter-Régions*

📦 *Détails:*
• Départ: ${data.departureRegion}
• Destination: ${data.destinationRegion}${data.destinationDepartment ? ` (${data.destinationDepartment})` : ''}
• Prix: ${data.pricingTotal.toLocaleString()} FCFA

👤 *Expéditeur:*
• ${data.senderName}
• ${data.senderPhone}

👤 *Destinataire:*
• ${data.recipientName}
• ${data.recipientPhone}

${data.description ? `📝 *Description:*\n${data.description}\n\n` : ''}
---
_Via Yombal Yoon App_
    `.trim();

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    const formData = new URLSearchParams();
    formData.append('From', TWILIO_WHATSAPP_FROM);
    formData.append('To', `whatsapp:${YOMBAL_WHATSAPP}`);
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
    console.log('WhatsApp sent successfully:', result);
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

    console.log('Processing notification request:', {
      sender: data.senderName,
      destination: data.destinationRegion,
    });

    // Send both notifications in parallel
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
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: success ? 200 : 500,
      }
    );
  } catch (error) {
    console.error('Error in send-intercity-notifications:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
