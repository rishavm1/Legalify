# 🚀 Quick Deployment Guide

## ⚡ Fast Track to Vercel Deployment

### Step 1: Prepare for GitHub (2 minutes)

```bash
# 1. Verify .env.local is NOT tracked
git status

# 2. If .env.local appears, remove it:
git rm --cached .env.local

# 3. Commit and push
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy to Vercel (5 minutes)

1. **Go to [vercel.com](https://vercel.com)** and sign in
2. **Click "Add New Project"**
3. **Import your GitHub repository**
4. **Click "Deploy"** (it will fail first time - that's OK!)

### Step 3: Add Environment Variables (3 minutes)

In Vercel Dashboard → Project Settings → Environment Variables, add:

```env
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_key_here
GOOGLE_AI_API_KEY=your_google_ai_key_here
AI_STRATEGY=intelligent
NEXTAUTH_URL=https://your-project-name.vercel.app
NEXTAUTH_SECRET=your-secret-key-here
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

**Important:** 
- Replace `NEXTAUTH_URL` with your actual Vercel URL (e.g., `https://legalify.vercel.app`)
- Generate a random string for `NEXTAUTH_SECRET` (use: `openssl rand -base64 32`)

### Step 4: Update OAuth Redirect (2 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Edit your OAuth 2.0 Client
3. Add Authorized redirect URI:
   ```
   https://your-project-name.vercel.app/api/auth/callback/google
   ```

### Step 5: Redeploy (1 minute)

In Vercel Dashboard:
1. Go to Deployments tab
2. Click "Redeploy" on the latest deployment
3. Wait for deployment to complete

### Step 6: Test (2 minutes)

Visit your Vercel URL and test:
- ✅ Sign up with email
- ✅ Sign in with Google
- ✅ Chat functionality
- ✅ Draft agreements (all 4 types)
- ✅ File upload

---

## 🎉 Done!

Your app is now live at: `https://your-project-name.vercel.app`

---

## 🐛 Common Issues

### Issue: "API Key Invalid"
**Fix:** Double-check all environment variables in Vercel, then redeploy

### Issue: "OAuth Error"
**Fix:** Update Google OAuth redirect URL with your Vercel domain

### Issue: "Database Connection Failed"
**Fix:** Verify Supabase keys are correct in Vercel environment variables

### Issue: "Internal Server Error"
**Fix:** Check Vercel deployment logs for specific error

---

## 📚 More Help

- Full deployment guide: See `DEPLOYMENT_GUIDE.md`
- Security best practices: See `SECURITY.md`
- Troubleshooting: Check Vercel logs

---

## ⚠️ IMPORTANT REMINDERS

1. **NEVER commit `.env.local` to GitHub**
2. **Always use Vercel environment variables for production**
3. **Update `NEXTAUTH_URL` to your Vercel domain**
4. **Add Vercel URL to Google OAuth redirect URIs**
5. **Keep API keys secure and rotate them regularly**

---

## 🔄 Updating Your Deployment

After making changes:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel will automatically redeploy!

---

## 📞 Need Help?

If something doesn't work:
1. Check Vercel deployment logs
2. Verify all environment variables
3. Check browser console for errors
4. Review `DEPLOYMENT_GUIDE.md` for detailed steps
