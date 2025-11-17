# 🔒 HOW TO ROTATE SUPABASE JWT SECRET

## Supabase doesn't have direct "Reset" button for service_role key

You need to rotate the JWT Secret, which will regenerate ALL keys.

---

## ⚠️ STEPS TO ROTATE:

### OPTION 1: Rotate JWT Secret (Recommended)

1. **Go to Database Settings**:
   https://supabase.com/dashboard/project/lyyqkvdnarwbvxguqwvg/settings/database

2. **Scroll to "JWT Settings" section**

3. **Click "Generate a new JWT secret"**

4. **Confirm the rotation**
   - This will regenerate BOTH anon and service_role keys
   - Old keys will stop working

5. **Go back to API Settings**:
   https://supabase.com/dashboard/project/lyyqkvdnarwbvxguqwvg/settings/api

6. **Copy NEW keys**:
   - New `anon` key
   - New `service_role` key

---

### OPTION 2: Contact Supabase Support

If JWT rotation option not visible:

1. Go to: https://supabase.com/dashboard/support

2. Create ticket: "Need to rotate JWT secret - key exposed on GitHub"

3. They'll rotate it within 24 hours

---

## 📝 AFTER ROTATION:

### Update .env.local:
```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=new_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=new_service_role_key_here
```

### Update Vercel:
1. https://vercel.com/rishavm1s-projects/legalifylunatics/settings/environment-variables
2. Update both keys
3. Redeploy

---

## 🚨 TEMPORARY WORKAROUND:

If you can't rotate immediately:

### Enable Row Level Security (RLS):

1. Go to: https://supabase.com/dashboard/project/lyyqkvdnarwbvxguqwvg/editor

2. For each table, click table → "Enable RLS"

3. Add policies to restrict access

This limits damage from exposed key.

---

## ✅ VERIFICATION:

After rotation, old key should fail:
```bash
curl https://lyyqkvdnarwbvxguqwvg.supabase.co/rest/v1/users \
  -H "apikey: OLD_KEY" \
  -H "Authorization: Bearer OLD_KEY"
```

Should return: "Invalid API key"

---

## 📞 NEED HELP?

Supabase Support: https://supabase.com/dashboard/support
Response time: Usually within 24 hours
