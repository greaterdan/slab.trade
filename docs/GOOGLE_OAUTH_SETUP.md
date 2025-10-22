# Google OAuth Setup for SLAB

This guide explains how to set up Google OAuth authentication for the SLAB trading platform.

## Prerequisites

1. **Google Cloud Console Account**
2. **Domain access** for OAuth configuration
3. **Environment variables** setup

## Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console
- Visit: [Google Cloud Console](https://console.cloud.google.com/)
- Sign in with your Google account

### 1.2 Create a New Project (Optional)
- Click "Select a project" → "New Project"
- Name: "SLAB Trading Platform"
- Click "Create"

### 1.3 Enable Google+ API
- Go to "APIs & Services" → "Library"
- Search for "Google+ API"
- Click "Enable"

### 1.4 Create OAuth 2.0 Credentials
- Go to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "OAuth 2.0 Client IDs"
- Application type: "Web application"
- Name: "SLAB Trading Platform"

### 1.5 Configure Authorized URLs

#### For Development:
```
Authorized JavaScript origins:
- http://localhost:3000

Authorized redirect URIs:
- http://localhost:3000/api/auth/google/callback
```

#### For Production:
```
Authorized JavaScript origins:
- https://yourdomain.com
- https://www.yourdomain.com

Authorized redirect URIs:
- https://yourdomain.com/api/auth/google/callback
```

### 1.6 Get Credentials
- Copy the **Client ID**
- Copy the **Client Secret**
- Save these securely

## Step 2: Environment Variables

### 2.1 Create .env file
```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Other required variables
DATABASE_URL=your_database_url
WALLET_ENCRYPTION_KEY=your_wallet_encryption_key
SESSION_SECRET=your_session_secret
```

### 2.2 For Production Deployment

#### Vercel:
```bash
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
```

#### Other Platforms:
Set environment variables in your hosting platform's dashboard.

## Step 3: Test the Integration

### 3.1 Start the Application
```bash
npm run dev
```

### 3.2 Test Google Login
1. Go to `http://localhost:3000`
2. Click "LOGIN" button
3. Click "Google" option in the modal
4. You should be redirected to Google OAuth
5. After authentication, you'll be redirected back to the app

### 3.3 Verify User Data
Check the console logs to see:
- Google profile data
- User creation/update in database
- Session establishment

## Step 4: Production Configuration

### 4.1 Update OAuth Settings
1. Go back to Google Cloud Console
2. Edit your OAuth 2.0 Client ID
3. Update authorized URLs with your production domain
4. Save changes

### 4.2 Environment Variables
Set production environment variables:
```bash
GOOGLE_CLIENT_ID=your_production_client_id
GOOGLE_CLIENT_SECRET=your_production_client_secret
NODE_ENV=production
```

### 4.3 Test Production
1. Deploy your application
2. Test Google login on production domain
3. Verify user authentication works

## Troubleshooting

### Common Issues

#### 1. "redirect_uri_mismatch" Error
**Problem**: OAuth redirect URI doesn't match configured URI
**Solution**: 
- Check Google Cloud Console OAuth settings
- Ensure redirect URI matches exactly: `https://yourdomain.com/api/auth/google/callback`

#### 2. "invalid_client" Error
**Problem**: Client ID or Secret is incorrect
**Solution**:
- Verify environment variables are set correctly
- Check for typos in Client ID/Secret
- Ensure credentials are for the correct project

#### 3. "access_denied" Error
**Problem**: User denied permission or scope issues
**Solution**:
- Check OAuth scopes in the code
- Ensure Google+ API is enabled
- Verify user permissions

#### 4. Development vs Production Issues
**Problem**: Works locally but not in production
**Solution**:
- Check environment variables are set in production
- Verify production domain is in authorized URLs
- Ensure HTTPS is used in production

### Debug Steps

#### 1. Check Environment Variables
```bash
# In your application
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET');
```

#### 2. Check OAuth Configuration
```bash
# Test OAuth endpoint
curl http://localhost:3000/api/auth/google
```

#### 3. Check Database Connection
```bash
# Verify user storage
# Check if users are being created/updated in database
```

## Security Best Practices

### 1. Environment Variables
- Never commit `.env` files to version control
- Use secure secret management in production
- Rotate credentials regularly

### 2. OAuth Scopes
- Only request necessary scopes: `profile`, `email`
- Avoid requesting sensitive permissions

### 3. Session Security
- Use secure session cookies in production
- Set appropriate session timeouts
- Implement proper logout functionality

### 4. HTTPS
- Always use HTTPS in production
- Configure secure redirect URIs
- Use secure session cookies

## Advanced Configuration

### Custom OAuth Scopes
```typescript
// In replitAuth.ts
passport.authenticate("google", {
  scope: ["profile", "email", "openid"]
})
```

### Custom User Data
```typescript
// Customize user data extraction
const userData = {
  id: profile.id,
  email: profile.emails?.[0]?.value,
  firstName: profile.name?.givenName,
  lastName: profile.name?.familyName,
  profileImageUrl: profile.photos?.[0]?.value,
  // Add custom fields as needed
};
```

### Error Handling
```typescript
// Custom error handling
app.get("/api/auth/google/callback", (req, res, next) => {
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/login?error=google_auth_failed"
  })(req, res, next);
});
```

## Support

For issues with Google OAuth setup:
- **Google OAuth Documentation**: [developers.google.com/identity/protocols/oauth2](https://developers.google.com/identity/protocols/oauth2)
- **Passport Google Strategy**: [github.com/jaredhanson/passport-google-oauth20](https://github.com/jaredhanson/passport-google-oauth20)
- **SLAB Support**: [support@slab.trade](mailto:support@slab.trade)
