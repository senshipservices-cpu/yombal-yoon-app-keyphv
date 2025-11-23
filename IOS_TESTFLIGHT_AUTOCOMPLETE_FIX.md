
# Fix iOS Testflight Autocomplete Issue - Yombal Yoon

## Problem Summary

1. **iOS Autocomplete Not Working**: Address autocomplete in the "Envoi de colis" module doesn't work on iPhones via Testflight
2. **Form Submission Error**: When manually entering addresses (without autocomplete), submitting the form shows error: "Une erreur est survenue lors de l'envoi de votre demande"
3. **Covoiturage Works**: Autocomplete works fine in the "Covoiturage" module

## Root Causes

### 1. iOS API Key Not Configured
The Google Maps API key for iOS platform is not properly configured in Supabase Edge Function secrets.

### 2. Manual Entry Validation Issue
When users manually type addresses without selecting from autocomplete, the coordinates are never set, causing the form submission to fail.

## Solution

### Step 1: Configure iOS API Key in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **Credentials**
4. Create a new API key or use existing one
5. Click **Edit API key** (pencil icon)
6. Under **Application restrictions**, select **iOS apps**
7. Add your iOS bundle identifier:
   - Bundle ID: `com.yombalyoon.app` (from app.json)
8. Under **API restrictions**, select **Restrict key**
9. Enable these APIs:
   - Places API
   - Geocoding API
   - Distance Matrix API
   - Maps SDK for iOS
10. Click **Save**

### Step 2: Add iOS API Key to Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** > **Secrets**
3. Add a new secret:
   - Name: `GOOGLE_MAPS_API_KEY_IOS`
   - Value: Your iOS API key from Step 1
4. Click **Save**

### Step 3: Redeploy Edge Function

The Edge Function has been updated to properly handle iOS requests. Deploy it:

```bash
supabase functions deploy google-places-proxy
```

### Step 4: Test on Testflight

1. Build a new version of the app with the updated code
2. Upload to Testflight
3. Test the autocomplete in "Envoi de colis" module
4. Verify that:
   - Autocomplete suggestions appear when typing
   - Selecting an address populates the coordinates
   - Form submission works correctly

## Changes Made

### 1. AddressAutocomplete Component
- Added better error handling for iOS platform
- Added state tracking for autocomplete selection
- Improved logging for debugging
- Added platform-specific error messages

### 2. ColisContext
- Added validation for required fields before submission
- Improved error messages
- Added detailed logging for debugging
- Better handling of cases where coordinates are not available

### 3. Edge Function (google-places-proxy)
- Improved platform detection (case-insensitive)
- Better error messages for missing API keys
- Added platform-specific help messages
- Enhanced logging for debugging

## Verification Checklist

- [ ] iOS API key created in Google Cloud Console
- [ ] iOS API key has correct bundle identifier restriction
- [ ] iOS API key has required APIs enabled
- [ ] `GOOGLE_MAPS_API_KEY_IOS` secret added to Supabase
- [ ] Edge Function redeployed
- [ ] New app build uploaded to Testflight
- [ ] Autocomplete tested on iOS device
- [ ] Form submission tested with autocomplete selection
- [ ] Form submission tested with manual entry

## Troubleshooting

### Autocomplete Still Not Working

1. **Check Edge Function Logs**:
   ```bash
   supabase functions logs google-places-proxy
   ```
   Look for:
   - Platform detection: Should show "iOS"
   - API key status: Should show "✅ Using iOS API key"
   - Google API response status

2. **Verify API Key Configuration**:
   - Ensure bundle ID matches exactly: `com.yombalyoon.app`
   - Verify all required APIs are enabled
   - Check API key restrictions are correct

3. **Check App Logs**:
   - Open Xcode console while running Testflight build
   - Look for `[AddressAutocomplete]` log messages
   - Check for error messages from the Edge Function

### Form Submission Error

If you still get "Une erreur est survenue lors de l'envoi de votre demande":

1. **Check Required Fields**:
   - All fields must be filled
   - Sender name, phone
   - Recipient name, phone
   - Departure address
   - Arrival address
   - Description

2. **Check Network Connection**:
   - Ensure device has internet connection
   - Check Supabase project is accessible

3. **Check Supabase Logs**:
   - Go to Supabase Dashboard > Logs
   - Look for errors in the `parcels` table insert

## API Key Security

**Important**: The iOS API key should have these restrictions:
- **Application restrictions**: iOS apps only
- **Bundle ID**: `com.yombalyoon.app`
- **API restrictions**: Only required APIs enabled

This prevents unauthorized use of your API key.

## Support

If issues persist after following this guide:

1. Check the Edge Function logs for detailed error messages
2. Verify all API keys are correctly configured
3. Ensure the app bundle ID matches the one in Google Cloud Console
4. Contact support with:
   - Edge Function logs
   - App console logs
   - Screenshots of the error
   - Device and iOS version

## Related Documentation

- `IOS_API_KEY_SETUP_GUIDE.md` - Detailed iOS API key setup
- `WEB_API_KEY_SETUP_GUIDE.md` - Web API key setup
- `GOOGLE_MAPS_API_FIX.md` - General Google Maps API troubleshooting
- `TESTING_GUIDE.md` - Testing procedures
