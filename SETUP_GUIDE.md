# Setup Guide

## 1. Install Dependencies
```bash
npm install
```

## 2. Configure Environment Variables

Update `.env.local` with your actual credentials:

### Google OAuth Setup
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

### MongoDB Setup
- Install MongoDB locally or use MongoDB Atlas
- Update `MONGODB_URI` in `.env.local`

### Email Setup (Gmail)
1. Enable 2-factor authentication on your Gmail
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Update `EMAIL_USER` and `EMAIL_PASSWORD` in `.env.local`

### Twilio Setup (SMS)
1. Sign up at https://www.twilio.com/
2. Get Account SID, Auth Token, and Phone Number
3. Update Twilio credentials in `.env.local`

### NextAuth Secret
Generate a random secret:
```bash
openssl rand -base64 32
```
Update `NEXTAUTH_SECRET` in `.env.local`

## 3. Run the Application
```bash
npm run dev
```

## 4. Access the Application
Open http://localhost:3000

## Features Implemented

### 1. Word Document Export
- Download button now exports as `.docx` format
- Users can edit the document in Microsoft Word

### 2. Authentication System
- **Google OAuth**: One-click sign-in with Google
- **Email OTP**: Enter email → Receive OTP → Verify
- **Phone OTP**: Enter phone → Receive SMS OTP → Verify
- Black-themed login page matching your design

### 3. User Data Storage
- All user data stored in MongoDB
- Only developers can access the database
- User sessions managed securely

### 4. Document History
- All generated documents saved automatically
- Users can view their recent documents
- Documents persist across sessions

### 5. Session Management
- Users stay logged in
- Can continue from where they left off
- Option to start new documents anytime

## Database Collections

### users
- Stores user information (email, phone, name, etc.)
- Created on first login

### documents
- Stores all generated documents
- Linked to user ID
- Includes template, answers, and generated content

### otps
- Temporary storage for OTP verification
- Auto-expires after 10 minutes

## Admin Access

To view user data, connect to MongoDB:
```bash
mongosh mongodb://localhost:27017/legalify
```

View users:
```javascript
db.users.find()
```

View documents:
```javascript
db.documents.find()
```
