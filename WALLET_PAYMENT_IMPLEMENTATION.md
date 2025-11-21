
# Wallet & Payment System Implementation

## Overview
This document describes the implementation of the wallet and payment system for the Yombal Yoon carpooling module, including automatic commission calculation, end-of-trip payment processing, and debt checking.

## Features Implemented

### 1. Automatic Amount Calculation & Storage

**Location:** `utils/walletUtils.ts`, `contexts/CovoiturageContext.tsx`

**Functionality:**
- When a driver publishes a ride, the system automatically calculates:
  - `prix_total` = number of seats × price per seat
  - `commission_yombal` = prix_total × 12% (rounded)
  - `prix_prestataire` = prix_total - commission_yombal

- These amounts are stored in the `carpool_rides` table with:
  - `statut_paiement` = 'en_attente'
  - All calculated amounts

- **Optional:** The commission is blocked in the driver's wallet (`solde_bloque`) to reserve it for future deduction.

**Key Functions:**
- `calculateAmounts(prixTotal)` - Calculates commission and provider amounts
- `blockCommission(userId, commissionAmount)` - Blocks commission in wallet
- `getOrCreateWallet(userId)` - Gets or creates a wallet for a user

### 2. End-of-Trip Payment Screen

**Location:** `app/covoiturage/end-trip-payment.tsx`

**Functionality:**
- Displays a summary of the completed trip:
  - Route (departure → arrival)
  - Total price
  - Yombal Yoon commission (12%)
  - Driver's net amount

- Payment method selection:
  - Wave
  - Orange Money
  - Cash (Espèces)

- Upon payment confirmation:
  1. Updates `carpool_rides` table:
     - `statut_paiement` = 'paye'
     - `mode_paiement` = selected method
     - `date_paiement` = current timestamp
  
  2. Credits driver's wallet:
     - Adds `prix_prestataire` to `solde`
     - Adds `prix_prestataire` to `total_gagne`
     - Inserts transaction with type='gain'
  
  3. Debits commission:
     - Deducts `commission_yombal` from `solde`
     - Deducts from `solde_bloque` if it was blocked
     - Adds to `total_commissions`
     - Inserts transaction with type='commission'
  
  4. Redirects to Wallet screen

**Key Functions:**
- `creditDriverWallet(userId, amount, courseId, description)` - Credits driver wallet
- `debitCommission(userId, commissionAmount, courseId, description, unblockAmount)` - Debits commission

### 3. Debt Check & Ride Blocking

**Location:** `components/DebtBlockModal.tsx`, `app/covoiturage/publish-ride.tsx`

**Functionality:**
- Before publishing a ride, the system checks if the driver's wallet balance is below the debt threshold (-10,000 FCFA)

- If debt is too high:
  - Displays a modal with:
    - Warning icon
    - Debt amount
    - Message: "Vous devez XXX FCFA à Yombal Yoon. Veuillez recharger votre wallet pour continuer."
    - Two buttons:
      - "Annuler" - Closes modal
      - "Recharger mon wallet" - Opens wallet screen

- If debt is acceptable:
  - Allows ride publication to proceed

**Key Functions:**
- `checkDebtStatus(userId)` - Checks if user has too much debt
- Returns: `{ isBlocked, currentBalance, debtAmount }`

**Constants:**
- `DEBT_THRESHOLD` = -10,000 FCFA
- `COMMISSION_RATE` = 0.12 (12%)

## Database Schema

### Tables Used

**wallets:**
- `id` - UUID, primary key
- `user_id` - UUID, unique, references user_profiles
- `solde` - integer (can be negative)
- `solde_bloque` - integer (blocked amounts)
- `total_gagne` - integer (total earnings)
- `total_commissions` - integer (total commissions paid)
- `created_at`, `updated_at` - timestamps

