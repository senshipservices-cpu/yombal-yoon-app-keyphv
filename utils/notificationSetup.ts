
/**
 * Notification Setup for Inter-Region Deliveries
 * Registers event handlers for email and WhatsApp notifications
 */

import { onEvent, sendEmail, callWhatsApp } from './eventSystem';

/**
 * Initialize notification handlers
 * Call this once when the app starts
 */
export function initializeNotificationHandlers(): void {
  console.log('🔔 Initializing notification handlers...');

  // 📧 Email notification handler
  onEvent('INTER_REGION_DELIVERY_CREATED', async (delivery) => {
    try {
      console.log('📧 Sending email notification for inter-region delivery...');
      
      await sendEmail({
        to: 'woyofaldem@gmail.com',
        subject: 'Nouvelle commande - Livraison Inter Régions',
        html: `
          <h2>Nouvelle livraison inter régions</h2>
          <p><strong>Client :</strong> ${delivery.senderName}</p>
          <p><strong>Téléphone :</strong> ${delivery.senderPhone}</p>
          <p><strong>Départ :</strong> ${delivery.departureCity || delivery.departureRegion}</p>
          <p><strong>Arrivée :</strong> ${delivery.arrivalCity || delivery.destinationRegion}</p>
          ${delivery.weight ? `<p><strong>Poids :</strong> ${delivery.weight} kg</p>` : ''}
          <p><strong>Prix estimé :</strong> ${delivery.price || delivery.pricingTotal} FCFA</p>
          <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Dakar' })}</p>
        `,
      });

      console.log('✅ Email notification sent successfully');
    } catch (error) {
      console.error('❌ Error sending email notification:', error);
    }
  });

  // 📱 WhatsApp notification handler
  onEvent('INTER_REGION_DELIVERY_CREATED', async (delivery) => {
    try {
      console.log('📱 Sending WhatsApp notification for inter-region delivery...');
      
      await callWhatsApp({
        phone: '+221765676486',
        message: `
🚚 Nouvelle commande - Livraison Inter Régions

👤 Client : ${delivery.senderName}
📞 Tel : ${delivery.senderPhone}

📍 Départ : ${delivery.departureCity || delivery.departureRegion}
📍 Arrivée : ${delivery.arrivalCity || delivery.destinationRegion}

${delivery.weight ? `📦 Poids : ${delivery.weight} kg\n` : ''}💰 Prix estimé : ${delivery.price || delivery.pricingTotal} FCFA

🕒 ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Dakar' })}

Merci de traiter cette commande rapidement.
        `.trim(),
      });

      console.log('✅ WhatsApp notification sent successfully');
    } catch (error) {
      console.error('❌ Error sending WhatsApp notification:', error);
    }
  });

  console.log('✅ Notification handlers initialized');
}
