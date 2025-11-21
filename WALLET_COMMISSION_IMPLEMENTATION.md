
# Wallet, Commission & Admin Dashboard Implementation

## Overview
This document describes the implementation of the wallet system, commission calculation, withdrawal/recharge functionality, and admin dashboard for the Yombal Yoon application.

## Features Implemented

### 1. Delivery Completion with Commission Calculation (COMMANDE 3 – SOUS-BLOC A)

**File:** `app/colis/delivery-complete-payment.tsx`

**Functionality:**
- Calculates commission (15%) and provider amount when delivery is completed
- Updates parcel status to 'delivered' and payment status to 'paye'
- Credits driver's wallet with `prix_prestataire`
- Debits commission from wallet
- Records 'gain' and 'commission' transactions
- Supports multiple payment methods (Wave, Orange Money, Espèces)

**Commission Calculation:**
```typescript
const DELIVERY_COMMISSION_RATE = 0.15; // 15%
commission_yombal = Math.round(prix_total * 0.15)
prix_prestataire = prix_total - commission_yombal
```

**Database Updates:**
- `parcels` table: status, statut_paiement, mode_paiement, date_paiement, commission_yombal, prix_prestataire
- `wallets` table: solde, total_gagne, total_commissions
- `transactions_wallet` table: gain and commission transactions

### 2. Wallet Screen (COMMANDE 3 – SOUS-BLOC B)

**File:** `app/wallet.tsx` (updated)

**Features:**
- Displays available balance (red if negative)
- Shows debt message if balance is negative
- Displays total earned and total commissions
- Separate statistics for carpooling and delivery
- Transaction history (last 20 transactions)
- Action buttons for withdrawal and recharge

**Balance Display:**
- Available balance prominently displayed
- Pending balance shown separately
- Color-coded (red for negative, green for positive)

### 3. Withdrawal Screen (COMMANDE 3 – SOUS-BLOC B)

**File:** `app/wallet/withdrawal.tsx`

**Features:**
- Form to enter withdrawal amount
- Payment method selection (Wave / Orange Money)
- Phone number input
- Validation checks:
  - Minimum withdrawal: 1000 FCFA
  - Sufficient balance
  - No blocked balance pending
- Creates withdrawal request in `demandes_retrait` table
- Updates wallet: `solde -= montant`, `solde_bloque += montant`
- Confirmation message: "Votre demande sera traitée sous 24-48h"

### 4. Recharge Screen (COMMANDE 3 – SOUS-BLOC B)

**File:** `app/wallet/recharge.tsx`

**Features:**
- Form to enter recharge amount
- Payment method selection (Wave / Orange Money)
- Transaction ID input
- Instructions for completing payment
- Creates recharge request in `recharges_wallet` table
- Status: 'en_attente' (awaiting admin validation)
- Minimum recharge: 500 FCFA

### 5. Admin Dashboard (COMMANDE 3 – SOUS-BLOC C)

**Files:**
- `app/admin/index.tsx` - Main admin dashboard
- `app/admin/withdrawals.tsx` - Withdrawal management
- `app/admin/recharges.tsx` - Recharge management

#### Admin Withdrawal Management

**Features:**
- Lists all withdrawal requests with status 'en_attente'
- Displays: amount, user ID, phone number, payment method, date
- Actions: Approve or Reject

**Approve Workflow:**
1. Admin manually sends money via Wave/OM
2. Updates `demandes_retrait.statut` to 'effectue'
3. Reduces `wallet.solde_bloque` by withdrawal amount
4. Creates 'retrait' transaction in `transactions_wallet`

**Reject Workflow:**
1. Admin provides rejection reason
2. Updates `demandes_retrait.statut` to 'refuse'
3. Restores `wallet.solde` (adds back the amount)
4. Reduces `wallet.solde_bloque`

#### Admin Recharge Management

**Features:**
- Lists all recharge requests with status 'en_attente'
- Displays: amount, user ID, transaction ID, payment method, date
- Actions: Validate or Reject

**Validate Workflow:**
1. Admin verifies payment was received
2. Updates `recharges_wallet.statut` to 'validee'
3. Adds amount to `wallet.solde`
4. Creates 'recharge' transaction in `transactions_wallet`

