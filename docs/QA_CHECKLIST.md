
# QA Checklist - Yombal Yoon
## Pre-Release Testing Guide

This checklist must be completed **BEFORE** each production release.

---

## Test Environment Setup

- [ ] Web: Running on latest code
- [ ] iOS: TestFlight build from same codebase
- [ ] Android: Production/test build from same codebase
- [ ] All environment variables configured identically

---

## 1. Autocomplétion Adresses

### Web
- [ ] Covoiturage - Départ: Suggestions appear after 3 characters
- [ ] Covoiturage - Arrivée: Suggestions appear after 3 characters
- [ ] Envoi de colis - Récupération: Suggestions appear
- [ ] Envoi de colis - Livraison: Suggestions appear
- [ ] Livraison inter-régions: Region selection works

### iOS
- [ ] Covoiturage - Départ: Same as Web
- [ ] Covoiturage - Arrivée: Same as Web
- [ ] Envoi de colis - Récupération: Same as Web
- [ ] Envoi de colis - Livraison: Same as Web
- [ ] Livraison inter-régions: Same as Web

### Android
- [ ] Covoiturage - Départ: Same as Web
- [ ] Covoiturage - Arrivée: Same as Web
- [ ] Envoi de colis - Récupération: Same as Web
- [ ] Envoi de colis - Livraison: Same as Web
- [ ] Livraison inter-régions: Same as Web

---

## 2. OTP (When Enabled)

### Web
- [ ] Can enter phone number
- [ ] OTP code is sent
- [ ] Can enter OTP code
- [ ] Verification succeeds
- [ ] Error messages are clear

### iOS
- [ ] Same as Web
- [ ] No visual differences
- [ ] Same error messages

### Android
- [ ] Same as Web
- [ ] No visual differences
- [ ] Same error messages

---

## 3. Covoiturage

### Publier un Trajet

#### Web
- [ ] Can enter departure city
- [ ] Can enter arrival city
- [ ] Can select date and time
- [ ] Can enter number of seats
- [ ] Can enter price per seat
- [ ] Can select vehicle type
- [ ] Can add stops (optional)
- [ ] Validation works correctly
- [ ] Success message appears
- [ ] Ride appears in "Mes Trajets"

#### iOS
- [ ] All fields same as Web
- [ ] Same validation
- [ ] Same success message
- [ ] Same behavior

#### Android
- [ ] All fields same as Web
- [ ] Same validation
- [ ] Same success message
- [ ] Same behavior

### Rechercher un Trajet

#### Web
- [ ] Can search by departure
- [ ] Can search by arrival
- [ ] Can filter by date
- [ ] Results display correctly
- [ ] Can view ride details
- [ ] Can make reservation

#### iOS
- [ ] Same as Web

#### Android
- [ ] Same as Web

### Réservation

#### Web
- [ ] Can select number of passengers
- [ ] Total price calculates correctly
- [ ] Can confirm reservation
- [ ] Success message appears
- [ ] Reservation appears in "Mes Réservations"
- [ ] Driver receives notification

#### iOS
- [ ] Same as Web

#### Android
- [ ] Same as Web

### Mes Trajets

#### Web
- [ ] Shows published rides
- [ ] Shows ride details
- [ ] Shows bookings
- [ ] Can accept/refuse bookings
- [ ] Can cancel ride

#### iOS
- [ ] Same as Web

#### Android
- [ ] Same as Web

---

## 4. Envoi de Colis

### Envoyer un Colis

#### Web
- [ ] Can enter sender name
- [ ] Can enter sender phone
- [ ] Can enter recipient name
- [ ] Can enter recipient phone
- [ ] Can enter pickup address (autocomplete)
- [ ] Can enter dropoff address (autocomplete)
- [ ] Can enter description
- [ ] Price calculates correctly
- [ ] Can submit request
- [ ] Success message appears
- [ ] Drivers receive notification

#### iOS
- [ ] All fields same as Web
- [ ] Same validation
- [ ] Same price calculation
- [ ] Same behavior

#### Android
- [ ] All fields same as Web
- [ ] Same validation
- [ ] Same price calculation
- [ ] Same behavior

### Livreur - Demandes en Attente

#### Web
- [ ] Shows pending parcel requests
- [ ] Shows parcel details
- [ ] Can accept request
- [ ] Can refuse request
- [ ] Sender receives notification

#### iOS
- [ ] Same as Web

#### Android
- [ ] Same as Web

### Livreur - Mes Livraisons

#### Web
- [ ] Shows accepted deliveries
- [ ] Can start pickup route
- [ ] Can confirm pickup
- [ ] Can start delivery route
- [ ] Can confirm delivery
- [ ] Payment screen appears

#### iOS
- [ ] Same as Web

#### Android
- [ ] Same as Web

### Suivi du Colis

#### Web
- [ ] Shows current status
- [ ] Shows sender/recipient info
- [ ] Shows addresses
- [ ] Shows price
- [ ] Updates in real-time

#### iOS
- [ ] Same as Web

#### Android
- [ ] Same as Web

### Paiement Livraison

#### Web
- [ ] Shows total amount
- [ ] Shows commission (if not test mode)
- [ ] Shows driver amount
- [ ] Can select payment method
- [ ] Can confirm payment
- [ ] Success message appears
- [ ] Wallet updates correctly

#### iOS
- [ ] Same as Web
- [ ] Same amounts
- [ ] Same commission

#### Android
- [ ] Same as Web
- [ ] Same amounts
- [ ] Same commission

---

## 5. Livraison 14 Régions

### Web
- [ ] Can select departure region
- [ ] Can select destination region
- [ ] Can enter destination city
- [ ] Can enter sender info
- [ ] Can enter recipient info
- [ ] Can enter description
- [ ] Price displays correctly
- [ ] Estimated delivery time shows
- [ ] Can submit request
- [ ] Success message appears

