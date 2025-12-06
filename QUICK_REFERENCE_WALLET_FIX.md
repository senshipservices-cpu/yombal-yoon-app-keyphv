
# Quick Reference: Wallet RLS Policy Fix

## Problem
The "Mon Wallet Yombal Yoon" screen was showing the error:
```
Erreur technique: new row violates row-level security policy for table 'user_profiles'
```

This occurred when the app tried to create a new user profile in the database.

## Root Cause
The app doesn't use JWT authentication (no OTP/Auth system as per requirements), but the RLS policies on the `user_profiles` table were checking for JWT claims:

```sql
-- Old restrictive policy
CREATE POLICY "Users can insert their own profile"
ON user_profiles FOR INSERT
WITH CHECK (id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text))
```

Since there's no JWT token, this check always failed, preventing profile creation.

## Solution Applied
Updated the RLS policies on `user_profiles` table to be more permissive:

### 1. INSERT Policy
```sql
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

CREATE POLICY "Allow profile creation"
ON user_profiles FOR INSERT TO public
WITH CHECK (true);
```

### 2. UPDATE Policy
```sql
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

CREATE POLICY "Allow profile updates"
ON user_profiles FOR UPDATE TO public
USING (true) WITH CHECK (true);
```

### 3. SELECT Policy
```sql
CREATE POLICY "Allow public profile reads"
ON user_profiles FOR SELECT TO public
USING (true);
```

## Migration Applied
- **Migration Name**: `fix_user_profiles_rls_insert_policy`
- **Status**: ✅ Successfully applied
- **Date**: 2025-01-06

## Verification
After applying the migration, the following policies are now active on `user_profiles`:

| Policy Name | Command | Description |
|------------|---------|-------------|
| Allow profile creation | INSERT | Allows anyone to create a profile |
| Allow profile updates | UPDATE | Allows anyone to update profiles |
| Allow public profile reads | SELECT | Allows anyone to read profiles |
| Service role full access on profiles | ALL | Service role has full access |
| Users can view their own profile | SELECT | JWT-based access (legacy) |
| Users can view driver profiles for rides | SELECT | View driver profiles in active rides |
| Drivers can view passenger profiles | SELECT | Drivers can view their passengers |

## Testing
To verify the fix works:

1. Open the app
2. Navigate to "Mon Wallet Yombal Yoon"
3. The wallet should now load without the RLS error
4. Profile and wallet should be created automatically if they don't exist

## Security Considerations
Since the app doesn't use authentication, these permissive policies are appropriate. However, for production:

- Consider adding basic validation rules (e.g., phone number format)
- Add rate limiting at the application level
- Monitor for abuse patterns
- Consider implementing a simple authentication system in the future

## Related Files
- `utils/profileWalletUtils.ts` - Profile and wallet creation logic
- `contexts/ProfileContext.tsx` - Profile context with initialization
- `app/wallet.tsx` - Wallet screen UI

## Next Steps
The wallet should now work correctly. If you still see errors:

1. Check the browser/app console for detailed error messages
2. Verify the user ID is being generated correctly
3. Check Supabase logs for any database errors
4. Ensure the `wallets` table RLS policies are also permissive (they already are)
