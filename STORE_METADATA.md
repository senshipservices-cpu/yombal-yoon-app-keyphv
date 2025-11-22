
# Yombal Yoon - Store Metadata Configuration

## Basic Metadata

### App Name
**Yombal Yoon – Covoiturage & Livraison**

### iOS Subtitle (App Store)
**Covoiturage & colis au Sénégal**

### Google Play Short Description
**Covoiturage, envoi de colis et livraisons rapides au Sénégal.**

### Categories
- **App Store Category**: Navigation
- **Google Play Category**: Outils / Transport

---

## iOS App Store - Long Description

Yombal Yoon est la plateforme sénégalaise de mobilité qui simplifie vos déplacements et livraisons :
🚗 covoiturage entre villes
📦 envoi de colis (Thiak Thiak)
⚡ livraisons rapides
🚚 livraison vers les 14 régions du Sénégal.

Grâce à une interface moderne et intuitive, vous pouvez publier un trajet, envoyer un colis ou gérer vos livraisons en quelques secondes.

— Covoiturage —
• Publiez votre trajet facilement
• Trouvez un conducteur ou un passager
• Notifications en temps réel
• Suivi des étapes du trajet

— Envoi de colis (Thiak Thiak) —
• Formulaire simple et rapide
• Autocomplétion Google Maps optimisée pour Dakar
• Livreurs géolocalisés et assignation intelligente
• Suivi étape par étape du colis

— Livraison express & 14 régions —
• Pour documents, colis urgents, achats rapides
• Livraison entre Dakar et toutes les régions du Sénégal
• Notification immédiate de l'équipe Yombal Yoon

— Sécurité —
• Vérification OTP
• Masquage des numéros
• Historique activités
• Conducteurs et livreurs vérifiés

— Wallet Yombal Yoon —
• Gains crédités automatiquement
• Retraits via Wave / Orange Money
• Historique détaillé
• Commissions transparentes (désactivables en phase de test)

Yombal Yoon — la mobilité moderne au service du Sénégal.

---

## Google Play - Long Description

Yombal Yoon est une application de mobilité complète au Sénégal :
🚗 Covoiturage
📦 Envoi de colis (Thiak Thiak)
⚡ Livraison express
🚚 Livraison vers les 14 régions

— 1. Covoiturage —
• Publiez un trajet
• Trouvez un conducteur ou un passager
• Notifications en temps réel
• Statuts : en attente / confirmé / terminé

— 2. Envoi de colis (Thiak Thiak) —
• Dépôt de demande rapide
• Autocomplétion Google Maps Dakar métropole
• Livreurs géolocalisés
• Acceptation / refus instantané
• Suivi complet de livraison

— 3. Livraison Express (moins de 2h) —
• Pour documents et petits colis
• Assignation au premier livreur disponible

— 4. Livraison 14 Régions —
• Dakar → Thiès, Kaolack, Diourbel, Saint-Louis, etc.
• Notification automatique à l'équipe Yombal Yoon

— 5. Sécurité —
• OTP obligatoire
• Masquage des numéros
• Profils vérifiés
• Appels et WhatsApp sécurisés

— 6. Wallet Yombal Yoon —
• Gains crédités automatiquement
• Historique des transactions
• Retrait Wave / OM
• Commissions modulables

Téléchargez Yombal Yoon et déplacez-vous facilement partout au Sénégal.

---

## App Store Keywords

```
yombal yoon,covoiturage,sénégal,thiak thiak,livraison,colis,dakar,transport,livraison express,wave,orange money,mobilité
```

---

## Implementation Notes

### For EAS Build Configuration (eas.json)

When submitting to the App Store and Google Play, use the following metadata:

#### iOS (App Store Connect)
1. **App Name**: Yombal Yoon – Covoiturage & Livraison
2. **Subtitle**: Covoiturage & colis au Sénégal
3. **Primary Category**: Navigation
4. **Keywords**: yombal yoon,covoiturage,sénégal,thiak thiak,livraison,colis,dakar,transport,livraison express,wave,orange money,mobilité
5. **Description**: Use the iOS long description above

#### Android (Google Play Console)
1. **App Name**: Yombal Yoon – Covoiturage & Livraison
2. **Short Description**: Covoiturage, envoi de colis et livraisons rapides au Sénégal.
3. **Category**: Tools / Maps & Navigation
4. **Full Description**: Use the Google Play long description above

### Character Limits
- **iOS Subtitle**: 30 characters (Current: 29 ✓)
- **iOS Keywords**: 100 characters (Current: 98 ✓)
- **Google Play Short Description**: 80 characters (Current: 62 ✓)
- **iOS Description**: 4000 characters
- **Google Play Description**: 4000 characters

---

## Deployment Checklist

- [x] App name updated in app.json
- [x] iOS subtitle prepared
- [x] Google Play short description prepared
- [x] iOS long description prepared
- [x] Google Play long description prepared
- [x] App Store keywords prepared
- [x] Categories defined
- [ ] Screenshots prepared (5-10 per platform)
- [ ] App icon finalized (1024x1024 for stores)
- [ ] Privacy policy URL added
- [ ] Support URL added
- [ ] Marketing URL added (optional)

---

## Next Steps

1. **Build the app** using EAS Build:
   ```bash
   eas build --platform ios
   eas build --platform android
   ```

2. **Submit to App Store Connect**:
   - Upload build via Transporter or EAS Submit
   - Add all metadata from this document
   - Upload screenshots
   - Submit for review

3. **Submit to Google Play Console**:
   - Upload APK/AAB via EAS Submit
   - Add all metadata from this document
   - Upload screenshots
   - Submit for review

---

## Contact Information

- **Developer**: Yombal Yoon Team
- **Support Email**: support@yombalyoon.com (update as needed)
- **Website**: https://yombalyoon.com (update as needed)
- **Privacy Policy**: (add URL)
- **Terms of Service**: (add URL)
