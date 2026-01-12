# Quick Setup Checklist for Meta API Integration

Use this checklist to track your setup progress.

## Facebook Setup

- [ ] Created Facebook App at developers.facebook.com
- [ ] Added "Facebook Login" product
- [ ] Configured OAuth Redirect URIs:
  - [ ] `pulseos://social-auth`
  - [ ] `exp://YOUR_IP:8081/--/social-auth`
- [ ] Copied Facebook App ID
- [ ] Added test users (for development)
- [ ] Updated `FACEBOOK_APP_ID` in `app/social.tsx`

## Instagram Setup

- [ ] Added "Instagram Basic Display" product to Facebook App
- [ ] Created Instagram App
- [ ] Configured OAuth Redirect URIs (same as Facebook)
- [ ] Added Privacy Policy URL (required)
- [ ] Added Instagram account as tester
- [ ] Accepted tester invitation on Instagram
- [ ] Copied Instagram App ID (Client ID)
- [ ] Updated `INSTAGRAM_CLIENT_ID` in `app/social.tsx`

## App Configuration

- [ ] Verified `scheme: "pulseos"` in `app.json`
- [ ] Installed dependencies: `npm install expo-auth-session expo-crypto`
- [ ] Updated credentials in `app/social.tsx`
- [ ] Tested Facebook connection
- [ ] Tested Instagram connection (requires backend for token exchange)

## Backend Setup (For Instagram)

- [ ] Created backend endpoint for Instagram token exchange
- [ ] Updated `app/social.tsx` to call backend endpoint
- [ ] Tested token exchange flow

## Testing

- [ ] Facebook login works
- [ ] Facebook updates are fetched and displayed
- [ ] Instagram login works (if backend is set up)
- [ ] Instagram updates are fetched and displayed
- [ ] Disconnect functionality works
- [ ] Refresh functionality works
- [ ] Error handling works correctly

## Production Readiness

- [ ] App submitted for Facebook App Review
- [ ] Required permissions approved
- [ ] Privacy Policy URL is live and accessible
- [ ] Terms of Service URL configured (optional)
- [ ] User Data Deletion endpoint implemented
- [ ] Environment variables configured (not hardcoded)
- [ ] Security best practices implemented

---

**Next Steps:**
1. Follow the detailed guide in `META_API_SETUP.md`
2. Update credentials in `app/social.tsx`
3. Test the integration
4. Set up backend for Instagram (if needed)