### iOS
- [ ] Same as Web

### Android
- [ ] Same as Web

---

## 6. Wallet

### Affichage

#### Web
- [ ] Shows available balance
- [ ] Shows pending balance
- [ ] Shows total earned
- [ ] Shows commission breakdown
- [ ] Shows transaction history
- [ ] Shows earnings by service type

#### iOS
- [ ] Same as Web
- [ ] Same amounts

#### Android
- [ ] Same as Web
- [ ] Same amounts

### Recharge

#### Web
- [ ] Can enter amount
- [ ] Validates min/max amounts
- [ ] Can select payment method
- [ ] Can enter phone number
- [ ] Can submit request
- [ ] Success message appears
- [ ] Request appears in admin panel

#### iOS
- [ ] Same as Web
- [ ] Same validation

#### Android
- [ ] Same as Web
- [ ] Same validation

### Retrait

#### Web
- [ ] Can enter amount
- [ ] Validates min/max amounts
- [ ] Checks sufficient balance
- [ ] Can select payment method
- [ ] Can enter phone number
- [ ] Can submit request
- [ ] Success message appears
- [ ] Request appears in admin panel

#### iOS
- [ ] Same as Web
- [ ] Same validation

#### Android
- [ ] Same as Web
- [ ] Same validation

---

## 7. Profil

### Web
- [ ] Shows user info
- [ ] Shows roles
- [ ] Can edit profile
- [ ] Can save changes
- [ ] Success message appears
- [ ] Changes persist

### iOS
- [ ] Same as Web

### Android
- [ ] Same as Web

---

## 8. Notifications

### Web
- [ ] Receives ride booking notifications
- [ ] Receives parcel assignment notifications
- [ ] Receives payment notifications
- [ ] Can mark as read
- [ ] Can clear all

### iOS
- [ ] Same as Web
- [ ] Push notifications work (if enabled)

### Android
- [ ] Same as Web
- [ ] Push notifications work (if enabled)

---

## 9. Text Content Verification

- [ ] All text comes from `strings.ts`
- [ ] No hardcoded strings in components
- [ ] Error messages are identical across platforms
- [ ] Success messages are identical across platforms
- [ ] Button labels are identical across platforms
- [ ] Placeholders are identical across platforms

---

## 10. Configuration Verification

- [ ] Module configuration is identical (`appConfig.ts`)
- [ ] Commission rates are identical (`testMode.ts`)
- [ ] Feature flags are identical (`appConfig.ts`)
- [ ] Payment methods are identical (`appConfig.ts`)
- [ ] App limits are identical (`appConfig.ts`)

---

## 11. Environment Variables

- [ ] SUPABASE_URL is identical
- [ ] SUPABASE_ANON_KEY is identical
- [ ] GOOGLE_MAPS_API_KEY_SERVER is set
- [ ] GOOGLE_MAPS_API_KEY_WEB is set
- [ ] GOOGLE_MAPS_API_KEY_ANDROID is set
- [ ] GOOGLE_MAPS_API_KEY_IOS is set

---

## 12. Visual Consistency

### Web
- [ ] Colors match design system
- [ ] Fonts are consistent
- [ ] Spacing is consistent
- [ ] Icons are correct
- [ ] Buttons are styled correctly
- [ ] Cards have proper shadows

### iOS
- [ ] Same visual appearance as Web
- [ ] Safe areas respected
- [ ] Navigation bar correct
- [ ] Tab bar correct

### Android
- [ ] Same visual appearance as Web
- [ ] Status bar padding correct
- [ ] Navigation correct
- [ ] Tab bar correct

---

## 13. Performance

### Web
- [ ] Pages load quickly
- [ ] No console errors
- [ ] No console warnings
- [ ] Autocomplete is responsive
- [ ] Images load correctly

### iOS
- [ ] App launches quickly
- [ ] No crashes
- [ ] Smooth animations
- [ ] No memory leaks

### Android
- [ ] App launches quickly
- [ ] No crashes
- [ ] Smooth animations
- [ ] No memory leaks

---

## 14. Error Handling

### Web
- [ ] Network errors show user-friendly messages
- [ ] Validation errors are clear
- [ ] Can retry failed operations
- [ ] Error messages from `strings.ts`

### iOS
- [ ] Same error handling as Web
- [ ] Same error messages

### Android
- [ ] Same error handling as Web
- [ ] Same error messages

---

## 15. Edge Cases

- [ ] Works with slow internet
- [ ] Works with no internet (shows error)
- [ ] Handles empty states correctly
- [ ] Handles very long text
- [ ] Handles special characters
- [ ] Handles multiple rapid clicks
- [ ] Handles back button correctly

---

## 16. Final Checks

- [ ] Version number is identical across platforms
- [ ] Build numbers are correct
- [ ] App icons are correct
- [ ] Splash screens are correct
- [ ] App names are correct
- [ ] No debug code left in production
- [ ] No console.logs in production (or minimal)
- [ ] Test mode flag is set correctly

---

## Sign-Off

### Web Testing
- Tester Name: _______________
- Date: _______________
- All tests passed: [ ] Yes [ ] No
- Issues found: _______________

### iOS Testing
- Tester Name: _______________
- Date: _______________
- All tests passed: [ ] Yes [ ] No
- Issues found: _______________

### Android Testing
- Tester Name: _______________
- Date: _______________
- All tests passed: [ ] Yes [ ] No
- Issues found: _______________

### Final Approval
- Approved by: _______________
- Date: _______________
- Ready for production: [ ] Yes [ ] No

---

**Note**: All issues must be resolved before production release. If any test fails, fix the issue and re-run the entire checklist.
