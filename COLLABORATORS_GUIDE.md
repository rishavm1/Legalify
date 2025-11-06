# Adding Collaborators to Legalify Repository

## Team Members to Add

1. **Anirban Chowdhury**
   - GitHub: [@biriyani4ever-one](https://github.com/biriyani4ever-one)
   - Role: Admin (Full Access)

2. **Shantanu Raj**
   - GitHub: [@shantanuraj5002-art](https://github.com/shantanuraj5002-art)
   - Role: Admin (Full Access)

---

## How to Add Collaborators (Step-by-Step)

### Method 1: Via GitHub Website (Easiest)

1. **Go to Repository Settings**
   - Visit: https://github.com/rishavm1/Legalify
   - Click on **"Settings"** tab (top right)

2. **Navigate to Collaborators**
   - In left sidebar, click **"Collaborators and teams"**
   - Or direct link: https://github.com/rishavm1/Legalify/settings/access

3. **Add First Collaborator (Anirban)**
   - Click **"Add people"** button
   - Type: `biriyani4ever-one`
   - Select the correct user from dropdown
   - Choose role: **"Admin"** (gives full access)
   - Click **"Add biriyani4ever-one to this repository"**

4. **Add Second Collaborator (Shantanu)**
   - Click **"Add people"** button again
   - Type: `shantanuraj5002-art`
   - Select the correct user from dropdown
   - Choose role: **"Admin"** (gives full access)
   - Click **"Add shantanuraj5002-art to this repository"**

5. **Verify Invitations Sent**
   - You should see both users listed with "Pending invitation" status
   - They will receive email notifications

6. **Collaborators Accept Invitations**
   - Each person must check their email
   - Click the invitation link
   - Accept the invitation
   - They now have full access!

---

### Method 2: Via GitHub CLI (Advanced)

If you have GitHub CLI installed:

```bash
# Add Anirban as admin
gh api repos/rishavm1/Legalify/collaborators/biriyani4ever-one -X PUT -f permission=admin

# Add Shantanu as admin
gh api repos/rishavm1/Legalify/collaborators/shantanuraj5002-art -X PUT -f permission=admin
```

---

## Permission Levels Explained

### Admin (Recommended for Team)
✅ Full access to repository
✅ Can push to all branches
✅ Can manage settings
✅ Can add/remove collaborators
✅ Can delete repository
✅ Can manage deployments

### Write (Alternative)
✅ Can push to repository
✅ Can create branches
✅ Can merge pull requests
❌ Cannot change settings
❌ Cannot add collaborators

### Read (Not Recommended for Team)
✅ Can view code
✅ Can clone repository
❌ Cannot push changes
❌ Cannot modify anything

**For your team, use "Admin" so everyone has equal access.**

---

## After Adding Collaborators

### What They Can Do:

1. **Clone Repository**
   ```bash
   git clone https://github.com/rishavm1/Legalify.git
   cd Legalify
   ```

2. **Create Branches**
   ```bash
   git checkout -b feature/new-feature
   ```

3. **Push Changes**
   ```bash
   git add .
   git commit -m "Add new feature"
   git push origin feature/new-feature
   ```

4. **Manage Settings**
   - Access repository settings
   - Add environment variables in Vercel
   - Manage deployments

5. **Review Pull Requests**
   - Approve/reject PRs
   - Merge code
   - Manage issues

---

## Vercel Access (Important!)

After adding GitHub collaborators, also add them to Vercel:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/rishavm1s-projects/legalify.lunatics

2. **Navigate to Settings**
   - Click **"Settings"** tab
   - Click **"Members"** in sidebar

3. **Invite Team Members**
   - Click **"Invite"**
   - Enter email addresses:
     - Anirban's email
     - Shantanu's email
   - Choose role: **"Member"** or **"Owner"**
   - Click **"Invite"**

4. **They Accept Invitation**
   - Check email
   - Accept Vercel invitation
   - Now they can manage deployments!

---

## Supabase Access (Optional)

If you want them to access the database:

1. **Go to Supabase Dashboard**
   - Visit your project: https://supabase.com/dashboard/project/[your-project-id]

2. **Navigate to Settings**
   - Click **"Settings"** (gear icon)
   - Click **"Team"**

3. **Invite Members**
   - Click **"Invite"**
   - Enter their emails
   - Choose role: **"Owner"** or **"Developer"**
   - Click **"Send Invitation"**

---

## Best Practices for Team Collaboration

### 1. Branch Strategy
```
main (production)
  ├── dev (development)
  │   ├── feature/anirban-feature
  │   ├── feature/shantanu-feature
  │   └── feature/rishabh-feature
```

### 2. Commit Messages
```bash
# Good
git commit -m "Add OTP verification feature"
git commit -m "Fix: Resolve login bug"
git commit -m "Update: Improve UI responsiveness"

# Bad
git commit -m "changes"
git commit -m "fix"
git commit -m "update"
```

### 3. Pull Request Process
1. Create feature branch
2. Make changes
3. Push to GitHub
4. Create Pull Request
5. Request review from team
6. Merge after approval

### 4. Code Review Guidelines
- Review each other's code
- Provide constructive feedback
- Test before approving
- Merge only working code

---

## Troubleshooting

### Issue: "Collaborator not found"
**Solution:** 
- Verify GitHub username is correct
- Check for typos
- Ensure they have a GitHub account

### Issue: "Invitation not received"
**Solution:**
- Check spam folder
- Resend invitation
- Use direct link from GitHub

### Issue: "Cannot push to repository"
**Solution:**
- Verify they accepted invitation
- Check their permission level (should be Admin)
- Ensure they're authenticated: `git config --global user.name`

### Issue: "Access denied on Vercel"
**Solution:**
- Add them as members in Vercel dashboard
- They need separate Vercel accounts
- Link their GitHub accounts to Vercel

---

## Quick Checklist

After following this guide, verify:

- [ ] Anirban added as Admin on GitHub
- [ ] Shantanu added as Admin on GitHub
- [ ] Both accepted GitHub invitations
- [ ] Both can clone repository
- [ ] Both can push changes
- [ ] Both added to Vercel (optional)
- [ ] Both added to Supabase (optional)
- [ ] Team communication channel set up (Discord/Slack)

---

## Contact Information

**Repository Owner:** Rishabh Verma (@rishavm1)

**Team Members:**
- Anirban Chowdhury (@biriyani4ever-one)
- Shantanu Raj (@shantanuraj5002-art)

**Repository:** https://github.com/rishavm1/Legalify

---

## Next Steps

1. ✅ Add collaborators on GitHub
2. ✅ Wait for them to accept invitations
3. ✅ Add them to Vercel
4. ✅ Set up team communication
5. ✅ Discuss project roadmap
6. ✅ Assign tasks and responsibilities
7. ✅ Start collaborating!

---

**Remember:** With great power comes great responsibility. Admin access means they can modify/delete anything. Only add trusted team members!
