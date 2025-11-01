# ✅ Pre-Push Checklist

## Before Pushing to GitHub

Run through this checklist EVERY TIME before pushing:

### 1. Environment Files ✅

```bash
# Check if .env.local is tracked
git status | findstr ".env.local"

# Should return NOTHING
# If it shows .env.local, run:
git rm --cached .env.local
```

- [ ] `.env.local` is NOT in `git status`
- [ ] `.env.example` exists with placeholder values
- [ ] `.gitignore` includes `.env.local`

### 2. Verify Files ✅

```bash
# List all files that will be committed
git status

# Review changes
git diff
```

- [ ] No API keys in source code
- [ ] No hardcoded secrets
- [ ] No sensitive data in files
- [ ] Only intended files are staged

### 3. Search for Secrets ✅

```bash
# Search for potential secrets
git grep -i "sk-or-v1"
git grep -i "AIzaSy"
git grep -i "GOCSPX"

# Should return NO results in tracked files
```

- [ ] No OpenRouter keys in code
- [ ] No Google AI keys in code
- [ ] No OAuth secrets in code
- [ ] No email passwords in code

### 4. Final Verification ✅

```bash
# Check what will be pushed
git log origin/main..HEAD

# Verify .gitignore
cat .gitignore | findstr "env"
```

- [ ] Commit messages are clear
- [ ] `.gitignore` is correct
- [ ] No merge conflicts
- [ ] Code builds successfully

### 5. Safe to Push ✅

```bash
git push origin main
```

---

## ⚠️ If You Find Secrets

### If secrets are in staged files:

```bash
# Unstage the file
git reset HEAD .env.local

# Remove from tracking
git rm --cached .env.local

# Commit the removal
git commit -m "Remove sensitive files"
```

### If secrets are in committed history:

```bash
# Remove from last commit
git reset --soft HEAD~1

# Remove the file
git rm --cached .env.local

# Recommit without the file
git commit -m "Remove sensitive files"
```

### If already pushed to GitHub:

1. **Immediately revoke all exposed keys**
2. **Delete the repository** (if necessary)
3. **Clean git history** (use BFG Repo-Cleaner)
4. **Generate new keys**
5. **Push cleaned repository**

---

## 🎯 Quick Commands

### Check before push:
```bash
# One-liner to check everything
git status && git diff --cached && git grep -i "sk-or-v1" && git grep -i "AIzaSy"
```

### Safe push workflow:
```bash
# 1. Check status
git status

# 2. Add files (NEVER use git add .)
git add specific-file.ts

# 3. Verify what's staged
git diff --cached

# 4. Commit
git commit -m "Your message"

# 5. Final check
git log -1

# 6. Push
git push origin main
```

---

## 📋 Environment Variables to Protect

Never commit these:

- `NEXT_PUBLIC_OPENROUTER_API_KEY`
- `GOOGLE_AI_API_KEY`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `EMAIL_PASSWORD`

---

## ✅ Safe to Commit

These are OK to commit:

- `.env.example` (with placeholders)
- `.gitignore`
- Source code (without secrets)
- Documentation
- Configuration files (without secrets)

---

## 🚨 Emergency Response

If you accidentally pushed secrets:

### Immediate Actions (within 5 minutes):

1. **Revoke all keys immediately**
   - OpenRouter: openrouter.ai → API Keys → Revoke
   - Google AI: ai.google.dev → API Keys → Delete
   - Supabase: Project Settings → API → Reset keys
   - Google OAuth: Cloud Console → Regenerate secret

2. **Force push to remove**
   ```bash
   git reset --hard HEAD~1
   git push origin main --force
   ```

3. **Or delete repository**
   - Go to GitHub repository settings
   - Scroll to "Danger Zone"
   - Delete repository

4. **Generate new keys**

5. **Update `.env.local` locally**

6. **Push cleaned repository**

---

## 📞 Key Regeneration Links

- **OpenRouter:** https://openrouter.ai/keys
- **Google AI:** https://ai.google.dev/
- **Google OAuth:** https://console.cloud.google.com/apis/credentials
- **Supabase:** https://supabase.com/dashboard/project/_/settings/api

---

## ✨ Best Practices

1. **Always review before pushing**
2. **Never use `git add .` blindly**
3. **Check `git status` frequently**
4. **Use `git diff` to review changes**
5. **Keep `.env.local` local only**
6. **Use Vercel for production secrets**
7. **Rotate keys regularly**
8. **Monitor API usage**

---

## 🎓 Remember

> "If it's secret, it stays local. Use environment variables for deployment."

**The cost of exposing secrets:**
- Revoked API keys
- Potential security breach
- Time spent regenerating keys
- Possible service disruption

**The benefit of being careful:**
- Secure application
- No downtime
- Peace of mind
- Professional deployment

---

**Print this checklist and keep it visible while working!**