**Reject Workflow:**
1. Admin provides rejection reason
2. Updates `recharges_wallet.statut` to 'refusee'
3. No wallet changes (money wasn't added)

## Database Schema

### Tables Used

1. **wallets**
   - `id` (uuid, primary key)
   - `user_id` (text, unique)
   - `solde` (integer) - Can be negative
   - `solde_bloque` (integer) - Blocked amounts
   - `total_gagne` (integer) - Total earnings
   - `total_commissions` (integer) - Total commissions paid
   - `created_at`, `updated_at` (timestamps)

2. **transactions_wallet**
   - `id` (uuid, primary key)
   - `wallet_id` (uuid, foreign key)
   - `type` (text) - 'gain', 'commission', 'retrait', 'recharge', 'penalite'
   - `montant` (integer) - Positive for credit, negative for debit
   - `solde_avant`, `solde_apres` (integer)
   - `course_id` (uuid, nullable)
   - `description` (text)
   - `created_at` (timestamp)

3. **demandes_retrait**
   - `id` (uuid, primary key)
   - `wallet_id`, `user_id` (foreign keys)
   - `montant` (integer)
   - `mode_paiement` (text) - 'wave', 'orange_money'
   - `numero_telephone` (text)
   - `statut` (text) - 'en_attente', 'en_cours', 'effectue', 'refuse'
   - `date_demande`, `date_traitement` (timestamps)
   - `traite_par` (uuid) - Admin ID
   - `motif_refus` (text, nullable)

4. **recharges_wallet**
   - `id` (uuid, primary key)
   - `wallet_id`, `user_id` (foreign keys)
   - `montant` (integer)
   - `mode_paiement` (text)
   - `transaction_id` (text) - Wave/OM transaction reference
   - `statut` (text) - 'en_attente', 'validee', 'refusee'
   - `date_demande`, `date_validation` (timestamps)
   - `valide_par` (uuid) - Admin ID
   - `motif_refus` (text, nullable)

5. **parcels** (updated columns)
   - `prix_total` (integer)
   - `commission_yombal` (integer)
   - `prix_prestataire` (integer)
   - `mode_paiement` (text)
   - `statut_paiement` (text)
   - `date_paiement` (timestamp)

## Commission Rates

- **Carpooling:** 12% (already implemented in `app/covoiturage/end-trip-payment.tsx`)
- **Delivery:** 15% (implemented in `app/colis/delivery-complete-payment.tsx`)

## Utility Functions

**File:** `utils/walletUtils.ts`

Key functions:
- `getOrCreateWallet(userId)` - Gets or creates wallet for user
- `creditDriverWallet(userId, amount, courseId, description)` - Credits wallet and records transaction
- `debitCommission(userId, amount, courseId, description, unblockAmount)` - Debits commission and records transaction
- `formatCurrency(amount)` - Formats amount as "X,XXX FCFA"
- `checkDebtStatus(userId)` - Checks if user has too much debt (threshold: -10,000 FCFA)
- `blockCommission(userId, amount)` - Blocks commission amount in wallet

## Navigation Flow

### Driver Delivery Flow
1. Driver accepts delivery request
2. Driver picks up parcel
3. Driver delivers parcel
4. **NEW:** Driver navigates to payment completion screen
5. Driver selects payment method (Wave/OM/Espèces)
6. System calculates commission and provider amount
7. System credits driver wallet and debits commission
8. Driver can view updated balance in wallet

### Withdrawal Flow
1. User navigates to Wallet screen
2. User clicks "Retrait" button
3. User enters amount, selects payment method, enters phone number
4. System validates (minimum amount, sufficient balance, no blocked balance)
5. System creates withdrawal request and blocks amount
6. Admin reviews request in admin dashboard
7. Admin approves (after sending money) or rejects
8. User receives notification

### Recharge Flow
1. User navigates to Wallet screen
2. User clicks "Recharge" button
3. User enters amount, selects payment method, enters transaction ID
4. System creates recharge request
5. User sends money via Wave/OM
6. Admin reviews request in admin dashboard
7. Admin validates (after confirming payment) or rejects
8. User's wallet is credited

## Security Considerations

1. **RLS Policies:** All wallet-related tables have Row Level Security enabled
2. **Validation:** Amount validation on both client and server side
3. **Blocked Balance:** Prevents users from withdrawing money that's pending
4. **Admin Authentication:** Admin screens should be protected (to be implemented)
5. **Transaction Logging:** All wallet operations are logged in `transactions_wallet`

## Testing Checklist

- [ ] Delivery completion calculates correct commission (15%)
- [ ] Driver wallet is credited with correct amount
- [ ] Commission is debited from wallet
- [ ] Transactions are recorded correctly
- [ ] Withdrawal request validation works
- [ ] Withdrawal approval updates wallet correctly
- [ ] Withdrawal rejection restores balance
- [ ] Recharge request creation works
- [ ] Recharge validation credits wallet
- [ ] Admin dashboard displays pending requests
- [ ] Wallet screen shows correct balances
- [ ] Transaction history displays correctly
- [ ] Debt warning appears when balance is negative

## Future Enhancements

1. **Admin Authentication:** Implement proper admin role-based access control
2. **Push Notifications:** Notify users when withdrawal/recharge is processed
3. **Withdrawal History:** Show completed withdrawals in wallet screen
4. **Recharge History:** Show completed recharges in wallet screen
5. **Batch Processing:** Allow admin to process multiple requests at once
6. **Export Reports:** Generate CSV/PDF reports of transactions
7. **Wallet Analytics:** Dashboard with charts and statistics
8. **Automatic Debt Collection:** Automatically deduct debt from future earnings

## Notes

- All amounts are stored in FCFA (integer)
- Commission rates are configurable (currently 12% for carpooling, 15% for delivery)
- Debt threshold is -10,000 FCFA (configurable in `walletUtils.ts`)
- Minimum withdrawal is 1,000 FCFA
- Minimum recharge is 500 FCFA
- Admin screens are accessible at `/admin/` routes
- All screens support both light and dark mode
