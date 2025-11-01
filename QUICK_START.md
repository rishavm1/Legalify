# Legalify - Quick Start Guide

## 🚀 Start the Application

```bash
# Navigate to project directory
cd c:\Users\rishu\OneDrive\Desktop\legalify.lunatics\legalify.lunatics

# Clear cache (if needed)
rmdir /s /q .next

# Start development server
npm run dev
```

The application will be available at: **http://localhost:3000**

---

## 🎯 User Flow

### 1. Landing Page
- Beautiful sparkles animation background
- "Get Started" button with liquid glass effect
- Click to proceed to sign in

### 2. Sign In / Sign Up
- **Sign in with Google** (OAuth)
- **Email & Password** login
- **Sign up** for new account
- **Forgot Password** flow with OTP

### 3. Main Chat Interface
- **Sidebar**: All your chat sessions
- **Main Area**: Chat with AI legal assistant
- **Input Box**: Modern prompt box with file upload

### 4. Features

#### 📝 Draft Agreements
1. Click "Draft Agreement" button
2. Select agreement type:
   - Land Owner - Builder Agreement
   - Rental Agreement
   - Partnership Agreement
   - Service Agreement
3. Answer guided questions
4. Generate professional legal document
5. Download as DOCX or PDF

#### 💬 Chat with AI
- Ask legal questions
- Get guidance on Indian law
- Request document drafting
- Understand legal procedures

#### 📄 Upload Documents
- Drag & drop files into chat
- Or click paperclip icon
- Supports: PDF, JPG, PNG
- AI analyzes and explains documents

#### 🗂️ Multiple Chat Sessions
- Create unlimited chat sessions
- Each session isolated
- Files don't leak between sessions
- Delete sessions when done

---

## 🔧 Common Issues & Solutions

### Issue: "Failed to create session"
**Solution**: 
1. Check if you're logged in
2. Verify Supabase connection
3. Check browser console for errors

### Issue: "Invalid OTP" during password reset
**Solution**:
1. Make sure you're using the latest OTP
2. OTP expires in 10 minutes
3. Request new OTP if expired
4. Check email spam folder

### Issue: Files showing in wrong chat
**Solution**: This has been fixed. If still occurring:
1. Refresh the page
2. Clear browser cache
3. Create new chat session

### Issue: AI not responding properly
**Solution**: This has been fixed. AI now:
- Understands "draft", "create", "write" commands
- Provides specific guidance
- Asks for necessary information
- Takes action based on your requests

---

## 💡 Tips for Best Experience

### Getting Better AI Responses
✅ **Be specific**: "Draft a rental agreement for my property in Mumbai"
✅ **Provide context**: "I need to evict a tenant who hasn't paid rent for 3 months"
✅ **Ask follow-ups**: Continue the conversation for better results

❌ **Avoid vague**: "Help me"
❌ **Don't be too brief**: "Agreement"

### Using the Draft Feature
1. Use "Draft Agreement" button for structured documents
2. Answer all required questions (marked with *)
3. Review generated document before using
4. Customize as needed for your specific case

### File Uploads
- Upload clear, readable documents
- PDFs work best for text extraction
- Images should be high quality for OCR
- One file per message for best results

---

## 🎨 UI Features

### Modern Components
- **Sparkles Background**: Animated particles on landing page
- **Liquid Glass Button**: Premium CTA with glass morphism
- **AI Prompt Box**: Advanced input with:
  - Auto-resize textarea
  - Drag & drop file upload
  - Image preview
  - Voice recording UI (coming soon)
  - Send/stop controls

### Responsive Design
- Works on desktop, tablet, and mobile
- Adaptive layouts
- Touch-friendly controls

---

## 📱 Keyboard Shortcuts

- **Enter**: Send message
- **Shift + Enter**: New line in message
- **Ctrl/Cmd + K**: Focus input (coming soon)
- **Esc**: Close modals

---

## 🔐 Security Features

- Passwords hashed with bcrypt
- Session-based authentication
- OTP verification for password reset
- Secure file storage in Supabase
- User data isolation

---

## 📊 What's Working

✅ User authentication (Email/Password & Google OAuth)
✅ Password reset with OTP
✅ Multiple chat sessions
✅ File upload and isolation per session
✅ AI chat with context awareness
✅ Agreement workflow with templates
✅ Document generation
✅ Modern UI with animations
✅ Responsive design

---

## 🚧 What's Coming

🔜 Real AI integration (GPT-4/Claude)
🔜 Advanced document templates
🔜 PDF/DOCX export with formatting
🔜 OCR for scanned documents
🔜 Voice messages
🔜 Document comparison
🔜 Legal knowledge base
🔜 Multi-language support

---

## 📞 Need Help?

1. Check `FIXES_APPLIED.md` for detailed fix documentation
2. Check browser console (F12) for errors
3. Check server terminal for API errors
4. Verify `.env.local` has all required variables
5. Ensure Supabase database schema is correct

---

## 🎉 Enjoy Legalify!

Your AI-powered legal assistant is ready to help you with:
- Drafting legal documents
- Understanding legal procedures
- Analyzing documents
- Getting legal guidance

**Remember**: This is an AI assistant. For critical legal matters, always consult a qualified lawyer.
