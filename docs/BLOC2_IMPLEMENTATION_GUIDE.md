
# BLOC 2 - Implementation Guide
## Content, Logic & Release Process Synchronization

This document describes the implementation of BLOC 2 for Yombal Yoon, ensuring content, logic, and release processes are synchronized across Web, iOS, and Android.

---

## 1. Centralized Text Content System

### Implementation

All text content is now centralized in **`locales/strings.ts`**.

### Key Features

- **Single Source of Truth**: All labels, placeholders, error messages, success messages, and button texts are defined in one place
- **Type-Safe**: TypeScript ensures you can't access non-existent strings
- **Easy to Maintain**: Change text in one place, it updates everywhere
- **i18n Ready**: Structure supports future internationalization

### Usage

```typescript
import { strings } from '@/locales/strings';

// In components
<Text>{strings.common.buttons.save}</Text>
<Text>{strings.covoiturage.publish.title}</Text>
<Text>{strings.errors.network.message}</Text>

// With helper function
import { getString } from '@/locales/strings';
const message = getString('common.buttons.save');

// With hook
import { useStrings } from '@/locales/strings';
const { strings } = useStrings();
```

### Categories

- **common**: Buttons, labels, placeholders, messages, units
- **errors**: Network, validation, autocomplete, OTP, Supabase, payment
- **success**: Success messages for all operations
- **navigation**: Tabs and screen titles
- **covoiturage**: All carpooling-related text
- **colis**: All parcel-related text
- **livraison**: All delivery-related text
- **wallet**: All wallet-related text
- **profile**: All profile-related text
- **notifications**: All notification text
- **settings**: All settings text
- **help**: Help, support, and FAQ text
- **location**: Location permission text
- **emptyStates**: Empty state messages
- **testMode**: Test mode indicators

### Migration Guide

**Before:**
```typescript
<Text>Enregistrer</Text>
<Text>Erreur de connexion</Text>
```

**After:**
```typescript
import { strings } from '@/locales/strings';
<Text>{strings.common.buttons.save}</Text>
<Text>{strings.errors.network.title}</Text>
```

---

## 2. Centralized Configuration System

### Implementation

All app configuration is now centralized in **`config/appConfig.ts`**.

### Key Features

- **Module Configuration**: Define which modules are active and their parameters
- **Commission Configuration**: Centralized commission rates (works with testMode.ts)
- **Payment Configuration**: Available payment methods and limits
- **Feature Flags**: Enable/disable features across all platforms
- **App Limits**: Thresholds for various operations
- **API Configuration**: API settings and timeouts
- **UI Configuration**: Toast durations, animations, refresh settings
- **Contact Configuration**: Support contact information

### Module Configuration

```typescript
import { MODULE_CONFIG, isModuleEnabled, getModuleConfig } from '@/config/appConfig';

// Check if module is enabled
if (isModuleEnabled('covoiturage')) {
  // Show covoiturage features
}

// Get module settings
const config = getModuleConfig('colis');
const maxDistance = config?.settings.maxDistanceKm;
```

### Commission Configuration

```typescript
import { COMMISSION_CONFIG, getCommissionRate } from '@/config/appConfig';

// Get commission rate (respects IS_TEST_MODE from testMode.ts)
const rate = getCommissionRate('covoiturage'); // 0.12 in production, 0 in test mode
```

### Feature Flags

```typescript
import { FEATURE_FLAGS, isFeatureEnabled } from '@/config/appConfig';

// Check if feature is enabled
if (isFeatureEnabled('enablePushNotifications')) {
  // Setup push notifications
}
```

### Payment Methods

```typescript
import { PAYMENT_CONFIG, getPaymentMethod } from '@/config/appConfig';

// Get payment method config
const wave = getPaymentMethod('wave');
if (wave?.enabled) {
  // Show Wave payment option
}
```

### Configuration Validation

The configuration is automatically validated on app start (in development mode):

```typescript
import { validateAppConfig } from '@/config/appConfig';

const validation = validateAppConfig();
if (!validation.valid) {
  console.error('Configuration errors:', validation.errors);
}
```

---

## 3. Functional Alignment of Screens

### Key Screens to Verify

All key screens must have identical fields and flows across Web, iOS, and Android:

#### Covoiturage
- ✅ **Publier un trajet** (`app/covoiturage/publish-ride.tsx`)
- ✅ **Rechercher un trajet** (`app/covoiturage/search-ride.tsx`)
- ✅ **Mes trajets** (`app/covoiturage/my-rides.tsx`)
- ✅ **Mes réservations** (`app/covoiturage/my-reservations.tsx`)

