
// Supabase Edge Function: send-notification-unified
// Unified notification handler for all Covoiturage events
// Handles: in-app, push (Expo/FCM), and WhatsApp (Twilio) notifications

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ================================================
// CONFIGURATION
// ================================================

const IS_PRODUCTION_MODE = Deno.env.get("IS_PRODUCTION_MODE") === "true";
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_WHATSAPP_FROM = Deno.env.get("TWILIO_WHATSAPP_FROM") || "whatsapp:+14155238886";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ================================================
// TYPES
// ================================================

interface NotificationPayload {
  type: string;
  userId: string;
  title: string;
  message: string;
  metadata?: any;
  channels?: ('in_app' | 'push' | 'whatsapp')[];
  phoneNumber?: string;
}

interface NotificationResponse {
  success: boolean;
  notificationId?: string;
  channels: {
    in_app?: { success: boolean; id?: string; error?: string };
    push?: { success: boolean; error?: string };
    whatsapp?: { success: boolean; error?: string };
  };
}

// ================================================
// HELPER FUNCTIONS
// ================================================

/**
 * Create in-app notification
 */
async function createInAppNotification(
  supabase: any,
  userId: string,
  type: string,
  title: string,
  message: string,
  metadata: any
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        metadata: metadata || {},
        is_read: false,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('❌ Error creating in-app notification:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ In-app notification created:', data.id);
    return { success: true, id: data.id };
  } catch (error) {
    console.error('❌ Exception creating in-app notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send push notification via Expo
 */
async function sendPushNotification(
  supabase: any,
  userId: string,
  title: string,
  message: string,
  metadata: any
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get active device tokens for user
    const { data: tokens, error: tokenError } = await supabase
      .from('device_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true);

    if (tokenError) {
      console.error('❌ Error fetching device tokens:', tokenError);
      return { success: false, error: tokenError.message };
    }

    if (!tokens || tokens.length === 0) {
      console.log('⚠️ No active device tokens found for user:', userId);
      return { success: false, error: 'No active device tokens' };
    }

    // Send push notification to each token
    const pushPromises = tokens.map(async (token: any) => {
      try {
        const pushToken = token.expo_push_token || token.fcm_token;
        if (!pushToken) {
          console.log('⚠️ No push token found for device:', token.id);
          return { success: false, tokenId: token.id };
        }

        // Send via Expo Push API
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            to: pushToken,
            title,
            body: message,
            data: metadata || {},
            sound: 'default',
            priority: 'high',
          }),
        });

        const result = await response.json();

        if (result.data && result.data[0] && result.data[0].status === 'error') {
          console.error('❌ Push notification error:', result.data[0].message);
          
          // Deactivate invalid tokens
          if (result.data[0].details && result.data[0].details.error === 'DeviceNotRegistered') {
            await supabase
              .from('device_tokens')
              .update({ active: false })
              .eq('id', token.id);
            console.log('🔄 Deactivated invalid token:', token.id);
          }
          
          return { success: false, tokenId: token.id, error: result.data[0].message };
        }

        console.log('✅ Push notification sent to token:', token.id);
        
        // Update last_used_at
        await supabase
          .from('device_tokens')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', token.id);

        return { success: true, tokenId: token.id };
      } catch (error) {
        console.error('❌ Error sending push to token:', token.id, error);
        return { success: false, tokenId: token.id, error: error.message };
      }
    });

    const results = await Promise.all(pushPromises);
    const successCount = results.filter(r => r.success).length;

    console.log(`📤 Push notifications sent: ${successCount}/${tokens.length}`);
    
    return {
      success: successCount > 0,
      error: successCount === 0 ? 'All push notifications failed' : undefined,
    };
  } catch (error) {
    console.error('❌ Exception sending push notifications:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send WhatsApp notification via Twilio
 */
async function sendWhatsAppNotification(
  phoneNumber: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.log('⚠️ Twilio credentials not configured, skipping WhatsApp');
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    // Format phone number to E.164
    let formattedPhone = phoneNumber;
    if (!phoneNumber.startsWith('+')) {
      if (phoneNumber.startsWith('221')) {
        formattedPhone = '+' + phoneNumber;
      } else {
        formattedPhone = '+221' + phoneNumber.replace(/^0+/, '');
      }
    }

    const whatsappTo = `whatsapp:${formattedPhone}`;

    console.log('📱 Sending WhatsApp to:', whatsappTo);

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: TWILIO_WHATSAPP_FROM,
          To: whatsappTo,
          Body: message,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Twilio error:', data);
      return { success: false, error: data.message || 'Twilio API error' };
    }

    console.log('✅ WhatsApp sent successfully:', data.sid);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending WhatsApp:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Log notification to database
 */
async function logNotification(
  supabase: any,
  userId: string,
  channel: 'in_app' | 'push' | 'whatsapp',
  status: 'success' | 'error',
  payload: any,
  errorMessage?: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('notification_logs')
      .insert({
        user_id: userId,
        channel,
        status,
        payload,
        error_message: errorMessage,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('❌ Error logging notification:', error);
    }
  } catch (error) {
    console.error('❌ Exception logging notification:', error);
  }
}

/**
 * Check if user has WhatsApp opt-in
 */
async function checkWhatsAppOptIn(
  supabase: any,
  userId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('whatsapp_optin')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.log('⚠️ Could not check WhatsApp opt-in for user:', userId);
      return false;
    }

    return data.whatsapp_optin === true;
  } catch (error) {
    console.error('❌ Exception checking WhatsApp opt-in:', error);
    return false;
  }
}