**transactions_wallet:**
- `id` - UUID, primary key
- `wallet_id` - UUID, references wallets
- `type` - text ('gain', 'commission', 'retrait', 'recharge', 'penalite')
- `montant` - integer (positive for credit, negative for debit)
- `solde_avant` - integer
- `solde_apres` - integer
- `course_id` - UUID, nullable (references ride/parcel)
- `description` - text, nullable
- `created_at` - timestamp

**carpool_rides (updated):**
- `prix_total` - integer (total price)
- `commission_yombal` - integer (Yombal commission)
- `prix_prestataire` - integer (driver's net amount)
- `mode_paiement` - text ('wave', 'orange_money', 'especes', 'wallet')
- `statut_paiement` - text ('en_attente', 'paye', 'dispute')
- `date_paiement` - timestamp, nullable
- `preuve_paiement` - text, nullable (URL to payment proof)

## User Flow

### Publishing a Ride
1. Driver fills in ride details (departure, arrival, date, time, seats, price)
2. System validates form
3. System checks phone verification
4. **System checks debt status**
   - If debt > 10,000 FCFA → Show debt modal → Block publication
   - If debt acceptable → Continue
5. System calculates amounts (total, commission, net)
6. System creates ride in database with calculated amounts
7. **System blocks commission in driver's wallet (optional)**
8. Success message displayed

### Completing a Trip
1. Driver navigates to "Mes trajets publiés"
2. Driver clicks "Terminer le trajet" button
3. System displays trip summary with amounts
4. Driver selects payment method (Wave/Orange Money/Cash)
5. Driver confirms payment
6. System processes payment:
   - Updates ride status to 'paye'
   - Credits driver wallet with net amount
   - Debits commission from wallet
   - Records both transactions
7. System redirects to Wallet screen
8. Driver can view updated balance and transaction history

## Navigation

**New Routes:**
- `/covoiturage/end-trip-payment?rideId={id}` - End-of-trip payment screen

**Updated Screens:**
- `/covoiturage/publish-ride` - Added debt checking
- `/covoiturage/my-rides` - Added "Terminer le trajet" button

## Components

**New Components:**
- `DebtBlockModal` - Modal for debt warning
- `utils/walletUtils.ts` - Utility functions for wallet operations

**Updated Components:**
- `CovoiturageContext` - Added automatic amount calculation
- `publish-ride` - Added debt checking before publication
- `my-rides` - Added end-trip button

## Error Handling

- All wallet operations include try-catch blocks
- Errors are logged to console
- User-friendly error messages displayed via Alert
- Non-critical errors (like wallet blocking) don't prevent ride creation
- Database transaction failures are properly handled

## Testing Checklist

- [ ] Publish a ride and verify amounts are calculated correctly
- [ ] Verify commission is blocked in wallet (if enabled)
- [ ] Try to publish a ride with debt > 10,000 FCFA
- [ ] Complete a trip and verify wallet is credited
- [ ] Verify commission is debited from wallet
- [ ] Check transaction history in wallet
- [ ] Test all three payment methods (Wave, Orange Money, Cash)
- [ ] Verify ride status updates correctly
- [ ] Test error scenarios (network failures, etc.)

## Future Enhancements

1. **Parcel Delivery Integration:**
   - Apply same logic to parcel deliveries
   - Use same wallet system
   - Different commission rate (20% for parcels)

2. **Payment Proof Upload:**
   - Allow drivers to upload payment screenshots
   - Store in `preuve_paiement` field

3. **Dispute Resolution:**
   - Implement dispute flow when `statut_paiement` = 'dispute'
   - Admin panel for dispute management

4. **Automatic Wallet Recharge:**
   - Integration with Wave/Orange Money APIs
   - Automatic recharge when debt threshold reached

5. **Commission Adjustment:**
   - Make commission rate configurable
   - Different rates for different regions/times

## Notes

- The commission rate is currently hardcoded at 12% but can be easily changed in `utils/walletUtils.ts`
- The debt threshold is set at -10,000 FCFA but can be adjusted
- Wallet operations are atomic and include proper error handling
- All amounts are stored in FCFA (integer values)
- The system supports negative balances (debt) up to the threshold
