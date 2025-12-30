
# 📊 Diagramme de Configuration - Twilio + Production Mode

## 🎯 Vue d'Ensemble de la Configuration

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         YOMBAL YOON APP                                  │
│                    Configuration Actuelle (2025)                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
        ┌───────────────────────┐       ┌───────────────────────┐
        │   OTP VERIFICATION    │       │     COMMISSIONS       │
        │   (productionMode.ts) │       │    (testMode.ts)      │
        └───────────────────────┘       └───────────────────────┘
                    │                               │
        ┌───────────┴───────────┐       ┌───────────┴───────────┐
        │                       │       │                       │
        ▼                       ▼       ▼                       ▼
┌──────────────┐      ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Méthode    │      │     Mode     │ │     Mode     │ │     Taux     │
│              │      │              │ │              │ │              │
│   Twilio     │      │  PRODUCTION  │ │     TEST     │ │   0% (0 F)   │
│ (WhatsApp +  │      │              │ │              │ │              │
│     SMS)     │      │ IS_PROD=true │ │ IS_TEST=true │ │ Covoiturage  │
│              │      │              │ │              │ │   & Colis    │
└──────────────┘      └──────────────┘ └──────────────┘ └──────────────┘
        │                       │               │               │
        └───────────┬───────────┘               └───────┬───────┘
                    │                                   │
                    ▼                                   ▼
        ┌───────────────────────┐       ┌───────────────────────┐
        │   COMPORTEMENT OTP    │       │ COMPORTEMENT WALLET   │
        ├───────────────────────┤       ├───────────────────────┤
        │ ✅ Numéros uniques    │       │ ✅ Commission: 0 FCFA │
        │ ✅ Pas de réutilisa-  │       │ ✅ Prestataire: 100%  │
        │    tion               │       │ ✅ Pas de débit       │
        │ ✅ Sécurité maximale  │       │ ✅ Message "Phase     │
        │ ✅ WhatsApp + SMS     │       │    test"              │
        └───────────────────────┘       └───────────────────────┘
