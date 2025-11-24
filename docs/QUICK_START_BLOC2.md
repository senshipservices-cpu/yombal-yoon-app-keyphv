
# Quick Start Guide - BLOC 2
## Centralized Text & Configuration Systems

This is a quick reference for developers working with the BLOC 2 centralized systems.

---

## 🚀 Quick Start

### Using Text Content

```typescript
// 1. Import
import { strings } from '@/locales/strings';

// 2. Use in JSX
<Text>{strings.common.buttons.save}</Text>
<TextInput placeholder={strings.common.placeholders.enterName} />
<Button title={strings.common.buttons.confirm} />

// 3. Use in logic
Alert.alert(strings.errors.network.title, strings.errors.network.message);
console.log(strings.success.saved);
```

### Using Configuration

```typescript
// 1. Import
import { MODULE_CONFIG, isModuleEnabled } from '@/config/appConfig';

// 2. Check if module is enabled
if (isModuleEnabled('covoiturage')) {
  // Show covoiturage features
}

// 3. Get module settings
const config = MODULE_CONFIG.covoiturage.settings;
const maxSeats = config.maxSeats;
const minPrice = config.minPricePerSeat;

// 4. Use in validation
if (seats > config.maxSeats) {
  Alert.alert(strings.errors.validation.invalidFormat);
}
```

---

## 📚 Common Patterns

### Form with Labels and Placeholders

```typescript
import { strings } from '@/locales/strings';

<View>
  <Text>{strings.common.labels.fullName}</Text>
  <TextInput 
    placeholder={strings.common.placeholders.enterName}
    value={name}
    onChangeText={setName}
  />
  
  <Text>{strings.common.labels.phone}</Text>
  <TextInput 
    placeholder={strings.common.placeholders.enterPhone}
    value={phone}
    onChangeText={setPhone}
  />
  
  <TouchableOpacity onPress={handleSave}>
    <Text>{strings.common.buttons.save}</Text>
  </TouchableOpacity>
</View>
```

### Error Handling

```typescript
import { strings } from '@/locales/strings';

try {
  await saveData();
  Alert.alert(strings.common.messages.success, strings.success.saved);
} catch (error) {
  console.error('Save error:', error);
  Alert.alert(
    strings.errors.generic.title,
    strings.errors.generic.message
  );
}
```

### Module-Specific Features

```typescript
import { strings } from '@/locales/strings';
import { MODULE_CONFIG } from '@/config/appConfig';

// Covoiturage
<Text>{strings.covoiturage.publish.title}</Text>
const maxSeats = MODULE_CONFIG.covoiturage.settings.maxSeats;

// Colis
<Text>{strings.colis.send.title}</Text>
const maxDistance = MODULE_CONFIG.colis.settings.maxDistanceKm;

// Wallet
<Text>{strings.wallet.balance.available}</Text>
const minWithdrawal = MODULE_CONFIG.wallet.settings.minWithdrawalAmount;
```

### Commission Calculation

```typescript
import { getCommissionRate } from '@/config/testMode';
import { strings } from '@/locales/strings';

const total = 10000;
const rate = getCommissionRate('covoiturage'); // Respects test mode
const commission = Math.round(total * rate);
const driverAmount = total - commission;

<View>
  <Text>{strings.wallet.earnings.totalEarned}: {total} FCFA</Text>
  <Text>{strings.wallet.earnings.commission}: {commission} FCFA</Text>
  <Text>{strings.wallet.earnings.netAmount}: {driverAmount} FCFA</Text>
</View>
```

### Feature Flags

```typescript
import { isFeatureEnabled } from '@/config/appConfig';

// Check if feature is enabled
if (isFeatureEnabled('enablePushNotifications')) {
  setupPushNotifications();
}

if (isFeatureEnabled('enableRatings')) {
  <RatingComponent />
}

if (isFeatureEnabled('enableChat')) {
  <ChatButton />
}
```

### Payment Methods

```typescript
import { PAYMENT_CONFIG } from '@/config/appConfig';
import { strings } from '@/locales/strings';

// Render available payment methods
{Object.entries(PAYMENT_CONFIG.methods)
  .filter(([_, config]) => config.enabled)
  .map(([key, config]) => (
    <TouchableOpacity key={key} onPress={() => selectMethod(key)}>
      <Text>{config.icon} {config.name}</Text>
    </TouchableOpacity>
  ))
}
```

---

## 🎯 String Categories

### Common
- `strings.common.buttons.*` - Button labels
- `strings.common.labels.*` - Form labels
- `strings.common.placeholders.*` - Input placeholders
- `strings.common.messages.*` - General messages
- `strings.common.units.*` - Units (FCFA, km, etc.)

### Errors
- `strings.errors.network.*` - Network errors
- `strings.errors.validation.*` - Validation errors
- `strings.errors.autocomplete.*` - Autocomplete errors
- `strings.errors.otp.*` - OTP errors
- `strings.errors.payment.*` - Payment errors

### Success
- `strings.success.saved` - "Enregistré avec succès"
- `strings.success.updated` - "Mis à jour avec succès"
- `strings.success.sent` - "Envoyé avec succès"

### Modules
- `strings.covoiturage.*` - Carpooling
- `strings.colis.*` - Parcel delivery
- `strings.livraison.*` - Inter-region delivery
- `strings.wallet.*` - Wallet
- `strings.profile.*` - Profile

---

## ⚙️ Configuration Categories

