-- COMPATIBILITY CHECK - Run this FIRST to see existing tables
-- Copy and paste this in Supabase SQL Editor to check existing structure

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- If you see 'documents' table, the new system will work alongside it
-- The new tables (chat_sessions, chat_messages, uploaded_files, user_memory) are separate

-- SAFE MIGRATION - These tables won't conflict with existing ones:
-- ✅ chat_sessions (NEW)
-- ✅ chat_messages (NEW) 
-- ✅ uploaded_files (NEW)
-- ✅ user_memory (NEW)
-- ✅ agreement_workflows (NEW)
-- ✅ documents (EXISTING - will remain unchanged)