#### Colis
- ✅ **Envoyer un colis** (in `app/(tabs)/colis.tsx`)
- ✅ **Mes colis** (`app/colis/my-parcels.tsx`)
- ✅ **Demandes en attente** (`app/colis/driver-pending-requests.tsx`)
- ✅ **Mes livraisons** (`app/colis/driver-my-deliveries.tsx`)

#### Livraison 14 Régions
- ✅ **Livraison inter-régions** (in `app/(tabs)/livraison.tsx`)

#### Wallet
- ✅ **Mon Wallet** (`app/wallet.tsx`)
- ✅ **Recharger** (`app/wallet/recharge.tsx`)
- ✅ **Retirer** (`app/wallet/withdrawal.tsx`)

#### Profile
- ✅ **Mon Profil** (`app/(tabs)/profile.tsx`)
- ✅ **Modifier profil** (`app/edit-profile.tsx`)

### Verification Checklist

For each screen, verify:

- [ ] Same fields on Web, iOS, Android
- [ ] Same validation rules
- [ ] Same error messages (from `strings.ts`)
- [ ] Same success messages (from `strings.ts`)
- [ ] Same button labels (from `strings.ts`)
- [ ] Same placeholders (from `strings.ts`)
- [ ] Same flow/logic
- [ ] Uses centralized config (from `appConfig.ts`)

---

## 4. QA Process Before Production Release

### Manual QA Checklist

Follow this checklist **BEFORE** each mobile build:

#### A. Test on Web First

1. **Autocomplétion adresses**
   - [ ] Covoiturage: Départ et Arrivée
   - [ ] Envoi de colis: Adresse récupération et livraison
   - [ ] Livraison inter-régions: Sélection régions

2. **OTP** (when enabled)
   - [ ] Enregistrement numéro
   - [ ] Vérification code OTP

3. **Publication & Réservation**
   - [ ] Publier un trajet
   - [ ] Rechercher un trajet
   - [ ] Réserver un trajet
   - [ ] Voir mes trajets
   - [ ] Voir mes réservations

4. **Envoi de colis**
   - [ ] Envoyer un colis
   - [ ] Notification livreur
   - [ ] Accepter/Refuser colis
   - [ ] Suivi du colis
   - [ ] Paiement livraison

5. **Wallet**
   - [ ] Affichage solde
   - [ ] Historique transactions
   - [ ] Demande recharge
   - [ ] Demande retrait

#### B. Test on iOS (TestFlight)

Repeat all tests from section A on iOS TestFlight build.

- [ ] All Web tests pass on iOS
- [ ] No visual differences
- [ ] No functional differences
- [ ] Same error messages
- [ ] Same success messages

#### C. Test on Android (Production/Test Build)

Repeat all tests from section A on Android build.

- [ ] All Web tests pass on Android
- [ ] No visual differences
- [ ] No functional differences
- [ ] Same error messages
- [ ] Same success messages

#### D. Cross-Platform Verification

- [ ] Text content identical (check `strings.ts`)
- [ ] Module configuration identical (check `appConfig.ts`)
- [ ] Commission rates identical (check `testMode.ts`)
- [ ] Payment methods identical
- [ ] Feature flags identical
- [ ] API keys configured correctly

---

## 5. Synchronized Release Pipeline

### Environment Variables

Ensure these environment variables are **IDENTICAL** across all platforms:

```bash
# Supabase
SUPABASE_URL=https://drxtaxepofuoelplgrei.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>

# Google Maps API Keys
GOOGLE_MAPS_API_KEY_SERVER=<server-key>
GOOGLE_MAPS_API_KEY_WEB=<web-key>
GOOGLE_MAPS_API_KEY_ANDROID=<android-key>
GOOGLE_MAPS_API_KEY_IOS=<ios-key>
```

### Release Steps

1. **Validate on Web**
   - [ ] Run all QA tests on Web
   - [ ] Fix any issues
   - [ ] Verify text content (strings.ts)
   - [ ] Verify configuration (appConfig.ts)
   - [ ] Deploy to web

2. **Generate iOS Build**
   - [ ] Ensure same codebase as Web
   - [ ] Verify environment variables
   - [ ] Build for TestFlight
   - [ ] Run QA tests on TestFlight
   - [ ] Fix any platform-specific issues
   - [ ] Submit to App Store