```

---

## 🔄 Flux de Vérification OTP (Production Mode)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FLUX OTP - MODE PRODUCTION                            │
└─────────────────────────────────────────────────────────────────────────┘

    Utilisateur                 App                  Supabase              Twilio
        │                        │                       │                    │
        │  1. Saisit numéro     │                       │                    │
        │  +221XXXXXXXXX        │                       │                    │
        ├──────────────────────>│                       │                    │
        │                        │                       │                    │
        │                        │  2. Appel Edge Fn    │                    │
        │                        │  send-otp-twilio     │                    │
        │                        ├──────────────────────>│                    │
        │                        │                       │                    │
        │                        │                       │  3. Lit env var   │
        │                        │                       │  IS_PRODUCTION_    │
        │                        │                       │  MODE = true       │
        │                        │                       │                    │
        │                        │                       │  4. Génère OTP    │
        │                        │                       │  (ex: 123456)     │
        │                        │                       │                    │
        │                        │                       │  5. Vérifie si    │
        │                        │                       │  numéro existe    │
        │                        │                       │  déjà (PROD)      │
        │                        │                       │                    │
        │                        │                       │  6. Envoie OTP    │
        │                        │                       ├───────────────────>│
        │                        │                       │                    │
        │                        │                       │                    │  7. WhatsApp
        │<───────────────────────────────────────────────────────────────────┤  ou SMS
        │  "Votre code OTP       │                       │                    │
        │   Yombal Yoon est:     │                       │                    │
        │   123456"              │                       │                    │
        │                        │                       │                    │
        │  8. Saisit code        │                       │                    │
        │  123456                │                       │                    │
        ├──────────────────────>│                       │                    │
        │                        │                       │                    │
        │                        │  9. Vérifie OTP      │                    │
        │                        ├──────────────────────>│                    │
        │                        │                       │                    │
        │                        │                       │  10. Vérifie code │
        │                        │                       │  + expiration     │
        │                        │                       │                    │
        │                        │                       │  11. Vérifie      │
        │                        │                       │  unicité numéro   │
        │                        │                       │  (PRODUCTION)     │
        │                        │                       │                    │
        │                        │  12. ✅ Succès       │                    │
        │                        │  "Numéro vérifié"    │                    │
        │<───────────────────────┤                       │                    │
        │                        │                       │                    │
        │  13. Accès app         │                       │                    │
        │                        │                       │                    │

┌─────────────────────────────────────────────────────────────────────────┐
│  IMPORTANT : Si l'utilisateur essaie de réutiliser le même numéro       │
│  avec un autre compte, l'étape 11 bloquera avec l'erreur :              │
│  ❌ "Ce numéro est déjà utilisé par un autre compte"                    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 💰 Flux de Paiement (Mode Test - Commissions 0%)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  FLUX PAIEMENT - MODE TEST (0% COMMISSION)               │
└─────────────────────────────────────────────────────────────────────────┘

    Conducteur              App                  Wallet System
        │                    │                         │
        │  1. Publie trajet  │                         │
        │  Prix: 10 000 F    │                         │
        ├───────────────────>│                         │
        │                    │                         │
        │                    │  2. Calcul commission   │
        │                    │  IS_TEST_MODE = true    │
        │                    │  → Commission = 0%      │
        │                    │  → 0 FCFA               │
        │                    │                         │
        │  3. Affichage      │                         │
        │  "Commission:      │                         │
        │   0 FCFA           │                         │
        │   (Phase test)"    │                         │
        │<───────────────────┤                         │
        │                    │                         │
        │  4. Trajet terminé │                         │
        ├───────────────────>│                         │
        │                    │                         │
        │                    │  5. Crédit wallet       │
        │                    │  Montant: 10 000 F      │
        │                    │  (100% du prix)         │
        │                    ├────────────────────────>│
        │                    │                         │
        │                    │  6. ✅ Wallet crédité  │
        │                    │<────────────────────────┤
        │                    │                         │
        │  7. Notification   │                         │
        │  "Wallet crédité:  │                         │
        │   10 000 FCFA"     │                         │
        │<───────────────────┤                         │
        │                    │                         │

┌─────────────────────────────────────────────────────────────────────────┐
│  COMPARAISON : En mode Production (IS_TEST_MODE = false)                 │
│                                                                          │
│  Prix trajet : 10 000 FCFA                                              │
│  Commission (12%) : 1 200 FCFA                                          │
│  Conducteur reçoit : 8 800 FCFA                                         │
│                                                                          │
│  En mode Test actuel : Conducteur reçoit 10 000 FCFA (100%)            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Configuration des Fichiers

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      STRUCTURE DE CONFIGURATION                          │
└─────────────────────────────────────────────────────────────────────────┘

📁 config/
│
├── 📄 productionMode.ts
│   │
│   ├── IS_PRODUCTION_MODE = true ✅
│   │   │
│   │   ├─> Numéros de téléphone uniques
│   │   ├─> Pas de réutilisation
│   │   ├─> Vérification stricte
│   │   └─> Sécurité maximale
│   │
│   └── TEST_MODE_CONFIG
│       ├─> allowPhoneReuse: false (car IS_PRODUCTION_MODE = true)
│       ├─> otpExpirationMinutes: 10
│       └─> maxOtpAttempts: 5
│
└── 📄 testMode.ts
    │
    ├── IS_TEST_MODE = true ✅
    │   │
    │   ├─> Commission covoiturage: 0% (au lieu de 12%)
    │   ├─> Commission colis: 0% (au lieu de 15%)
    │   ├─> Prestataires reçoivent: 100%
    │   └─> Affichage: "(Phase test - 0%)"
    │
    └── COMMISSION_RATES
        ├─> covoiturage: 0.12 (12%) - DÉSACTIVÉ en mode test
        └─> colis: 0.15 (15%) - DÉSACTIVÉ en mode test

📁 supabase/functions/
│
└── 📄 send-otp-twilio/index.ts
    │
    ├── Lit: Deno.env.get("IS_PRODUCTION_MODE")
    │   │
    │   ├─> Si "true" → Mode Production
    │   │   ├─> Vérifie unicité des numéros
    │   │   ├─> Bloque les doublons
    │   │   └─> Logs: "Mode: Production"
    │   │
    │   └─> Si "false" → Mode Test
    │       ├─> Permet réutilisation
    │       ├─> Nettoie anciennes entrées
    │       └─> Logs: "Mode: Test"
    │
    └── Envoie OTP via Twilio
        ├─> WhatsApp (prioritaire)
        └─> SMS (fallback automatique)
```

---

