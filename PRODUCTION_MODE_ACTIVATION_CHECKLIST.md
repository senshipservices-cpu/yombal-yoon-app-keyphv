
# ✅ Production Mode Activation Checklist

## Quick Action Items

### 1. Verify Application Configuration ✅

- [x] `IS_PRODUCTION_MODE = true` in `config/productionMode.ts`
- [x] `IS_TEST_MODE = true` in `config/testMode.ts` (commissions at 0 FCFA)
- [x] Phone verification enabled
- [x] OTP system configured
- [x] Build configuration ready

### 2. Set Supabase Environment Variable 🔄

**Action Required:** Set the production mode environment variable in Supabase.

#### Via Supabase Dashboard:

```
1. Go to: https://supabase.com/dashboard/project/drxtaxepofuoelplgrei
2. Click: Settings > Edge Functions > Secrets
3. Add/Update secret:
   Name: IS_PRODUCTION_MODE
   Value: true
4. Click: Save
```

#### Via Supabase CLI:

```bash
supabase login
supabase link --project-ref drxtaxepofuoelplgrei
supabase secrets set IS_PRODUCTION_MODE=true
```

### 3. Redeploy Edge Function 🔄

**Action Required:** Redeploy the OTP Edge Function to apply the new configuration.

```bash
# Redeploy the function
supabase functions deploy send-otp-twilio

# Verify deployment
supabase functions list

# Check logs
supabase functions logs send-otp-twilio --follow
```

### 4. Test Production Mode 🔄

**Action Required:** Verify that production mode is active.

#### Test A: Send OTP

```bash
curl -X POST \
  https://drxtaxepofuoelplgrei.supabase.co/functions/v1/send-otp-twilio \
  -H "Content-Type: application/json" \
  -d '{"action":"send","phoneNumber":"+221771234567","method":"whatsapp"}'
```

**Expected:** Response should contain `"mode": "production"` (not "test")

#### Test B: Check Logs

Look for: `[Mode: Production]` in the Edge Function logs

#### Test C: Test in App

Success messages should NOT contain "(Mode Test)"

### 5. Verify Twilio Production (Optional) 🔄

**Action Required:** If you want to use Twilio in production mode (not sandbox).

See: `TWILIO_PRODUCTION_SETUP.md` for detailed instructions.

**Quick Steps:**
1. Upgrade Twilio account (add payment method)
2. Get WhatsApp Business number (request approval)
3. Update Supabase secrets with production credentials
4. Redeploy Edge Function

### 6. Build Production Versions 🔄

**Action Required:** Build production versions for iOS and Android.

```bash
# Android (Google Play)
eas build --platform android --profile production

# iOS (App Store)
eas build --platform ios --profile production

# Both platforms
eas build --platform all --profile production
```

### 7. Submit to Stores 🔄

**Action Required:** Submit builds to App Store and Google Play.

#### iOS (App Store Connect)

```bash
eas submit --platform ios --profile production
```

Or manually via: https://appstoreconnect.apple.com

#### Android (Google Play Console)

```bash
eas submit --platform android --profile production
```

Or manually via: https://play.google.com/console

---

## Verification Checklist

### Application Code ✅

- [x] `IS_PRODUCTION_MODE = true` in code
- [x] Commissions set to 0 FCFA (as requested)
- [x] Phone verification enabled
- [x] OTP system configured
- [x] Security features enabled

### Supabase Configuration 🔄

- [ ] `IS_PRODUCTION_MODE=true` set in Supabase secrets
- [ ] Edge Function redeployed
- [ ] Logs show "Production" mode
- [ ] Test OTP send successful
- [ ] Test OTP verify successful

### Twilio Configuration (Optional) 🔄

- [ ] Twilio account upgraded (if needed)
- [ ] WhatsApp Business number approved (if needed)
- [ ] Production credentials configured (if needed)
- [ ] Test messages sent successfully (if needed)

### Build & Deployment 🔄

- [ ] Android production build created
- [ ] iOS production build created
- [ ] Builds tested on physical devices
- [ ] Android submitted to Google Play
- [ ] iOS submitted to App Store

---

## Status Summary

| Component | Status | Action Required |
|-----------|--------|-----------------|
| Application Code | ✅ Complete | None |
| Supabase Secret | 🔄 Pending | Set `IS_PRODUCTION_MODE=true` |
| Edge Function | 🔄 Pending | Redeploy after secret set |
| Testing | 🔄 Pending | Test after redeployment |
| Twilio Production | 🔄 Optional | See TWILIO_PRODUCTION_SETUP.md |
| Production Builds | 🔄 Pending | Run EAS build commands |
| Store Submission | 🔄 Pending | Submit after builds complete |

---

## Quick Commands

```bash
# Set Supabase secret
supabase secrets set IS_PRODUCTION_MODE=true

# Redeploy Edge Function
supabase functions deploy send-otp-twilio

# Check logs
supabase functions logs send-otp-twilio --follow

# Build production
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

---

## Timeline Estimate

| Task | Time | Status |
|------|------|--------|
| Set Supabase secret | 2 minutes | 🔄 Pending |
| Redeploy Edge Function | 3 minutes | 🔄 Pending |
| Test production mode | 5 minutes | 🔄 Pending |
| Upgrade Twilio (optional) | 1-3 days | 🔄 Optional |
| Build production | 20-40 minutes | 🔄 Pending |
| Submit to stores | 10 minutes | 🔄 Pending |
| Store review | 1-7 days | 🔄 Pending |

**Total Time (excluding store review):** ~30-50 minutes  
**Total Time (with Twilio upgrade):** 1-3 days  
**Total Time (with store review):** 2-10 days

---

## Next Steps

1. **Immediate (5 minutes):**
   - Set `IS_PRODUCTION_MODE=true` in Supabase
   - Redeploy Edge Function
   - Test production mode

2. **Short-term (1 hour):**
   - Build production versions
   - Test builds on physical devices
   - Submit to stores

3. **Optional (1-3 days):**
   - Upgrade Twilio to production
   - Configure WhatsApp Business
   - Update Twilio credentials

4. **Long-term (1-7 days):**
   - Wait for store approval
   - Monitor initial user feedback
   - Adjust as needed

---

## Support

- **Supabase:** https://supabase.com/dashboard/project/drxtaxepofuoelplgrei
- **Twilio:** https://console.twilio.com
- **EAS:** https://expo.dev/accounts/yombalyoon
- **Email:** senshipservices@gmail.com

---

**Status:** ✅ Application code ready for production  
**Next Action:** Set Supabase environment variable  
**Estimated Time:** 5 minutes  
**Priority:** High

---

*Last Updated: January 2025*
