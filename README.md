# ⚖️ Legalify - AI Legal Assistant for India

> 95% of Indians can't afford lawyers. Legalify = AI legal assistant. Draft contracts, analyze documents, get 24/7 legal help - FREE. Serving 1.4B people in market. Working product.

---

## 🚀 Quick Start

### Local Development

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd legalify.lunatics

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# 4. Run development server
npm run dev
```

Visit `http://localhost:3000`

### Deploy to Vercel

**Quick Deploy:** See [README_DEPLOYMENT.md](./README_DEPLOYMENT.md) for 10-minute deployment guide

**Full Guide:** See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for comprehensive instructions

---

## ✨ Features

### 🎨 Modern UI/UX
- Minimalistic black & neon white design
- Fully responsive across all devices
- Smooth animations and transitions
- Glass morphism effects

### 📄 Document Drafting (4 Types)
1. **Land Owner - Builder Agreement** - Construction contracts
2. **Rental Agreement** - Property lease agreements
3. **Partnership Agreement** - Business partnerships
4. **Service Agreement** - Professional service contracts

### 🤖 AI-Powered Features
- **Smart Chat Interface** - Context-aware legal assistance
- **Document Analysis** - Upload and analyze legal documents
- **Guided Workflows** - Step-by-step document creation
- **Multi-AI Support** - OpenRouter + Google AI with load balancing

### 🔐 Authentication
- Email/Password authentication
- Google OAuth integration
- Secure session management
- Password reset functionality

### 💾 Data Management
- Chat history persistence
- Session management
- User memory system
- Document storage

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** NextAuth.js
- **AI:** OpenRouter (Claude 3.5) + Google AI (Gemini)
- **Deployment:** Vercel

---

## 📁 Project Structure

```
legalify.lunatics/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # UI components
│   ├── chat-interface.tsx
│   ├── agreement-workflow.tsx
│   └── ...
├── lib/                   # Utility functions
│   ├── ai/               # AI providers
│   ├── auth.ts           # Auth configuration
│   ├── db.ts             # Database client
│   └── templates.ts      # Document templates
├── .env.local            # Environment variables (DO NOT COMMIT)
├── .env.example          # Example environment file
└── README.md             # This file
```

---

## 🔑 Environment Variables

Required environment variables (see `.env.example`):

```env
# AI APIs
NEXT_PUBLIC_OPENROUTER_API_KEY=your_key
GOOGLE_AI_API_KEY=your_key

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret

# Database
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key

# Email
EMAIL_SERVER=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASSWORD=your_app_password
```

---

## 📚 Documentation

- **[README_DEPLOYMENT.md](./README_DEPLOYMENT.md)** - Quick 10-minute deployment guide
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Comprehensive deployment instructions
- **[SECURITY.md](./SECURITY.md)** - Security best practices and API key protection
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed setup instructions
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture overview

---

## 🎯 Key Features Explained

### 1. Agreement Workflow
- Guided question flow for each agreement type
- Smart form validation
- Real-time progress tracking
- Professional document generation

### 2. AI Chat Interface
- Context-aware responses
- Chat history persistence
- File upload and analysis
- Multi-session support

### 3. Document Export
- Copy to clipboard
- Download as Word (.docx)
- Print to PDF
- Plain text export

### 4. Security
- Secure authentication
- API key protection
- Environment variable management
- Session encryption

---

## 🚨 Important Security Notes

### ⚠️ NEVER COMMIT `.env.local` TO GITHUB

Your `.env.local` file contains sensitive API keys. If exposed:
1. Keys will be automatically detected and revoked
2. Your accounts may be compromised
3. You'll need to regenerate all keys

**Always:**
- Keep `.env.local` in `.gitignore`
- Use `.env.example` for documentation
- Use Vercel environment variables for production
- Rotate keys regularly

See [SECURITY.md](./SECURITY.md) for detailed security guidelines.

---

## 🐛 Troubleshooting

### Common Issues

**Issue: API keys not working**
- Verify keys are correct in `.env.local`
- Check API quotas and limits
- Ensure no extra spaces in keys

**Issue: Database connection failed**
- Verify Supabase URL and keys
- Check database tables are created
- Run SQL scripts in correct order

**Issue: OAuth not working**
- Update redirect URLs in Google Console
- Verify `NEXTAUTH_URL` is correct
- Check `NEXTAUTH_SECRET` is set

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for more troubleshooting tips.

---

## 📈 Performance

- **Optimized API Usage:** Smart question flow minimizes AI calls
- **Load Balancing:** Automatic failover between AI providers
- **Caching:** Efficient data caching strategies
- **Code Splitting:** Optimized bundle sizes

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 🆘 Support

For issues or questions:
1. Check documentation files
2. Review troubleshooting section
3. Check Vercel deployment logs
4. Review browser console errors

---

## 🎉 Deployment Checklist

Before deploying to production:

- [ ] All environment variables set in Vercel
- [ ] `.env.local` NOT committed to GitHub
- [ ] Google OAuth redirect URLs updated
- [ ] Supabase database tables created
- [ ] Email SMTP configured
- [ ] API keys tested and working
- [ ] All features tested locally
- [ ] Security guidelines reviewed

---

## 🔗 Quick Links

- **Deploy to Vercel:** [README_DEPLOYMENT.md](./README_DEPLOYMENT.md)
- **Security Guide:** [SECURITY.md](./SECURITY.md)
- **Full Documentation:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

**Made with ❤️ for 1.4 Billion Indians who deserve access to justice**
