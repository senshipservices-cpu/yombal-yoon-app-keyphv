
# 🔧 Fix Google Maps Autocomplete on Android/iOS

## 🚨 Problem

The address autocomplete works perfectly on **Web** but returns **no results on Android/iOS**.

When typing in the address fields on mobile, you see:
- ✅ The debug message "Platform = android" (or ios)
- ❌ No autocomplete suggestions appear
- ❌ Possibly an error message about "REQUEST_DENIED"

## 🔍 Root Cause

The Google Maps API key has **HTTP referrer restrictions** that only allow requests from web browsers. Mobile apps make direct HTTP requests (not from a browser), so Google blocks them.

## ✅ Solution

You need to configure your Google Maps API key to accept requests from mobile apps.

### Option 1: Remove Restrictions (Quick Test)

**⚠️ Only for testing! Not recommended for production.**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your API key
4. Under **Application restrictions**, select **None**
5. Click **Save**

### Option 2: Create Separate Keys (Recommended)

**Best practice: Use different API keys for Web and Mobile**

#### For Web (Current Key)
1. Keep your existing key with HTTP referrer restrictions
2. Add your web domains (e.g., `*.natively.dev/*`, `localhost:*`)

#### For Mobile (New Key)
1. Create a **new API key** in Google Cloud Console
2. Under **Application restrictions**, select **None** (or configure app-specific restrictions)
3. Under **API restrictions**, enable:
   - ✅ Places API
   - ✅ Geocoding API
   - ✅ Distance Matrix API
4. Copy the new API key
5. Update the Edge Function with the new key

**Update `supabase/functions/google-places-proxy/index.ts`:**

```typescript
// Use different keys for web vs mobile
const GOOGLE_MAPS_WEB_KEY = "AIzaSyCyIEHUEYap3t8z_lqy2tCNhHFBhYHTSHQ"; // Web key with referrer restrictions
const GOOGLE_MAPS_MOBILE_KEY = "YOUR_NEW_MOBILE_KEY_HERE"; // Mobile key without restrictions

Deno.serve(async (req) => {
  // ... existing code ...
  
  const platform = req.headers.get('x-platform') || 'unknown';
  
  // Choose the appropriate API key based on platform
  const GOOGLE_MAPS_API_KEY = (platform === 'web') 
    ? GOOGLE_MAPS_WEB_KEY 
    : GOOGLE_MAPS_MOBILE_KEY;
  
  // ... rest of the code ...
});
```

### Option 3: Add Android/iOS App Restrictions (Most Secure)

**For production apps with specific package names:**

#### Android Restrictions
1. Get your app's **package name** (e.g., `com.yourcompany.yombalyoon`)
2. Get your app's **SHA-1 certificate fingerprint**:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
3. In Google Cloud Console:
   - Select **Android apps** under Application restrictions
   - Add your package name and SHA-1 fingerprint
   - Click **Save**

#### iOS Restrictions
1. Get your app's **Bundle ID** (e.g., `com.yourcompany.yombalyoon`)
2. In Google Cloud Console:
   - Select **iOS apps** under Application restrictions
   - Add your Bundle ID
   - Click **Save**

## 🧪 Testing

After making changes:

1. **Wait 5 minutes** for Google's changes to propagate
2. **Restart your app** completely (close and reopen)
3. Test the autocomplete on Android/iOS
4. Check the debug messages:
   - ✅ Should see: `API Status = OK`
   - ✅ Should see suggestions appear
   - ❌ If still failing, check the error message

## 📊 Debugging

The app now shows detailed debug information on mobile:

### Debug Panel (Development Mode)
```
🔧 Debug: Platform = android | API Status = OK
```

### Error Messages
If there's an issue, you'll see:
```
⚠️ [Error message from Google]
Status: REQUEST_DENIED
```

### Console Logs
Check the console for detailed logs:
```
🔍 [AddressAutocomplete] Fetching predictions for: Univ
📱 [AddressAutocomplete] Platform: android
📦 [AddressAutocomplete] API Response status: OK
✅ [AddressAutocomplete] Found 5 predictions
```

## 🔐 Security Best Practices

1. **Never commit API keys to Git**
   - Use environment variables
   - Use Supabase secrets for Edge Functions

2. **Use separate keys for different platforms**
   - Web key: HTTP referrer restrictions
   - Mobile key: App restrictions (package name + SHA-1)

3. **Enable only required APIs**
   - Places API
   - Geocoding API
   - Distance Matrix API

4. **Set up billing alerts**
   - Monitor API usage
   - Set daily quotas

5. **Rotate keys regularly**
   - Change keys every 6-12 months
   - Immediately rotate if compromised

## 📚 Additional Resources

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)
- [Places API Autocomplete](https://developers.google.com/maps/documentation/places/web-service/autocomplete)

## ✅ Checklist

- [ ] Identified the API key restriction issue
- [ ] Removed restrictions OR created separate mobile key
- [ ] Updated Edge Function with new key (if applicable)
- [ ] Enabled required APIs (Places, Geocoding, Distance Matrix)
- [ ] Waited 5 minutes for changes to propagate
- [ ] Tested on Android
- [ ] Tested on iOS
- [ ] Verified autocomplete suggestions appear
- [ ] Checked that coordinates are retrieved correctly
- [ ] Set up proper security restrictions for production

## 🆘 Still Not Working?

If autocomplete still doesn't work after following these steps:

1. **Check the API Status in the debug panel**
   - What status is shown? (OK, REQUEST_DENIED, ZERO_RESULTS, etc.)

2. **Check the console logs**
   - Are requests reaching the Edge Function?
   - What response is Google returning?

3. **Verify API is enabled**
   - Go to Google Cloud Console
   - Check that "Places API" is enabled
   - Check that billing is set up

4. **Check quotas**
   - Verify you haven't exceeded daily quotas
   - Check for any billing issues

5. **Test with a simple curl request**
   ```bash
   curl "https://maps.googleapis.com/maps/api/place/autocomplete/json?input=Univ&key=YOUR_API_KEY&components=country:sn"
   ```

If you see `REQUEST_DENIED` in the curl response, the issue is definitely with the API key configuration.
