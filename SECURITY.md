# 🔐 Security Guidelines

## ⚠️ CRITICAL: API Key Security

### What Happened?
Your API keys were exposed when pushed to GitHub, causing them to be automatically detected and shut down by security scanners.

### Why This Happens?
- GitHub has automated bots that scan for exposed API keys
- When detected, providers automatically revoke the keys
- This is a security feature to protect you

---

## ✅ How to Prevent This

### 1. Never Commit `.env.local`

**Always ensure `.env.local` is in `.gitignore`:**
```bash
# Check if .env.local is ignored
git check-ignore .env.local

# Should return: .env.local
```

### 2. Use `.env.example` for GitHub

Create `.env.example` with placeholder values:
```env
NEXT_PUBLIC_OPENROUTER_API_KEY=your_key_here
GOOGLE_AI_API_KEY=your_key_here
```

### 3. Check Before Pushing

**Before every push, verify:**
```bash
# Check what files will be committed
git status

# Ensure .env.local is NOT listed
# If it is, remove it:
git rm --cached .env.local
```

### 4. Use Environment Variables in Vercel

**For production, add variables in Vercel Dashboard:**
- Project Settings → Environment Variables
- Add each variable individually
- Never commit production keys to GitHub

---

## 🔄 If Your Keys Were Exposed

### Immediate Actions:

1. **Revoke Compromised Keys:**
   - OpenRouter: Generate new key at openrouter.ai
   - Google AI: Generate new key at ai.google.dev
   - Supabase: Rotate keys in project settings
   - Google OAuth: Regenerate client secret

2. **Remove from Git History:**
   ```bash
   # If you accidentally committed .env.local
   git rm --cached .env.local
   git commit -m "Remove sensitive files"
   git push origin main --force
   ```

3. **Update Local `.env.local`:**
   - Replace all old keys with new ones
   - Verify `.gitignore` includes `.env.local`

4. **Update Vercel:**
   - Go to Project Settings → Environment Variables
   - Update all keys with new values
   - Redeploy the project

---

## 🛡️ Best Practices

### Development:
- Use separate API keys for development and production
- Keep `.env.local` only on your local machine
- Never share `.env.local` via email, Slack, etc.
- Use `.env.example` for team collaboration

### Production:
- Use Vercel environment variables
- Enable rate limiting on APIs
- Monitor API usage regularly
- Rotate keys periodically (every 3-6 months)

### Git:
- Always check `git status` before committing
- Use `git diff` to review changes
- Never use `git add .` blindly
- Review files before pushing

---

## 📋 Pre-Push Checklist

Before pushing to GitHub:

- [ ] `.env.local` is in `.gitignore`
- [ ] Run `git status` - `.env.local` should NOT appear
- [ ] `.env.example` has placeholder values only
- [ ] No API keys in source code
- [ ] No hardcoded secrets
- [ ] Reviewed all files being committed

---

## 🔍 Scanning for Exposed Secrets

### Check Your Repository:

```bash
# Search for potential API keys in code
git grep -i "api.key"
git grep -i "secret"
git grep -i "password"

# Should return no results in committed files
```

### Use Git Secrets Tool:

```bash
# Install git-secrets
npm install -g git-secrets

# Scan repository
git secrets --scan
```

---

## 🚨 Emergency Response

### If Keys Are Exposed on GitHub:

1. **Immediately revoke all exposed keys**
2. **Remove the repository from GitHub** (if necessary)
3. **Clean git history:**
   ```bash
   # Use BFG Repo-Cleaner
   java -jar bfg.jar --delete-files .env.local
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```
4. **Generate new keys**
5. **Push cleaned repository**

---

## 📞 Support

If you need help securing your keys:
- OpenRouter: support@openrouter.ai
- Google Cloud: cloud.google.com/support
- Supabase: supabase.com/support
- Vercel: vercel.com/support

---

## ✅ Verification

After securing your project:

1. **Check GitHub:**
   - View your repository files
   - Ensure `.env.local` is not visible
   - Only `.env.example` should be present

2. **Check Vercel:**
   - All environment variables are set
   - Project deploys successfully
   - Application works correctly

3. **Test Locally:**
   - Application runs with `.env.local`
   - All features work
   - No errors in console

---

## 🎯 Remember

**The Golden Rule:**
> If it's secret, it stays local. Use environment variables for deployment.

**Never commit:**
- `.env.local`
- `.env`
- Any file with actual API keys
- Database passwords
- OAuth secrets
- Email passwords

**Always commit:**
- `.env.example` (with placeholders)
- `.gitignore` (with `.env.local`)
- Documentation
- Source code (without secrets)
