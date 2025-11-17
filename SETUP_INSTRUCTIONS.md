# 🚀 LEGALIFY - COMPLETE SETUP INSTRUCTIONS

## STEP 1: DATABASE SETUP (5 MINUTES) ✅

### Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard/project/lyyqkvdnarwbvxguqwvg
2. Click "SQL Editor" in left sidebar
3. Click "New Query"
4. Copy and paste the SQL below
5. Click "Run" button

### SQL Migration (Copy This):

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Legal documents table for RAG system
CREATE TABLE IF NOT EXISTS legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  act_name TEXT,
  section_number TEXT,
  content TEXT NOT NULL,
  document_type TEXT CHECK (document_type IN ('act', 'case', 'article', 'amendment')),
  embedding vector(768),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS legal_documents_embedding_idx ON legal_documents USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS legal_documents_act_idx ON legal_documents(act_name);
CREATE INDEX IF NOT EXISTS legal_documents_type_idx ON legal_documents(document_type);

-- Search function for RAG
CREATE OR REPLACE FUNCTION search_legal_documents(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  act_name TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    legal_documents.id,
    legal_documents.title,
    legal_documents.content,
    legal_documents.act_name,
    1 - (legal_documents.embedding <=> query_embedding) as similarity
  FROM legal_documents
  WHERE 1 - (legal_documents.embedding <=> query_embedding) > match_threshold
  ORDER BY legal_documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Judgments table
CREATE TABLE IF NOT EXISTS judgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT UNIQUE NOT NULL,
  case_title TEXT NOT NULL,
  court TEXT NOT NULL,
  judges TEXT[],
  petitioner TEXT,
  respondent TEXT,
  judgment_date DATE,
  facts TEXT,
  issues TEXT[],
  decision TEXT,
  ratio_decidendi TEXT,
  precedents TEXT[],
  citations TEXT[],
  full_text TEXT,
  summary TEXT,
  embedding vector(768),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS judgments_embedding_idx ON judgments USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS judgments_case_number_idx ON judgments(case_number);
CREATE INDEX IF NOT EXISTS judgments_court_idx ON judgments(court);

-- Templates table
CREATE TABLE IF NOT EXISTS legal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type TEXT NOT NULL,
  template_name TEXT NOT NULL,
  template_content TEXT NOT NULL,
  input_fields JSONB,
  example_output TEXT,
  court_type TEXT,
  case_type TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS templates_type_idx ON legal_templates(template_type);
CREATE INDEX IF NOT EXISTS templates_court_idx ON legal_templates(court_type);

-- Training data for SFT
CREATE TABLE IF NOT EXISTS training_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instruction TEXT NOT NULL,
  input TEXT,
  output TEXT NOT NULL,
  data_type TEXT CHECK (data_type IN ('petition', 'memo', 'argument', 'notice', 'reply')),
  quality_score FLOAT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS training_data_type_idx ON training_data(data_type);
CREATE INDEX IF NOT EXISTS training_data_verified_idx ON training_data(verified);

-- User preferences
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';
ALTER TABLE users ADD COLUMN IF NOT EXISTS voice_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS features_enabled JSONB DEFAULT '{"voice": false, "translation": false, "rag_search": true, "judgment_analysis": true}'::jsonb;
```

### Verify Success:
- You should see "Success. No rows returned" message
- Check Tables list - you should see: legal_documents, judgments, legal_templates, training_data

---

## STEP 2: AUTOMATED SETUP (RUNS AUTOMATICALLY) ✅

### What It Does:
1. Scrapes Indian laws from indiacode.nic.in
2. Builds RAG database with embeddings
3. Collects legal templates
4. Prepares training data

### Run This Command:
```bash
python scripts/automated_setup.py
```

### Expected Output:
```
[SUCCESS] Legal database scraped successfully
[SUCCESS] RAG database built successfully
[SUCCESS] Templates collected successfully
[SUCCESS] Training data prepared successfully
```

### Files Created:
- `data/legal_acts/*.txt` - Indian legal acts
- `data/rag_database.json` - RAG embeddings
- `data/templates/templates_collection.json` - Templates
- `data/sft_training_data.jsonl` - Training data

---

## STEP 3: UPLOAD TO SUPABASE (5 MINUTES)

### Upload RAG Database:
1. Go to Supabase Dashboard
2. Click "Table Editor" → "legal_documents"
3. Click "Insert" → "Import data from CSV/JSON"
4. Select `data/rag_database.json`
5. Click "Import"

### Verify:
- Check legal_documents table has rows
- Each row should have: title, content, embedding (768 dimensions)

---

## STEP 4: DEPLOY TO PRODUCTION (2 MINUTES) ✅

### Deploy to Vercel:
```bash
vercel --prod
```

### Verify Deployment:
- Visit: https://legalifylunatics.vercel.app
- Test all features:
  - ✅ Chat interface
  - ✅ Document generation
  - ✅ Legal research
  - ✅ Memo generation
  - ✅ Argument generation
  - ✅ Voice input (if enabled)
  - ✅ Translation (if enabled)

---

## OPTIONAL: FINE-TUNE MODEL (2 WEEKS)

### Requirements:
- GPU (Google Colab Pro, RunPod, or Vast.ai)
- 16GB+ VRAM
- Python 3.10+

### Install Dependencies:
```bash
pip install transformers peft bitsandbytes accelerate datasets torch
```

### Run Fine-Tuning:
```bash
python scripts/finetune_model.py
```

### Upload to HuggingFace:
```bash
huggingface-cli login
huggingface-cli upload legalify/llama-7b-legal models/legalify-llama-7b
```

### Update Environment Variable:
```bash
# Add to Vercel environment variables
FINETUNED_MODEL_NAME=legalify/llama-7b-legal
```

---

## VERIFICATION CHECKLIST

### Database:
- [ ] pgvector extension enabled
- [ ] legal_documents table created
- [ ] judgments table created
- [ ] legal_templates table created
- [ ] training_data table created
- [ ] Search function created

### Data:
- [ ] Indian laws scraped (15+ acts)
- [ ] RAG database built
- [ ] Templates collected
- [ ] Training data prepared
- [ ] Data uploaded to Supabase

### APIs Working:
- [ ] /api/judgments/analyze
- [ ] /api/hearings
- [ ] /api/strategies
- [ ] /api/voice
- [ ] /api/translate
- [ ] /api/semantic-search

### Deployment:
- [ ] Deployed to Vercel
- [ ] All environment variables set
- [ ] Production URL working
- [ ] All features tested

---

## TROUBLESHOOTING

### Issue: "Module not found: bs4"
**Solution**: 
```bash
pip install beautifulsoup4 PyPDF2 requests
```

### Issue: "pgvector extension not found"
**Solution**: 
- Go to Supabase Dashboard → Database → Extensions
- Search for "vector"
- Click "Enable" on pgvector

### Issue: "Unicode encoding error"
**Solution**: Already fixed in scripts. Re-run automated_setup.py

### Issue: "Rate limit exceeded"
**Solution**: 
- Wait 1 hour
- Or upgrade to Pro plan in Supabase

---

## COST BREAKDOWN

### Free Tier (Current):
- Supabase: Free (500MB database)
- Vercel: Free (100GB bandwidth)
- Google APIs: Free (limited usage)
- **Total: $0/month**

### Pro Tier (Recommended):
- Supabase Pro: $25/month
- Google APIs: $20-50/month
- HuggingFace Inference: $30-75/month
- **Total: $75-150/month**

### One-Time Costs:
- GPU for fine-tuning: $50-100
- Domain (optional): $10/year

---

## SUPPORT

**Issues?** 
- GitHub: https://github.com/rishavm1/Legalify/issues
- Email: rishabh@example.com

**Team:**
- Rishabh Verma (@rishavm1)
- Anirban Chowdhury (@biriyani4ever-one)
- Shantanu Raj (@shantanuraj5002-art)

---

## SUCCESS! 🎉

**Your AI Legal Companion is now 100% ready!**

Features Implemented:
✅ Document generation
✅ Judgment analysis
✅ Hearing tracking
✅ AI strategy generation
✅ Voice input (8 languages)
✅ Translation (8 languages)
✅ RAG search system
✅ Case management
✅ Template system
✅ Fine-tuning ready

**Production URL**: https://legalifylunatics.vercel.app

**Ab bas use karo aur clients ko impress karo! 🚀**
