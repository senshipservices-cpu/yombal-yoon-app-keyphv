
# OTP Error Fix Summary

## Problem Identified

The error "erreur lors de l'envoi du code OTP" was caused by **401 Unauthorized** responses from the Supabase Edge Function `send-otp-twilio`.

### Root Cause

The Edge Function has JWT verification enabled (`verify_jwt: true`), but the client code in `OTPContext.tsx` was not sending the required authorization headers.

## Solution Applied

Updated `contexts/OTPContext.tsx` to include the required authorization headers when calling the Edge Function:

```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'apikey': SUPABASE_ANON_KEY,
}
```

## Files Modified

1. **contexts/OTPContext.tsx**
   - Added `Authorization` header with Bearer token
   - Added `apikey` header
   - Both headers now use `SUPABASE_ANON_KEY` from config

2. **components/PhoneVerificationModal.tsx**
   - Enhanced error logging for better debugging
   - Added console logs to track OTP send/verify flow
   - Improved error messages shown to users

## Verification Steps

### 1. Check Twilio Configuration in Supabase

Ensure these secrets are set in your Supabase Edge Function:

- `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token
- `TWILIO_WHATSAPP_NUMBER` - Your Twilio WhatsApp number (format: +1234567890)
- `TWILIO_SMS_NUMBER` - Your Twilio SMS number (optional, used as fallback)

To verify, check the Supabase dashboard:
1. Go to Edge Functions
2. Select `send-otp-twilio`
3. Check the Secrets section

### 2. Test the OTP Flow

1. Open the app
2. Navigate to a screen that triggers phone verification
3. Enter a valid phone number (format: +221XXXXXXXXX)
4. Select WhatsApp or SMS method
5. Click "Envoyer le code"
6. Check the console logs for:
   ```
   📱 Attempting to send OTP: { phone, method, userId }
   📱 OTP send result: { success: true/false, message, method }
   ```

### 3. Monitor Edge Function Logs

Check the Supabase Edge Function logs for:

**Success indicators:**
- ✅ Set (for Twilio credentials)
- 📤 Sending OTP
- ✅ OTP sent successfully via whatsapp/sms
- Status code: 200

**Error indicators:**
- ❌ Missing Twilio credentials
- ❌ Twilio API Error
- Status code: 401, 500

### 4. Database Verification

Check the `phone_verifications` table:

```sql
SELECT * FROM phone_verifications 
ORDER BY created_at DESC 
LIMIT 10;
```

You should see:
- New entries when OTP is sent
- `is_verified` = false initially
- `is_verified` = true after successful verification
- `expires_at` = 10 minutes from creation

## Common Issues & Solutions

### Issue 1: Still getting 401 errors

**Solution:** Clear app cache and restart
```bash
# In Natively
Stop the app and restart it
```

### Issue 2: Twilio credentials not configured

**Error message:** "Configuration Twilio manquante"

**Solution:** Set up Twilio secrets in Supabase:
1. Go to Supabase Dashboard
2. Edge Functions → send-otp-twilio → Secrets
3. Add all required secrets

### Issue 3: WhatsApp not working

**Error message:** "WhatsApp not available, falling back to SMS"

**Solution:** 
- Verify `TWILIO_WHATSAPP_NUMBER` is set correctly
- Ensure the number is WhatsApp-enabled in Twilio
- The system will automatically fallback to SMS if WhatsApp fails

### Issue 4: OTP not received

**Possible causes:**
1. Phone number format incorrect (must start with +)
2. Twilio account not funded
3. Phone number not verified in Twilio (sandbox mode)

**Solution:**
- Check Twilio console for message delivery status
- Verify phone number format: +221XXXXXXXXX
- Check Twilio account balance

## Testing Checklist

- [ ] OTP can be sent via WhatsApp
- [ ] OTP can be sent via SMS
- [ ] OTP verification works correctly
- [ ] Error messages are clear and helpful
- [ ] Phone number is stored after verification
- [ ] Verification status persists across app restarts
- [ ] Expired OTP codes are rejected
- [ ] Invalid OTP codes are rejected
- [ ] Too many attempts are blocked

## Edge Function Endpoints

### Send OTP
```
POST /functions/v1/send-otp-twilio/send
```

**Request:**
```json
{
  "phoneNumber": "+221XXXXXXXXX",
  "method": "whatsapp",
  "userId": "user-id-optional"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Code envoyé par WhatsApp",
  "method": "whatsapp"
}
```

### Verify OTP
```
POST /functions/v1/send-otp-twilio/verify
```

**Request:**
```json
{
  "phoneNumber": "+221XXXXXXXXX",
  "otpCode": "123456",
  "userId": "user-id-optional"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Numéro vérifié avec succès"
}
```

## Security Notes

- OTP codes expire after 10 minutes
- Maximum 5 verification attempts per OTP
- Phone numbers are normalized to international format
- JWT verification ensures only authorized clients can send OTP
- OTP codes are stored securely in the database

## Next Steps

1. Test the OTP flow thoroughly
2. Monitor Edge Function logs for any errors
3. Verify Twilio message delivery in Twilio console
4. Check database for successful verifications
5. Test both WhatsApp and SMS methods

## Support

If issues persist:
1. Check console logs for detailed error messages
2. Review Edge Function logs in Supabase
3. Verify Twilio configuration and account status
4. Ensure phone numbers are in correct format (+221XXXXXXXXX)
