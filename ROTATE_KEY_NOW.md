# 🚨 URGENT: ROTATE SUPABASE KEY NOW!

## ⚠️ YOUR DATABASE IS AT RISK

Your Supabase Service Role Key was exposed on GitHub. Anyone can access your database with full admin rights.

## 🔥 DO THIS IMMEDIATELY (5 MINUTES)

### STEP 1: Rotate Key in Supabase (2 min)

1. Open: https://supabase.com/dashboard/project/lyyqkvdnarwbvxguqwvg/settings/api

2. Scroll to "Service role" section

3. Click the "Reset" or "🔄" icon next to service_role key

4. Click "Confirm" to generate new key

5. **COPY THE NEW KEY** (you'll need it)

---

### STEP 2: Update .env.local (1 min)

Open: `legalify.lunatics\.env.local`

Replace this line:
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5eXFrdmRuYXJ3YnZ4Z3Vxd3ZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTk4NTcyNSwiZXhwIjoyMDc3NTYxNzI1fQ.HkmMB1v3e-jdLDeExOSL8baWzJS-zqGzmzyIHeU3veE
```

With:
```bash
SUPABASE_SERVICE_ROLE_KEY=your_new_key_here
```

Save the file.

---

### STEP 3: Update Vercel (2 min)

1. Open: https://vercel.com/rishavm1s-projects/legalifylunatics/settings/environment-variables

2. Find `SUPABASE_SERVICE_ROLE_KEY`

3. Click "Edit"

4. Paste the NEW key

5. Click "Save"

6. Click "Redeploy" to apply changes

---

## ✅ VERIFICATION

After rotating:

1. Test locally:
   ```bash
   npm run dev
   ```
   Visit: http://localhost:3000
   Try logging in - should work

2. Test production:
   Visit: https://legalifylunatics.vercel.app
   Try logging in - should work

3. Check GitHub alerts:
   - GitGuardian alert will close automatically
   - GitHub alert will close after re-scan

---

## 🔒 WHAT HAPPENS AFTER ROTATION

- ✅ Old key becomes invalid immediately
- ✅ No one can access your database with old key
- ✅ Your app uses new key
- ✅ Database remains secure

---

## ⏰ TIME SENSITIVE

**Do this NOW before someone:**
- Deletes your data
- Steals user information
- Modifies database tables
- Creates fake accounts

**Total time: 5 minutes**
**Risk level: CRITICAL**

---

## 📞 NEED HELP?

If key rotation fails:
1. Check Supabase dashboard for errors
2. Verify new key is copied correctly
3. Ensure no extra spaces in .env.local
4. Restart local dev server
5. Redeploy Vercel

---

## ✅ CHECKLIST

- [ ] Rotate key in Supabase dashboard
- [ ] Copy new key
- [ ] Update .env.local
- [ ] Update Vercel environment variable
- [ ] Redeploy Vercel
- [ ] Test locally
- [ ] Test production
- [ ] Verify alerts closed

**DO THIS NOW! ⚡**