// ================================================
// MAIN HANDLER
// ================================================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: NotificationPayload = await req.json();

    console.log('📥 Processing notification:', {
      type: payload.type,
      userId: payload.userId,
      channels: payload.channels,
      mode: IS_PRODUCTION_MODE ? 'Production' : 'Test',
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const response: NotificationResponse = {
      success: false,
      channels: {},
    };

    // Default channels if not specified
    const channels = payload.channels || ['in_app', 'push'];

    // Check WhatsApp opt-in if WhatsApp channel is requested
    let canSendWhatsApp = false;
    if (channels.includes('whatsapp')) {
      canSendWhatsApp = await checkWhatsAppOptIn(supabase, payload.userId);
      if (!canSendWhatsApp) {
        console.log('⚠️ User has not opted in to WhatsApp notifications');
      }
    }

    // Send in-app notification
    if (channels.includes('in_app')) {
      const inAppResult = await createInAppNotification(
        supabase,
        payload.userId,
        payload.type,
        payload.title,
        payload.message,
        payload.metadata
      );
      response.channels.in_app = inAppResult;
      
      await logNotification(
        supabase,
        payload.userId,
        'in_app',
        inAppResult.success ? 'success' : 'error',
        { type: payload.type, title: payload.title, message: payload.message },
        inAppResult.error
      );

      if (inAppResult.success) {
        response.notificationId = inAppResult.id;
      }
    }

    // Send push notification (only in production mode or if explicitly testing)
    if (channels.includes('push')) {
      if (IS_PRODUCTION_MODE) {
        const pushResult = await sendPushNotification(
          supabase,
          payload.userId,
          payload.title,
          payload.message,
          payload.metadata
        );
        response.channels.push = pushResult;
        
        await logNotification(
          supabase,
          payload.userId,
          'push',
          pushResult.success ? 'success' : 'error',
          { type: payload.type, title: payload.title, message: payload.message },
          pushResult.error
        );
      } else {
        console.log('⚠️ Push notification skipped (test mode)');
        response.channels.push = { success: false, error: 'Test mode - push skipped' };
      }
    }

    // Send WhatsApp notification (only if opted in and in production mode)
    if (channels.includes('whatsapp') && canSendWhatsApp && payload.phoneNumber) {
      if (IS_PRODUCTION_MODE) {
        const whatsappResult = await sendWhatsAppNotification(
          payload.phoneNumber,
          payload.message
        );
        response.channels.whatsapp = whatsappResult;
        
        await logNotification(
          supabase,
          payload.userId,
          'whatsapp',
          whatsappResult.success ? 'success' : 'error',
          { type: payload.type, message: payload.message, phoneNumber: payload.phoneNumber },
          whatsappResult.error
        );
      } else {
        console.log('⚠️ WhatsApp notification skipped (test mode)');
        response.channels.whatsapp = { success: false, error: 'Test mode - WhatsApp skipped' };
      }
    }

    // Determine overall success
    response.success = Object.values(response.channels).some(
      (channel: any) => channel && channel.success
    );

    console.log('✅ Notification processing complete:', response);

    return new Response(
      JSON.stringify({
        ...response,
        mode: IS_PRODUCTION_MODE ? 'production' : 'test',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error in send-notification-unified:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        mode: IS_PRODUCTION_MODE ? 'production' : 'test',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
