# Meta API Integration Setup Guide for PulseOS

This guide will walk you through setting up Facebook and Instagram API integration for PulseOS.

## Prerequisites

- A Facebook account
- An Instagram account (for Instagram Basic Display)
- Access to Facebook Developer Console
- Your Expo app running (for testing redirect URIs)

---

## Part 1: Facebook App Setup

### Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **"My Apps"** in the top right corner
3. Click **"Create App"**
4. Select **"Consumer"** as the app type (or "Business" if you need business features)
5. Fill in the app details:
   - **App Name**: PulseOS (or your preferred name)
   - **App Contact Email**: Your email address
   - **Business Account** (optional): Leave blank or select if applicable
6. Click **"Create App"**
7. Complete the security check if prompted

### Step 2: Add Facebook Login Product

1. In your app dashboard, find **"Add Products to Your App"** section
2. Click **"Set Up"** on the **"Facebook Login"** card
3. Select **"Web"** as the platform (required for OAuth redirect)
4. You'll be taken to the Facebook Login settings page

### Step 3: Configure Facebook Login Settings

1. In the **Facebook Login > Settings** page, scroll to **"Valid OAuth Redirect URIs"**
2. Add the following redirect URIs:
   ```
   pulseos://social-auth
   exp://192.168.1.180:8081/--/social-auth
   exp://localhost:8081/--/social-auth
   ```
   Note: Replace `192.168.1.180` with your actual local IP address when testing
3. Click **"Save Changes"**

### Step 4: Get Your Facebook App Credentials

