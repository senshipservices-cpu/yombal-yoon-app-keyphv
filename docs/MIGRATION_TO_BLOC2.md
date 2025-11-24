
# Migration Guide: BLOC 2 Implementation
## Updating Existing Code to Use Centralized Systems

This guide helps you migrate existing Yombal Yoon code to use the new centralized text and configuration systems.

---

## Overview

BLOC 2 introduces two main centralized systems:

1. **Text Content System** (`locales/strings.ts`)
2. **Configuration System** (`config/appConfig.ts`)

All existing code should be updated to use these systems instead of hardcoded values.

---

## 1. Migrating Text Content

### Step 1: Identify Hardcoded Strings

Search for hardcoded strings in your components:

```typescript
// ❌ BEFORE - Hardcoded strings
<Text>Enregistrer</Text>
<Text>Erreur de connexion</Text>
<TouchableOpacity><Text>Publier le trajet</Text></TouchableOpacity>
```

### Step 2: Import the Strings System

Add this import at the top of your file:

```typescript
import { strings } from '@/locales/strings';
```

### Step 3: Replace Hardcoded Strings

```typescript
// ✅ AFTER - Using centralized strings
<Text>{strings.common.buttons.save}</Text>
<Text>{strings.errors.network.title}</Text>
<TouchableOpacity><Text>{strings.covoiturage.publish.publish}</Text></TouchableOpacity>
```

### Common Replacements

| Hardcoded String | Centralized String |
|-----------------|-------------------|
| "Enregistrer" | `strings.common.buttons.save` |
| "Annuler" | `strings.common.buttons.cancel` |
| "Confirmer" | `strings.common.buttons.confirm` |
| "Réessayer" | `strings.common.buttons.retry` |
| "Erreur de connexion" | `strings.errors.network.title` |
| "Succès" | `strings.common.messages.success` |
| "Chargement..." | `strings.common.messages.loading` |
| "Nom complet" | `strings.common.labels.fullName` |
| "Téléphone" | `strings.common.labels.phone` |
| "Entrez votre nom" | `strings.common.placeholders.enterName` |

### Example: Migrating a Form

**Before:**
```typescript
<View>
  <Text>Nom complet</Text>
  <TextInput placeholder="Entrez votre nom" />
  
  <Text>Téléphone</Text>
  <TextInput placeholder="Entrez votre numéro" />
  
  <TouchableOpacity>
    <Text>Enregistrer</Text>
  </TouchableOpacity>
</View>
```

**After:**
```typescript
import { strings } from '@/locales/strings';

<View>
  <Text>{strings.common.labels.fullName}</Text>
  <TextInput placeholder={strings.common.placeholders.enterName} />
  
  <Text>{strings.common.labels.phone}</Text>
  <TextInput placeholder={strings.common.placeholders.enterPhone} />
  
  <TouchableOpacity>
    <Text>{strings.common.buttons.save}</Text>
  </TouchableOpacity>
</View>
```

### Example: Migrating Error Messages

**Before:**
```typescript
if (error) {
  Alert.alert('Erreur', 'Impossible de charger les données');
}
```

**After:**
```typescript
import { strings } from '@/locales/strings';

if (error) {
  Alert.alert(
    strings.errors.network.title,
    strings.errors.network.message
  );
}
```

---

## 2. Migrating Configuration

### Step 1: Identify Hardcoded Configuration

Search for hardcoded configuration values:

```typescript
// ❌ BEFORE - Hardcoded configuration
const MAX_SEATS = 8;
const COMMISSION_RATE = 0.12;
const MIN_PRICE = 500;
```

### Step 2: Import the Configuration System

```typescript
import { MODULE_CONFIG, COMMISSION_CONFIG, APP_LIMITS } from '@/config/appConfig';
```

### Step 3: Replace Hardcoded Values

```typescript
// ✅ AFTER - Using centralized configuration
const maxSeats = MODULE_CONFIG.covoiturage.settings.maxSeats;
const commissionRate = COMMISSION_CONFIG.covoiturage.rate;
const minPrice = MODULE_CONFIG.covoiturage.settings.minPricePerSeat;
```

### Common Configuration Replacements

| Hardcoded Value | Centralized Config |
|----------------|-------------------|
| Max seats | `MODULE_CONFIG.covoiturage.settings.maxSeats` |
| Commission rate | `COMMISSION_CONFIG.covoiturage.rate` |
| Min price | `MODULE_CONFIG.covoiturage.settings.minPricePerSeat` |
| Max distance | `MODULE_CONFIG.colis.settings.maxDistanceKm` |
| Price per km | `MODULE_CONFIG.colis.settings.pricePerKm` |
| Min withdrawal | `MODULE_CONFIG.wallet.settings.minWithdrawalAmount` |

