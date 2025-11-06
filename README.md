# ⚖️ Legalify - AI Legal Assistant for India

> **Democratizing Legal Access:** 95% of Indians can't afford lawyers. Legalify provides AI-powered legal assistance to draft contracts, analyze documents, and get 24/7 legal help - completely FREE. Serving 1.4 billion people.

[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com)

---

## 👥 Development Team

**Core Contributors:**
- **[Rishav Mani](https://github.com/rishavm1)** 
- **[Anirban Chowdhury](https://github.com/biriyani4ever-one)** - Co-Developer
- **[Shantanu Raj](https://github.com/shantanuraj5002-art)** - Co-Developer

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git
- Supabase account (free tier)
- OpenRouter API key or Google AI API key

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/rishavm1/Legalify.git
cd Legalify

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys (see Environment Variables section)

# 4. Set up database
# - Create Supabase project
# - Run SQL scripts in lib/database-schema.sql
# - Run lib/database-compatibility.sql

# 5. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deploy to Production

**One-Click Deploy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rishavm1/Legalify)

**Manual Deployment:**
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

See detailed deployment guide below.

---

## ✨ Features

### 🎨 Modern UI/UX
- **Dark/Light Mode** - Cinematic theme switcher with particle effects
- **Minimalist Design** - Midnight black + neon white color scheme
- **Fully Responsive** - Optimized for desktop, tablet, and mobile
- **Smooth Animations** - Professional transitions and micro-interactions
- **Glassmorphism Effects** - Modern glass-card aesthetics

### 📄 Legal Document Drafting
1. **Rental/Lease Agreements** - Residential and commercial property leases
2. **Employment Contracts** - Comprehensive employment agreements
3. **Partnership Agreements** - Business partnership documents
4. **Service Agreements** - Professional service contracts
5. **Non-Disclosure Agreements (NDAs)** - Confidentiality agreements
6. **Land Owner-Builder Agreements** - Construction contracts

### 🤖 AI-Powered Intelligence
- **Smart Chat Interface** - Context-aware legal assistance
- **Document Analysis** - Upload PDFs/images for instant analysis
- **Guided Workflows** - Step-by-step document creation
- **Multi-AI Support** - OpenRouter (Claude 3.5) + Google Gemini with automatic load balancing
- **Legal Act Citations** - Accurate references to Indian legal acts
- **Professional Formatting** - Documents formatted like lawyer-drafted contracts

### 🔐 Authentication & Security
- **Email/Password Authentication** - Secure credential-based login
- **Google OAuth** - One-click sign-in with Google
- **OTP Verification** - Email-based verification with countdown timer
- **Password Strength Validator** - Real-time password requirements checking
- **Session Management** - Secure JWT-based sessions
- **Password Reset** - Secure password recovery flow

### 💾 Data Management
- **Chat History** - Persistent conversation storage
- **Session Management** - Multiple chat sessions per user
- **User Memory System** - Personalized user preferences
- **Document Storage** - Save and retrieve generated documents
- **Export Options** - Download as Word, PDF, or plain text

### 📱 User Experience
- **Hamburger Menu** - Collapsible sidebar navigation
- **Copy to Clipboard** - One-click copy for AI responses
- **Download Buttons** - Appear automatically for drafted documents
- **Tetris Loader** - Engaging loading animation
- **Empty State Design** - Beautiful welcome screen with feature cards

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5.0
- **Styling:** Tailwind CSS 3.4
- **UI Components:** Custom components with Radix UI primitives
- **Animations:** Framer Motion
- **Theme:** next-themes for dark/light mode

### Backend
- **API Routes:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Authentication:** NextAuth.js v4
- **Email:** Nodemailer with SMTP

### AI Integration
- **Primary:** OpenRouter API (Claude 3.5 Sonnet)
- **Fallback:** Google AI (Gemini 1.5 Pro)
- **Load Balancing:** Custom load balancer with automatic failover

### Deployment
- **Hosting:** Vercel (Serverless)
- **Database:** Supabase Cloud
- **CDN:** Vercel Edge Network
- **Domain:** Custom domain support

---

## 📁 Project Structure

```
Legalify/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── ai/                   # AI chat endpoints
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── chat/                 # Chat session management
│   │   ├── documents/            # Document operations
│   │   ├── otp/                  # OTP verification
│   │   ├── upload/               # File upload handling
│   │   └── user/                 # User management
│   ├── auth/                     # Authentication pages
│   │   ├── signin/               # Sign in page
│   │   ├── signup/               # Sign up page
│   │   ├── forgot-password/      # Password reset request
│   │   ├── reset-password/       # Password reset form
│   │   └── username/             # Username setup
│   ├── about/                    # About page
│   ├── faq/                      # FAQ page
│   ├── privacy/                  # Privacy policy
│   ├── terms/                    # Terms of service
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
│
├── components/                   # React Components
│   ├── ui/                       # UI Components
│   │   ├── ai-prompt-box.tsx     # Chat input component
│   │   ├── button.tsx            # Button component
│   │   ├── card.tsx              # Card component
│   │   ├── cinematic-theme-switcher.tsx  # Theme toggle
│   │   ├── tetris-loader.tsx     # Loading animation
│   │   └── ...
│   ├── chat-interface.tsx        # Main chat interface
│   ├── agreement-workflow.tsx    # Document drafting workflow
│   ├── document-result.tsx       # Document display
│   ├── theme-provider.tsx        # Theme context provider
│   └── session-provider.tsx      # Auth session provider
│
├── lib/                          # Utility Libraries
│   ├── ai/                       # AI Provider Integration
│   │   ├── index.ts              # Main AI interface
│   │   ├── load-balancer.ts      # Load balancing logic
│   │   ├── openrouter.ts         # OpenRouter provider
│   │   ├── gemini.ts             # Google AI provider
│   │   └── types.ts              # Type definitions
│   ├── auth.ts                   # NextAuth configuration
│   ├── db.ts                     # Supabase client
│   ├── templates.ts              # Document templates
│   ├── docx-export.ts            # Word export functionality
│   ├── utils.ts                  # Utility functions
│   ├── database-schema.sql       # Database schema
│   └── database-compatibility.sql # Database migrations
│
├── scripts/                      # Database Scripts
│   ├── add-password-reset-table.sql
│   ├── fix-database.sql
│   └── test-db-connection.js
│
├── types/                        # TypeScript Definitions
│   ├── global.d.ts               # Global type definitions
│   └── next-auth.d.ts            # NextAuth type extensions
│
├── .env.example                  # Example environment variables
├── .env.local.example            # Local env example
├── .gitignore                    # Git ignore rules
├── LICENSE                       # Proprietary license
├── README.md                     # This file
├── middleware.ts                 # Next.js middleware
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── vercel.json                   # Vercel deployment config
```

---

## 🔑 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# ============================================
# AI API KEYS
# ============================================
# OpenRouter (Primary AI Provider)
NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-xxxxx

# Google AI (Fallback Provider)
GOOGLE_AI_API_KEY=AIzaSyxxxxx

# ============================================
# AUTHENTICATION
# ============================================
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars

# Google OAuth
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# ============================================
# DATABASE (SUPABASE)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx

# ============================================
# EMAIL (SMTP)
# ============================================
EMAIL_SERVER=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
```

### Getting API Keys

**OpenRouter:**
1. Visit [openrouter.ai](https://openrouter.ai)
2. Sign up and create API key
3. Add credits ($5 minimum)

**Google AI:**
1. Visit [makersuite.google.com](https://makersuite.google.com)
2. Create API key
3. Free tier available

**Supabase:**
1. Visit [supabase.com](https://supabase.com)
2. Create new project
3. Copy URL and keys from Settings > API

**Google OAuth:**
1. Visit [console.cloud.google.com](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs

---

## 🗄️ Database Setup

### 1. Create Supabase Project
- Go to [supabase.com](https://supabase.com)
- Create new project
- Wait for database to initialize

### 2. Run SQL Scripts

Execute in this order in Supabase SQL Editor:

**Step 1:** Run `lib/database-schema.sql`
```sql
-- Creates tables: users, chat_sessions, chat_messages, otps, user_memory
```

**Step 2:** Run `lib/database-compatibility.sql`
```sql
-- Adds compatibility features and indexes
```

**Step 3:** Run `scripts/add-password-reset-table.sql`
```sql
-- Adds password reset functionality
```

### 3. Verify Tables

Check that these tables exist:
- `users` - User accounts
- `chat_sessions` - Chat sessions
- `chat_messages` - Chat messages
- `otps` - OTP verification codes
- `user_memory` - User preferences
- `password_resets` - Password reset tokens

---

## 🚀 Deployment Guide

### Deploy to Vercel (Recommended)

**Step 1: Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

**Step 2: Import to Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Click "Import"

**Step 3: Configure Environment Variables**

Add all variables from `.env.local` in Vercel dashboard:
- Go to Project Settings > Environment Variables
- Add each variable one by one
- Make sure to add for Production, Preview, and Development

**Step 4: Deploy**
- Click "Deploy"
- Wait 2-3 minutes
- Your app is live!

**Step 5: Update OAuth Redirect URLs**

Add your Vercel URL to Google OAuth:
```
https://your-app.vercel.app/api/auth/callback/google
```

### Custom Domain (Optional)

1. Go to Vercel Project Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` environment variable

---

## 🧪 Testing

### Run Locally
```bash
npm run dev
```

### Test Features
- ✅ Sign up with email
- ✅ Verify OTP
- ✅ Sign in with Google
- ✅ Create new chat
- ✅ Send messages
- ✅ Draft document
- ✅ Download document
- ✅ Toggle dark/light mode

### Check Logs
```bash
# Vercel deployment logs
vercel logs

# Local development logs
# Check terminal output
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue: "Invalid API Key"**
- Verify API keys are correct in environment variables
- Check for extra spaces or line breaks
- Ensure keys are active and have credits

**Issue: "Database Connection Failed"**
- Verify Supabase URL and keys
- Check if database tables are created
- Run SQL scripts in correct order

**Issue: "OAuth Error"**
- Update redirect URLs in Google Console
- Verify `NEXTAUTH_URL` matches your domain
- Check `NEXTAUTH_SECRET` is set (min 32 characters)

**Issue: "Email Not Sending"**
- Use Gmail App Password (not regular password)
- Enable "Less secure app access" in Gmail
- Check SMTP settings are correct

**Issue: "Build Failed on Vercel"**
- Check build logs for specific error
- Verify all dependencies are in `package.json`
- Ensure TypeScript has no errors: `npm run build`

**Issue: "Environment Variables Not Working"**
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)
- Verify variables are set for correct environment

---

## 📊 Performance

### Optimizations Implemented
- ✅ **Code Splitting** - Lazy loading of components
- ✅ **Image Optimization** - Next.js Image component
- ✅ **API Caching** - Efficient data caching
- ✅ **Load Balancing** - Automatic AI provider failover
- ✅ **Database Indexing** - Optimized queries
- ✅ **Edge Functions** - Vercel Edge Network

### Metrics
- **First Contentful Paint:** <1.5s
- **Time to Interactive:** <3s
- **Lighthouse Score:** 90+
- **API Response Time:** <2s (95th percentile)

---

## 🔒 Security

### Implemented Security Measures
- ✅ **Environment Variable Protection** - Never commit `.env.local`
- ✅ **API Key Encryption** - Secure storage in Vercel
- ✅ **SQL Injection Prevention** - Parameterized queries
- ✅ **XSS Protection** - Input sanitization
- ✅ **CSRF Protection** - NextAuth built-in protection
- ✅ **Rate Limiting** - API endpoint throttling
- ✅ **Session Security** - JWT with secure cookies

### Best Practices
1. **Never commit** `.env.local` to GitHub
2. **Rotate API keys** regularly
3. **Use strong passwords** (8+ chars, mixed case, numbers, symbols)
4. **Enable 2FA** on all accounts
5. **Monitor logs** for suspicious activity

---

## 📄 License

**Proprietary License - All Rights Reserved**

This software is proprietary and confidential. Unauthorized copying, modification, distribution, or use of this software, via any medium, is strictly prohibited without explicit written permission from the copyright holders.

See [LICENSE](LICENSE) file for full terms.

**Copyright © 2024 Legalify Team**
- Rishav Mani
- Anirban Chowdhury
- Shantanu Raj

---

## ⚖️ Legal Disclaimer

**IMPORTANT:** This software provides AI-generated legal content for informational purposes only. It does NOT constitute legal advice and should NOT be relied upon as a substitute for consultation with a qualified attorney.

**Users are solely responsible for:**
- Reviewing all AI-generated documents
- Consulting with licensed attorneys before using documents
- Ensuring compliance with applicable laws
- Any legal consequences of using the software

**The developers assume NO liability for:**
- Accuracy of AI-generated content
- Legal consequences of using the software
- Damages arising from use of the software

---

## 🤝 Contributing

This is a proprietary project. Contributions are only accepted from authorized team members.

**For Team Members:**
1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test thoroughly
3. Commit: `git commit -m "Add feature"`
4. Push: `git push origin feature/your-feature`
5. Create Pull Request for review

**Code Standards:**
- Follow TypeScript best practices
- Write clean, documented code
- Test all features before committing
- Follow existing code style

---

## 📞 Support & Contact

**For Issues:**
- Check [Troubleshooting](#-troubleshooting) section
- Review [Deployment Guide](#-deployment-guide)
- Check Vercel deployment logs
- Review browser console errors

**For Licensing Inquiries:**
- Contact through GitHub repository
- Email: Available on request

**For Collaboration:**
- This is a closed-source project
- Collaboration by invitation only

---

## 🎯 Roadmap

### Current Version: 1.1
- ✅ Core chat interface
- ✅ Document drafting (6 types)
- ✅ Dark/light mode
- ✅ Authentication system
- ✅ OTP verification
- ✅ Password strength validator
- ✅ Multi-AI support with load balancing

### Upcoming Features (v2.0)
- 🔄 Fine-tuned legal AI model
- 🔄 More document types (10+ total)
- 🔄 Document version history
- 🔄 Collaboration features
- 🔄 Mobile app (React Native)
- 🔄 Voice input support
- 🔄 Multi-language support (Hindi, Tamil, etc.)
- 🔄 Legal act database integration
- 🔄 Case law citations
- 🔄 Lawyer review marketplace

---

## 📈 Project Stats

- **Lines of Code:** 15,000+
- **Components:** 50+
- **API Routes:** 20+
- **Document Types:** 6
- **Supported Languages:** English (Hindi coming soon)
- **Target Users:** 1.4 billion Indians
- **Development Time:** 6 months
- **Team Size:** 3 developers

---

## 🌟 Acknowledgments

**Technologies:**
- Next.js team for amazing framework
- Vercel for seamless deployment
- Supabase for excellent database
- OpenRouter for AI API access
- Google for Gemini AI
- Tailwind CSS for styling system

**Inspiration:**
- 95% of Indians who can't afford legal help
- Mission to democratize access to justice
- Belief that everyone deserves legal protection

---

## 📱 Screenshots

### Home Page
![Home Page](https://via.placeholder.com/800x400?text=Legalify+Home+Page)

### Chat Interface
![Chat Interface](https://via.placeholder.com/800x400?text=Chat+Interface)

### Document Drafting
![Document Drafting](https://via.placeholder.com/800x400?text=Document+Drafting)

### Dark Mode
![Dark Mode](https://via.placeholder.com/800x400?text=Dark+Mode)

---

## 🔗 Links

- **Live Demo:** [https://legalifylunatics.vercel.app](https://legalifylunatics.vercel.app)
- **GitHub:** [https://github.com/rishavm1/Legalify](https://github.com/rishavm1/Legalify)
- **Documentation:** See this README
- **License:** [LICENSE](LICENSE)

---

## 💡 Fun Facts

- 🚀 Built in 6 months
- ☕ Powered by countless cups of coffee
- 🌙 Most code written at 2 AM
- 🎯 Mission: Help 1.4 billion people
- ❤️ Made with passion for justice

---

**Made with ❤️ in India, for India**

*Empowering 1.4 billion people with accessible legal assistance*

---

**⭐ If you find this project interesting, please star the repository!**

**📧 For inquiries: Contact through GitHub**

**🔒 Remember: This is proprietary software. See LICENSE for terms.**