1. Go to **Settings > Basic** in your app dashboard
2. Note down:
   - **App ID** (you'll need this)
   - **App Secret** (keep this secure - you may need it for backend token exchange)
3. Under **"App Domains"**, you can add your domain if you have one (optional for mobile)

### Step 5: Configure App Review (For Production)

For testing, you can add yourself as a test user:
1. Go to **Roles > Test Users**
2. Click **"Add Test Users"**
3. Create test users for testing

For production, you'll need to:
1. Submit your app for review
2. Request permissions: `public_profile`, `email`, `user_posts`
3. Complete the App Review process

---

## Part 2: Instagram Basic Display Setup

### Step 1: Add Instagram Basic Display Product

1. In your Facebook App dashboard, go to **"Add Products to Your App"**
2. Find **"Instagram Basic Display"** and click **"Set Up"**
3. You'll be taken to the Instagram Basic Display configuration

### Step 2: Create Instagram App

1. In the Instagram Basic Display settings, you'll see **"Create New App"**
2. Click **"Create New App"**
3. Fill in:
   - **App Name**: PulseOS Instagram
   - **Contact Email**: Your email
   - **Privacy Policy URL**: (Required) You'll need to host a privacy policy
   - **Terms of Service URL**: (Optional)
   - **User Data Deletion URL**: (Optional but recommended)
4. Click **"Create App"**

### Step 3: Configure Instagram OAuth Redirect URIs

1. In the Instagram App settings, find **"Valid OAuth Redirect URIs"**
2. Add the same redirect URIs as Facebook:
   ```
   pulseos://social-auth
   exp://192.168.1.180:8081/--/social-auth
   exp://localhost:8081/--/social-auth
   ```
3. Click **"Save Changes"**

### Step 4: Get Instagram App Credentials

1. In the Instagram App settings, note down:
   - **Instagram App ID** (Client ID)
   - **Instagram App Secret** (keep secure)

### Step 5: Create Test Users (For Development)

1. Go to **"User Token Generator"** in Instagram Basic Display
2. Click **"Add or Remove Instagram Testers"**
3. Add your Instagram account as a tester
4. Accept the invitation on your Instagram account
5. Go back to **"User Token Generator"**
6. Click **"Generate Token"** for your test user
7. Save this token for testing (it's a long-lived token)

---

## Part 3: Update Your PulseOS App Configuration

### Step 1: Update app.json

1. Open `app.json` in your project
2. Ensure the scheme is set correctly:
   ```json
   {
     "expo": {
       "scheme": "pulseos",
       ...
     }
   }
   ```

### Step 2: Update Social Screen with Credentials

1. Open `app/social.tsx`
2. Find these lines (around line 35-36):
   ```typescript
   const FACEBOOK_APP_ID = 'YOUR_FACEBOOK_APP_ID';
   const INSTAGRAM_CLIENT_ID = 'YOUR_INSTAGRAM_CLIENT_ID';
   ```
3. Replace with your actual credentials:
   ```typescript
   const FACEBOOK_APP_ID = '1234567890123456'; // Your Facebook App ID
   const INSTAGRAM_CLIENT_ID = '9876543210987654'; // Your Instagram App ID
   ```

### Step 3: Update Redirect URI (if needed)

The redirect URI is automatically generated, but you can verify it matches your Facebook/Instagram settings:

```typescript
const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'pulseos',
  path: 'social-auth',
});
```

This will generate: `pulseos://social-auth`

---

## Part 4: Environment Variables (Recommended for Security)

For better security, use environment variables instead of hardcoding credentials:

### Step 1: Install dotenv (if not already installed)

```bash
npm install dotenv
```

### Step 2: Create .env file

Create a `.env` file in the root of your project:

```env
FACEBOOK_APP_ID=your_facebook_app_id_here
INSTAGRAM_CLIENT_ID=your_instagram_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here
INSTAGRAM_APP_SECRET=your_instagram_app_secret_here
```

### Step 3: Update social.tsx to use environment variables

```typescript
import Constants from 'expo-constants';

const FACEBOOK_APP_ID = Constants.expoConfig?.extra?.facebookAppId || 'YOUR_FACEBOOK_APP_ID';
const INSTAGRAM_CLIENT_ID = Constants.expoConfig?.extra?.instagramClientId || 'YOUR_INSTAGRAM_CLIENT_ID';
```

### Step 4: Update app.json to include extra config

```json
{
  "expo": {
    "extra": {
      "facebookAppId": process.env.FACEBOOK_APP_ID,
      "instagramClientId": process.env.INSTAGRAM_CLIENT_ID
    }
  }
}
```

---

## Part 5: Instagram Token Exchange (Backend Required)

Instagram Basic Display requires server-side token exchange. You have two options:

### Option A: Use a Backend Service

1. Create an API endpoint on your backend:
   ```javascript
   // Example endpoint: POST /api/instagram/token
   app.post('/api/instagram/token', async (req, res) => {
     const { code } = req.body;
     const response = await fetch('https://api.instagram.com/oauth/access_token', {
       method: 'POST',
       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
       body: new URLSearchParams({
         client_id: INSTAGRAM_CLIENT_ID,
         client_secret: INSTAGRAM_APP_SECRET,
         grant_type: 'authorization_code',
         redirect_uri: 'pulseos://social-auth',
         code: code,
       }),
     });
     const data = await response.json();
     res.json(data);
   });
   ```

2. Update `app/social.tsx` to call your backend:
   ```typescript
   if (result.type === 'success' && result.params.code) {
     const tokenResponse = await fetch('YOUR_BACKEND_URL/api/instagram/token', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ code: result.params.code }),
     });
     const tokenData = await tokenResponse.json();
     // Use tokenData.access_token
   }
   ```

### Option B: Use Expo Serverless Functions (if available)

If you're using Expo's serverless functions, create an API route for token exchange.

---

## Part 6: Testing the Integration

### Step 1: Test Facebook Connection

1. Run your app: `npm start` or `npx expo start`
2. Navigate to the Social category on the home screen
3. Tap **"Connect"** on the Facebook card
4. You should see Facebook's OAuth login page
5. Log in with a test user or your account
6. Grant permissions
7. You should be redirected back to the app
8. Facebook should show as "Connected"
9. Updates should start appearing

### Step 2: Test Instagram Connection

1. Tap **"Connect"** on the Instagram card
2. You should see Instagram's OAuth login page
3. Log in with your test Instagram account
4. Grant permissions
5. If you have a backend, the token exchange should happen
6. Instagram should show as "Connected"

### Step 3: Verify Updates Are Fetching

1. After connecting accounts, wait a few seconds
2. Scroll down to "Recent Updates" section
3. You should see posts/updates from your connected accounts
4. Tap the refresh button to manually refresh

### Step 4: Test Disconnection

1. Tap **"Disconnect"** on a connected account
2. Confirm the disconnection
3. The account should show as "Not connected"
4. Updates from that account should be removed

---

## Part 7: Troubleshooting

### Issue: "Invalid OAuth Redirect URI"

**Solution:**
- Verify the redirect URI in Facebook/Instagram settings matches exactly
- Check that your `app.json` scheme matches: `"scheme": "pulseos"`
- For development, use the full Expo URL format: `exp://YOUR_IP:8081/--/social-auth`

### Issue: "App Not Setup: This app is still in development mode"

**Solution:**
- Add yourself as a test user in Facebook App settings
- Or submit your app for review to make it public

### Issue: "Instagram token exchange fails"

**Solution:**
- Ensure you have a backend endpoint for token exchange
- Verify your Instagram App Secret is correct
- Check that the redirect URI matches exactly

### Issue: "No updates appearing"

**Solution:**
- Check that you granted the necessary permissions (`user_posts` for Facebook)
- Verify your access token is valid
- Check the console for API errors
- Ensure you have posts/activity on your accounts

### Issue: "Facebook Login button doesn't work"

**Solution:**
- Verify `FACEBOOK_APP_ID` is set correctly
- Check that `expo-auth-session` is installed
- Ensure the redirect URI is properly configured

---

## Part 8: Required Permissions

### Facebook Permissions Needed:
- `public_profile` - Basic profile information
- `email` - User's email address
- `user_posts` - Access to user's posts (requires App Review)

### Instagram Permissions Needed:
- `user_profile` - Basic profile information
- `user_media` - Access to user's media

---

## Part 9: Privacy Policy & Terms

Since you're accessing user data, you need:

1. **Privacy Policy URL** (Required for Instagram)
   - Host a privacy policy explaining what data you collect
   - How you use it
   - How users can delete their data

2. **Terms of Service URL** (Optional but recommended)

3. **User Data Deletion URL** (Recommended)
   - An endpoint where users can request data deletion

---

## Part 10: Production Checklist

Before going to production:

- [ ] App submitted for Facebook App Review
- [ ] All required permissions approved
- [ ] Privacy Policy URL configured and accessible
- [ ] Terms of Service URL configured (if applicable)
- [ ] User Data Deletion endpoint implemented
- [ ] Environment variables set up (not hardcoded credentials)
- [ ] Backend token exchange implemented for Instagram
- [ ] Error handling tested
- [ ] Token refresh logic implemented (for long-term use)
- [ ] Security best practices followed

---

## Additional Resources

- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Expo AuthSession Documentation](https://docs.expo.dev/guides/authentication/#facebook)
- [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)

---

## Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify all credentials are correct
3. Ensure redirect URIs match exactly
4. Check Facebook/Instagram app status in Developer Console
5. Review the troubleshooting section above

Good luck with your integration! 🚀