### Example: Migrating Module Settings

**Before:**
```typescript
const MAX_SEATS = 8;
const MIN_SEATS = 1;
const MIN_PRICE_PER_SEAT = 500;

function validateRide(seats: number, price: number) {
  if (seats < MIN_SEATS || seats > MAX_SEATS) {
    return 'Nombre de places invalide';
  }
  if (price < MIN_PRICE_PER_SEAT) {
    return 'Prix trop bas';
  }
  return null;
}
```

**After:**
```typescript
import { MODULE_CONFIG } from '@/config/appConfig';
import { strings } from '@/locales/strings';

const config = MODULE_CONFIG.covoiturage.settings;

function validateRide(seats: number, price: number) {
  if (seats < config.minSeats || seats > config.maxSeats) {
    return strings.errors.validation.invalidFormat;
  }
  if (price < config.minPricePerSeat) {
    return strings.errors.validation.mustBeGreaterThan;
  }
  return null;
}
```

### Example: Migrating Feature Flags

**Before:**
```typescript
const ENABLE_PUSH_NOTIFICATIONS = true;
const ENABLE_CHAT = false;

if (ENABLE_PUSH_NOTIFICATIONS) {
  setupPushNotifications();
}
```

**After:**
```typescript
import { FEATURE_FLAGS, isFeatureEnabled } from '@/config/appConfig';

if (isFeatureEnabled('enablePushNotifications')) {
  setupPushNotifications();
}
```

---

## 3. Migrating Commission Calculations

### Before

```typescript
const COMMISSION_RATE = 0.12;

function calculateCommission(total: number) {
  const commission = total * COMMISSION_RATE;
  const driverAmount = total - commission;
  return { commission, driverAmount };
}
```

### After

```typescript
import { getCommissionRate } from '@/config/testMode';

function calculateCommission(total: number, type: 'covoiturage' | 'colis') {
  const rate = getCommissionRate(type);
  const commission = Math.round(total * rate);
  const driverAmount = total - commission;
  return { commission, driverAmount };
}
```

**Note**: The `getCommissionRate` function automatically respects the `IS_TEST_MODE` flag, so commissions will be 0 in test mode and the configured rate in production.

---

## 4. Migrating Payment Methods

### Before

```typescript
const PAYMENT_METHODS = ['wave', 'orange_money', 'especes', 'wallet'];

function renderPaymentMethods() {
  return PAYMENT_METHODS.map(method => (
    <TouchableOpacity key={method}>
      <Text>{method}</Text>
    </TouchableOpacity>
  ));
}
```

### After

```typescript
import { PAYMENT_CONFIG, getPaymentMethod } from '@/config/appConfig';
import { strings } from '@/locales/strings';

function renderPaymentMethods() {
  return Object.entries(PAYMENT_CONFIG.methods)
    .filter(([_, config]) => config.enabled)
    .map(([key, config]) => (
      <TouchableOpacity key={key}>
        <Text>{config.icon} {config.name}</Text>
      </TouchableOpacity>
    ));
}
```

---

## 5. File-by-File Migration Checklist

For each file in your project:

### Components

- [ ] Replace all hardcoded text with `strings.*`
- [ ] Replace all hardcoded config with `MODULE_CONFIG.*` or `FEATURE_FLAGS.*`
- [ ] Import from centralized systems
- [ ] Test that component still works

### Screens

- [ ] Replace screen titles with `strings.navigation.screens.*`
- [ ] Replace form labels with `strings.common.labels.*`
- [ ] Replace placeholders with `strings.common.placeholders.*`
- [ ] Replace button text with `strings.common.buttons.*`
- [ ] Replace error messages with `strings.errors.*`
- [ ] Replace success messages with `strings.success.*`
- [ ] Test all user flows

### Contexts

- [ ] Replace error messages with `strings.errors.*`
- [ ] Replace success messages with `strings.success.*`
- [ ] Replace configuration with `MODULE_CONFIG.*`
- [ ] Test context functionality

### Utils

- [ ] Replace configuration with `MODULE_CONFIG.*` or `APP_LIMITS.*`
- [ ] Replace error messages with `strings.errors.*`
- [ ] Test utility functions

---

## 6. Testing After Migration

After migrating each file:

1. **Visual Test**
   - [ ] All text displays correctly
   - [ ] No missing translations
   - [ ] No broken layouts