### Module Config
```typescript
MODULE_CONFIG.covoiturage.settings.*
MODULE_CONFIG.colis.settings.*
MODULE_CONFIG.livraison14Regions.settings.*
MODULE_CONFIG.wallet.settings.*
```

### Feature Flags
```typescript
FEATURE_FLAGS.enablePushNotifications
FEATURE_FLAGS.enableRatings
FEATURE_FLAGS.enableWalletRecharge
FEATURE_FLAGS.enableDebugMode
```

### App Limits
```typescript
APP_LIMITS.maxActiveRides
APP_LIMITS.maxActiveParcels
APP_LIMITS.searchResultsLimit
APP_LIMITS.maxImageSizeMB
```

### Payment Config
```typescript
PAYMENT_CONFIG.methods.wave
PAYMENT_CONFIG.methods.orange_money
PAYMENT_CONFIG.methods.wallet
```

---

## 🔍 Finding Strings

### By Category

**Buttons**: `strings.common.buttons.*`
```typescript
save, cancel, confirm, delete, edit, close, back, next, submit, send, retry
```

**Labels**: `strings.common.labels.*`
```typescript
name, fullName, phone, email, address, city, region, date, time, price
```

**Errors**: `strings.errors.*`
```typescript
network.title, network.message
validation.required, validation.invalidPhone
autocomplete.noResults
payment.insufficientFunds
```

**Module-Specific**: `strings.[module].*`
```typescript
covoiturage.publish.title
colis.send.title
wallet.balance.available
profile.personalInfo.title
```

### By Use Case

**Form Validation**:
```typescript
strings.errors.validation.required
strings.errors.validation.invalidPhone
strings.errors.validation.minLength
strings.errors.validation.mustBePositive
```

**Network Errors**:
```typescript
strings.errors.network.title
strings.errors.network.message
strings.errors.network.offline
```

**Success Messages**:
```typescript
strings.success.saved
strings.success.updated
strings.success.sent
strings.success.paymentCompleted
```

---

## 🛠️ Helper Functions

### String Access

```typescript
import { getString } from '@/locales/strings';

// Get string by path
const buttonText = getString('common.buttons.save');
// Returns: "Enregistrer"
```

### Module Check

```typescript
import { isModuleEnabled, getModuleConfig } from '@/config/appConfig';

// Check if enabled
if (isModuleEnabled('covoiturage')) {
  // Module is active
}

// Get full config
const config = getModuleConfig('colis');
if (config) {
  const maxDistance = config.settings.maxDistanceKm;
}
```

### Feature Check

```typescript
import { isFeatureEnabled } from '@/config/appConfig';

if (isFeatureEnabled('enablePushNotifications')) {
  // Feature is enabled
}
```

### Commission Calculation

```typescript
import { getCommissionRate, calculateCommissionAmounts } from '@/config/testMode';

// Get rate (respects test mode)
const rate = getCommissionRate('covoiturage');

// Calculate amounts
const amounts = calculateCommissionAmounts(10000, 'covoiturage');
// Returns: { prixTotal, commissionYombal, prixPrestataire, commissionRate }
```

---

## ⚠️ Common Mistakes

### ❌ DON'T: Hardcode strings

```typescript
<Text>Enregistrer</Text>
<Text>Erreur de connexion</Text>
```

### ✅ DO: Use centralized strings

```typescript
<Text>{strings.common.buttons.save}</Text>
<Text>{strings.errors.network.title}</Text>
```

---

### ❌ DON'T: Hardcode configuration

```typescript
const MAX_SEATS = 8;
const COMMISSION_RATE = 0.12;
```

### ✅ DO: Use centralized config

```typescript
const maxSeats = MODULE_CONFIG.covoiturage.settings.maxSeats;
const rate = getCommissionRate('covoiturage');
```

---

### ❌ DON'T: Create platform-specific logic

```typescript
if (Platform.OS === 'ios') {
  const commission = 0.12;
} else {
  const commission = 0.15;
}
```

### ✅ DO: Use same config for all platforms

```typescript
const commission = getCommissionRate('covoiturage');
// Same on Web, iOS, Android
```

---

## 📖 Full Documentation

- **Implementation Guide**: `docs/BLOC2_IMPLEMENTATION_GUIDE.md`
- **QA Checklist**: `docs/QA_CHECKLIST.md`
- **Migration Guide**: `docs/MIGRATION_TO_BLOC2.md`
- **Summary**: `docs/BLOC2_IMPLEMENTATION_SUMMARY.md`

---

## 🆘 Need Help?

### String not found?
1. Check `locales/strings.ts` for the correct path
2. Use TypeScript autocomplete: `strings.` + Ctrl+Space
3. If missing, add it to `strings.ts`

### Configuration not working?
1. Check `config/appConfig.ts` for the correct key
2. Use helper functions: `isModuleEnabled()`, `getModuleConfig()`
3. Verify configuration validation passes (check console)

### Platform differences?
1. Verify you're using centralized systems
2. Check for platform-specific files (`.ios.tsx`, `.android.tsx`)
3. Review `utils/platformUtils.ts` for platform-specific code

---

## ✅ Checklist for New Features

When adding a new feature:

- [ ] Add all text to `locales/strings.ts`
- [ ] Add configuration to `config/appConfig.ts` (if needed)
- [ ] Use `strings.*` for all text
- [ ] Use `MODULE_CONFIG.*` for all config
- [ ] Test on Web
- [ ] Test on iOS
- [ ] Test on Android
- [ ] Verify identical behavior across platforms

---

**Remember**: Always use centralized systems. Never hardcode text or configuration!