## 🎯 Matrice de Décision

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    MATRICE DE CONFIGURATION                              │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│   Configuration  │  Développement   │   Beta / Test    │   Production     │
│                  │                  │   Utilisateur    │    Finale        │
├──────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ IS_PRODUCTION_   │      false       │      true ✅     │      true        │
│ MODE             │                  │                  │                  │
├──────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ IS_TEST_MODE     │      true        │      true ✅     │      false       │
│                  │                  │                  │                  │
├──────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ Numéros          │   Réutilisables  │     Uniques      │     Uniques      │
│ téléphone        │                  │                  │                  │
├──────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ Commissions      │       0%         │       0%         │    12-15%        │
│                  │                  │                  │                  │
├──────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ Usage            │   Dev & Tests    │  Tests réels     │  Déploiement     │
│                  │                  │  avec users      │  final           │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘

                                         👆 VOUS ÊTES ICI
```

---

## 🚀 Transition vers Production Complète

```
┌─────────────────────────────────────────────────────────────────────────┐
│              COMMENT PASSER EN PRODUCTION COMPLÈTE                       │
└─────────────────────────────────────────────────────────────────────────┘

Configuration Actuelle (Beta)          Configuration Production
┌─────────────────────────┐            ┌─────────────────────────┐
│ IS_PRODUCTION_MODE=true │            │ IS_PRODUCTION_MODE=true │
│ IS_TEST_MODE=true       │            │ IS_TEST_MODE=false      │
│                         │            │                         │
│ ✅ Numéros uniques      │            │ ✅ Numéros uniques      │
│ ✅ Commission: 0%       │            │ ✅ Commission: 12-15%   │
│ ✅ Prestataires: 100%   │            │ ✅ Prestataires: 85-88% │
└─────────────────────────┘            └─────────────────────────┘
            │                                      ▲
            │                                      │
            │  1. Modifier testMode.ts             │
            │  IS_TEST_MODE = false                │
            │                                      │
            │  2. Redémarrer l'app                 │
            │                                      │
            └──────────────────────────────────────┘

⏱️ Temps estimé : 2 minutes
📝 Fichiers à modifier : 1 (config/testMode.ts)
🔄 Redémarrage requis : Oui
```

---

## ✅ Checklist Visuelle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CHECKLIST DE VÉRIFICATION                        │
└─────────────────────────────────────────────────────────────────────────┘

📱 CONFIGURATION CODE
  ├─ [✅] config/productionMode.ts → IS_PRODUCTION_MODE = true
  ├─ [✅] config/testMode.ts → IS_TEST_MODE = true
  └─ [✅] Edge Function send-otp-twilio déployée (v27)

🔧 CONFIGURATION SUPABASE
  ├─ [⚠️] Variable IS_PRODUCTION_MODE = true (À VÉRIFIER)
  ├─ [⚠️] Edge Function redéployée après modification
  └─ [⚠️] Logs affichent "Mode: Production"

🧪 TESTS
  ├─ [  ] Test OTP réussi
  ├─ [  ] Impossible de réutiliser un numéro
  ├─ [  ] Commissions à 0 FCFA confirmées
  └─ [  ] Workflow complet testé

📚 DOCUMENTATION
  ├─ [✅] CONFIGURATION_COMPLETE_TWILIO_PRODUCTION.md
  ├─ [✅] ACTION_VERIFY_SUPABASE_PRODUCTION_MODE.md
  ├─ [✅] RESUME_CONFIGURATION_FINALE_TWILIO.md
  └─ [✅] QUICK_REFERENCE_CONFIGURATION_ACTUELLE.md
```

---

## 📞 Support Rapide

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         GUIDE DE DÉPANNAGE                               │
└─────────────────────────────────────────────────────────────────────────┘

❓ Problème                          ✅ Solution
├─────────────────────────────────────────────────────────────────────────┤
│ OTP non reçu                      │ Vérifier credentials Twilio         │
│                                   │ Consulter logs Edge Function        │
├─────────────────────────────────────────────────────────────────────────┤
│ Numéro réutilisable               │ Vérifier IS_PRODUCTION_MODE=true    │
│                                   │ dans Supabase + redéployer          │
├─────────────────────────────────────────────────────────────────────────┤
│ Commission ≠ 0 FCFA               │ Vérifier IS_TEST_MODE=true          │
│                                   │ Redémarrer l'application            │
├─────────────────────────────────────────────────────────────────────────┤
│ Logs affichent "Mode: Test"      │ Définir secret Supabase             │
│                                   │ supabase secrets set IS_PROD...=true│
└─────────────────────────────────────────────────────────────────────────┘
```

---

**Configuration :** Production OTP + Test Commissions (Recommandé pour Beta)
**Prochaine étape :** Vérifier variable Supabase → Tester → Déployer ! 🚀