2. **Functional Test**
   - [ ] All features work as before
   - [ ] Validation still works
   - [ ] Error handling still works

3. **Cross-Platform Test**
   - [ ] Test on Web
   - [ ] Test on iOS
   - [ ] Test on Android
   - [ ] Verify identical behavior

---

## 7. Common Pitfalls

### Pitfall 1: Forgetting to Import

**Problem:**
```typescript
<Text>{strings.common.buttons.save}</Text>
// Error: strings is not defined
```

**Solution:**
```typescript
import { strings } from '@/locales/strings';
<Text>{strings.common.buttons.save}</Text>
```

### Pitfall 2: Wrong String Path

**Problem:**
```typescript
<Text>{strings.buttons.save}</Text>
// Error: Cannot read property 'save' of undefined
```

**Solution:**
```typescript
<Text>{strings.common.buttons.save}</Text>
// Note: 'common' is required
```

### Pitfall 3: Using Old i18n System

**Problem:**
```typescript
import { useTranslation } from '@/utils/i18n';
const { t } = useTranslation();
<Text>{t('common.buttons.save')}</Text>
```

**Solution:**
```typescript
import { strings } from '@/locales/strings';
<Text>{strings.common.buttons.save}</Text>
```

**Note**: The old `i18n.ts` system is still available for backward compatibility, but new code should use `strings.ts`.

---

## 8. Adding New Strings

If you need a string that doesn't exist in `strings.ts`:

1. **Add it to `locales/strings.ts`** in the appropriate category:

```typescript
export const strings = {
  // ... existing strings
  
  myNewFeature: {
    title: 'My New Feature',
    description: 'This is a new feature',
    button: 'Click Me',
  },
};
```

2. **Use it in your component**:

```typescript
import { strings } from '@/locales/strings';

<Text>{strings.myNewFeature.title}</Text>
<Text>{strings.myNewFeature.description}</Text>
<TouchableOpacity>
  <Text>{strings.myNewFeature.button}</Text>
</TouchableOpacity>
```

---

## 9. Adding New Configuration

If you need configuration that doesn't exist in `appConfig.ts`:

1. **Add it to `config/appConfig.ts`** in the appropriate section:

```typescript
export const MODULE_CONFIG = {
  // ... existing modules
  
  myNewModule: {
    enabled: true,
    name: 'My New Module',
    settings: {
      maxItems: 100,
      timeout: 30000,
    },
  },
};
```

2. **Use it in your code**:

```typescript
import { MODULE_CONFIG } from '@/config/appConfig';

const config = MODULE_CONFIG.myNewModule;
if (config.enabled) {
  // Use config.settings.maxItems, etc.
}
```

---

## 10. Migration Priority

Migrate files in this order:

1. **High Priority** (user-facing text)
   - [ ] Tab screens (`app/(tabs)/*.tsx`)
   - [ ] Main feature screens (covoiturage, colis, livraison)
   - [ ] Wallet screens
   - [ ] Profile screens

2. **Medium Priority** (error handling)
   - [ ] Contexts (`contexts/*.tsx`)
   - [ ] Error components
   - [ ] Form validation

3. **Low Priority** (internal)
   - [ ] Utility functions
   - [ ] Helper components
   - [ ] Admin screens

---

## 11. Verification

After migration is complete:

- [ ] Run the app on Web
- [ ] Run the app on iOS
- [ ] Run the app on Android
- [ ] Verify all text is identical across platforms
- [ ] Verify all configuration is identical across platforms
- [ ] Run the QA checklist (`docs/QA_CHECKLIST.md`)
- [ ] No hardcoded strings remain (search for common French words)
- [ ] No hardcoded configuration remains (search for magic numbers)

---

## 12. Automated Migration Script

You can use this regex pattern to find hardcoded strings:

```regex
<Text>['"]([^'"]+)['"]</Text>
<Text>([^{<>]+)</Text>
placeholder=['"]([^'"]+)['"]
title=['"]([^'"]+)['"]
```

**Note**: Manual review is still required as not all strings should be centralized (e.g., dynamic content, user input).

---

## Summary

✅ **Text Content**: Use `strings.ts` for all text
✅ **Configuration**: Use `appConfig.ts` for all config
✅ **Commissions**: Use `testMode.ts` for commission calculations
✅ **Test**: Verify on Web, iOS, and Android
✅ **Document**: Update this guide if you find new patterns

**Remember**: The goal is a single source of truth for all text and configuration across all platforms.
