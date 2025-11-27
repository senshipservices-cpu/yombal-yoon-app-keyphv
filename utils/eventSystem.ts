
/**
 * Event System for Yombal Yoon
 * Provides a simple event-driven architecture for triggering notifications and actions
 */

import { supabase } from '@/app/integrations/supabase/client';

type EventHandler = (data: any) => void | Promise<void>;

interface EventListeners {
  [eventName: string]: EventHandler[];
}

class EventSystem {
  private listeners: EventListeners = {};

  /**
   * Register an event listener
   */
  onEvent(eventName: string, handler: EventHandler): void {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(handler);
    console.log(`✅ Event listener registered for: ${eventName}`);
  }

  /**
   * Trigger an event and call all registered handlers
   */
  async triggerEvent(eventName: string, data: any): Promise<void> {
    console.log(`🔔 Event triggered: ${eventName}`, data);
    
    const handlers = this.listeners[eventName];
    if (!handlers || handlers.length === 0) {
      console.log(`⚠️ No handlers registered for event: ${eventName}`);
      return;
    }

    // Execute all handlers
    for (const handler of handlers) {
      try {
        await handler(data);
      } catch (error) {
        console.error(`❌ Error in event handler for ${eventName}:`, error);
      }
    }
  }

  /**
   * Remove an event listener
   */
  offEvent(eventName: string, handler: EventHandler): void {
    if (!this.listeners[eventName]) return;
    
    this.listeners[eventName] = this.listeners[eventName].filter(h => h !== handler);
    console.log(`🗑️ Event listener removed for: ${eventName}`);
  }

  /**
   * Remove all listeners for an event
   */
  clearEvent(eventName: string): void {
    delete this.listeners[eventName];
    console.log(`🗑️ All listeners cleared for: ${eventName}`);
  }

  /**
   * Remove all listeners
   */
  clearAll(): void {
    this.listeners = {};
    console.log('🗑️ All event listeners cleared');
  }
}

// Create singleton instance
const eventSystem = new EventSystem();

/**
 * Register an event listener
 * @param eventName - Name of the event to listen for
 * @param handler - Function to call when event is triggered
 */
export function onEvent(eventName: string, handler: EventHandler): void {
  eventSystem.onEvent(eventName, handler);
}

/**
 * Trigger an event
 * @param eventName - Name of the event to trigger
 * @param data - Data to pass to event handlers
 */
export async function triggerEvent(eventName: string, data: any): Promise<void> {
  await eventSystem.triggerEvent(eventName, data);
}

/**
 * Remove an event listener
 * @param eventName - Name of the event
 * @param handler - Handler function to remove
 */
export function offEvent(eventName: string, handler: EventHandler): void {
  eventSystem.offEvent(eventName, handler);
}

/**
 * Send an email notification
 * @param options - Email options
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('📧 Sending email to:', options.to);
    console.log('   Subject:', options.subject);

    // Call the Supabase Edge Function to send email
    const { data, error } = await supabase.functions.invoke('send-intercity-notifications', {
      body: {
        emailOnly: true,
        emailTo: options.to,
        emailSubject: options.subject,
        emailHtml: options.html,
      },
    });

    if (error) {
      console.error('❌ Error sending email:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Email sent successfully');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Exception sending email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send a WhatsApp message
 * @param options - WhatsApp options
 */
export async function callWhatsApp(options: {
  phone: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('📱 Sending WhatsApp to:', options.phone);

    // Call the Supabase Edge Function to send WhatsApp
    const { data, error } = await supabase.functions.invoke('send-intercity-notifications', {
      body: {
        whatsappOnly: true,
        whatsappPhone: options.phone,
        whatsappMessage: options.message,
      },
    });

    if (error) {
      console.error('❌ Error sending WhatsApp:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ WhatsApp sent successfully');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Exception sending WhatsApp:', error);
    return { success: false, error: error.message };
  }
}

// Export the event system instance for advanced usage
export { eventSystem };
