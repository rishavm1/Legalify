# 🚀 Deployment Guide - Legalify

## 📋 Prerequisites

Before deploying, ensure you have:
- GitHub account
- Vercel account (sign up at vercel.com)
- Supabase account (sign up at supabase.com)
- Google Cloud Console account (for OAuth)
- OpenRouter API key (get from openrouter.ai)
- Google AI API key (get from ai.google.dev)

---

## 🔐 Step 1: Secure Your API Keys

### ⚠️ CRITICAL: Never commit `.env.local` to GitHub!

Your `.env.local` file contains sensitive API keys and should NEVER be pushed to GitHub.

**Verify `.gitignore` includes:**
```
.env*.local
.env
```

---

## 🌐 Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. **Push to GitHub** (without `.env.local`):
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Click "Deploy"

3. **Add Environment Variables in Vercel**:
   - Go to Project Settings → Environment Variables
   - Add ALL variables from your `.env.local`:

   ```
   NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_key_here
   GOOGLE_AI_API_KEY=your_google_ai_key_here
   AI_STRATEGY=intelligent
   NEXTAUTH_URL=https://your-project.vercel.app
   NEXTAUTH_SECRET=your_secret_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   EMAIL_SERVER=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   ```

4. **Redeploy**:
   - Click "Redeploy" after adding environment variables

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Add environment variables
vercel env add NEXT_PUBLIC_OPENROUTER_API_KEY
vercel env add GOOGLE_AI_API_KEY
# ... add all other variables

# Deploy to production
vercel --prod
```

---

## 🔧 Step 3: Configure OAuth Redirect URLs

### Google OAuth Setup:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services → Credentials
3. Edit your OAuth 2.0 Client ID
4. Add Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   https://your-project.vercel.app/api/auth/callback/google
   ```

---

## 🗄️ Step 4: Configure Supabase

1. Go to your Supabase project
2. Navigate to Settings → API
3. Copy your project URL and keys
4. Add to Vercel environment variables

### Database Setup:

Run the SQL scripts in Supabase SQL Editor:
```bash
# In order:
1. lib/database-schema.sql
2. lib/database-compatibility.sql
3. scripts/add-password-reset-table.sql
```

---

## 📧 Step 5: Configure Email (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use this password in `EMAIL_PASSWORD` environment variable

---

## ✅ Step 6: Verify Deployment

After deployment, test:

1. **Authentication**:
   - Sign up with email
   - Sign in with Google OAuth
   - Password reset flow

2. **AI Features**:
   - Chat functionality
   - Document drafting (all 4 types)
   - File upload and analysis

3. **Database**:
   - User registration
   - Chat history saving
   - Session management

---

## 🔒 Security Best Practices

### ✅ DO:
- Keep `.env.local` in `.gitignore`
- Use environment variables in Vercel
- Rotate API keys regularly
- Use different keys for development and production
- Enable rate limiting on APIs
- Monitor API usage

### ❌ DON'T:
- Commit `.env.local` to GitHub
- Share API keys in public channels
- Use production keys in development
- Hardcode secrets in code
- Push sensitive data to public repos

---

## 🐛 Troubleshooting

### Issue: API Keys Not Working After Deployment

**Solution:**
1. Check Vercel environment variables are set correctly
2. Ensure no spaces in variable names or values
3. Redeploy after adding variables
4. Check API key quotas and limits

### Issue: OAuth Not Working

**Solution:**
1. Verify redirect URLs in Google Console
2. Update `NEXTAUTH_URL` to your Vercel domain
3. Check `NEXTAUTH_SECRET` is set
4. Clear browser cookies and try again

### Issue: Database Connection Failed

**Solution:**
1. Verify Supabase URL and keys
2. Check database tables are created
3. Verify RLS policies are set correctly
4. Check Supabase project is active

### Issue: Email Not Sending

**Solution:**
1. Verify Gmail App Password is correct
2. Check 2FA is enabled on Gmail
3. Verify EMAIL_USER and EMAIL_PASSWORD
4. Check Gmail security settings

---

## 📊 Monitoring

### Vercel Dashboard:
- Monitor deployment logs
- Check function execution
- View analytics

### Supabase Dashboard:
- Monitor database queries
- Check API usage
- View logs

### API Monitoring:
- OpenRouter: Check usage at openrouter.ai
- Google AI: Check quotas at console.cloud.google.com

---

## 🔄 Updating Deployment

```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push origin main

# Vercel will auto-deploy
```

---

## 🆘 Need Help?

If you encounter issues:

1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables
4. Check API key quotas
5. Review Supabase logs

---

## 📝 Environment Variables Checklist

Before deploying, ensure you have:

- [ ] NEXT_PUBLIC_OPENROUTER_API_KEY
- [ ] GOOGLE_AI_API_KEY
- [ ] AI_STRATEGY
- [ ] NEXTAUTH_URL (update to Vercel URL)
- [ ] NEXTAUTH_SECRET
- [ ] GOOGLE_CLIENT_ID
- [ ] GOOGLE_CLIENT_SECRET
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] EMAIL_SERVER
- [ ] EMAIL_PORT
- [ ] EMAIL_USER
- [ ] EMAIL_PASSWORD

---

## 🎉 Success!

Your Legalify app should now be live at: `https://your-project.vercel.app`

**Important:** Update `NEXTAUTH_URL` in Vercel environment variables to your actual Vercel URL and redeploy!