3. **Generate Android Build**
   - [ ] Ensure same codebase as Web
   - [ ] Verify environment variables
   - [ ] Build AAB for Google Play
   - [ ] Run QA tests on Android
   - [ ] Fix any platform-specific issues
   - [ ] Submit to Google Play

4. **Final Verification**
   - [ ] All three platforms have same version number
   - [ ] All three platforms have same features
   - [ ] All three platforms have same text content
   - [ ] All three platforms have same configuration

---

## 6. Configuration Files Reference

### Text Content
- **File**: `locales/strings.ts`
- **Purpose**: All text content (labels, messages, errors, etc.)
- **Usage**: `import { strings } from '@/locales/strings'`

### App Configuration
- **File**: `config/appConfig.ts`
- **Purpose**: Module settings, feature flags, limits, API config
- **Usage**: `import { MODULE_CONFIG, FEATURE_FLAGS } from '@/config/appConfig'`

### Test Mode
- **File**: `config/testMode.ts`
- **Purpose**: Test mode flag and commission calculation
- **Usage**: `import { IS_TEST_MODE, getCommissionRate } from '@/config/testMode'`

### Navigation
- **File**: `config/navigationConfig.ts`
- **Purpose**: Tab configuration and navigation structure
- **Usage**: `import { NAVIGATION_TABS } from '@/config/navigationConfig'`

### Design System
- **File**: `styles/designSystem.ts`
- **Purpose**: Visual design tokens and component styles
- **Usage**: `import { designColors, typography } from '@/styles/designSystem'`

---

## 7. Best Practices

### DO ✅

- Always use `strings.ts` for text content
- Always use `appConfig.ts` for configuration
- Test on Web first, then iOS, then Android
- Verify environment variables are identical
- Use centralized components (YY components)
- Follow the QA checklist before each release
- Document any platform-specific code

### DON'T ❌

- Don't hardcode text strings in components
- Don't create platform-specific logic without documenting
- Don't skip QA testing
- Don't deploy to stores without web validation
- Don't use different configuration values per platform
- Don't modify text in components directly

---

## 8. Troubleshooting

### Text Not Updating

**Problem**: Changed text in `strings.ts` but not seeing changes.

**Solution**:
1. Restart the development server
2. Clear Metro bundler cache: `npx expo start -c`
3. Verify you're importing from the correct path

### Configuration Not Applied

**Problem**: Changed configuration in `appConfig.ts` but not taking effect.

**Solution**:
1. Check if you're using the helper functions (`isModuleEnabled`, `getModuleConfig`)
2. Verify the configuration validation passes (check console logs)
3. Restart the app

### Platform Differences

**Problem**: Feature works on Web but not on iOS/Android.

**Solution**:
1. Check if there are platform-specific files (`.ios.tsx`, `.android.tsx`)
2. Verify environment variables are set correctly
3. Check if the feature requires platform-specific permissions
4. Review platform-specific code in `utils/platformUtils.ts`

---

## 9. Future Enhancements

### Supabase Configuration Table

For dynamic configuration updates without app releases, consider creating a Supabase table:

```sql
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Example settings
INSERT INTO app_settings (key, value, description) VALUES
  ('commission_rates', '{"covoiturage": 0.12, "colis": 0.15}', 'Commission rates'),
  ('feature_flags', '{"enablePushNotifications": true}', 'Feature flags'),
  ('module_config', '{"covoiturage": {"enabled": true}}', 'Module configuration');
```

This would allow updating configuration without app releases, but requires careful consideration of caching and synchronization.

---

## 10. Summary

BLOC 2 implementation provides:

✅ **Centralized Text Content** (`locales/strings.ts`)
- Single source of truth for all text
- Type-safe access
- Easy maintenance

✅ **Centralized Configuration** (`config/appConfig.ts`)
- Module settings
- Feature flags
- Commission rates
- Payment methods
- App limits

✅ **Functional Alignment**
- Same screens across platforms
- Same fields and flows
- Same validation rules

✅ **QA Process**
- Manual checklist
- Test on Web first
- Then iOS, then Android
- Cross-platform verification

✅ **Synchronized Release Pipeline**
- Same codebase
- Same environment variables
- Same configuration
- One version of truth

---

**Remember**: Every change to text or configuration should be made in the centralized files, not in individual components. This ensures consistency across all platforms.
