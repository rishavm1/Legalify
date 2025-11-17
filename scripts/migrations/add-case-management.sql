-- Case Management System for "Senior Lawyer" AI

-- Cases table
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  case_number VARCHAR(100),
  case_title TEXT NOT NULL,
  case_type VARCHAR(50),
  court_name VARCHAR(255),
  filing_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  client_name VARCHAR(255),
  opponent_name VARCHAR(255),
  case_facts TEXT,
  legal_issues TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hearings table
CREATE TABLE IF NOT EXISTS hearings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  hearing_date DATE NOT NULL,
  hearing_number INTEGER,
  judge_name VARCHAR(255),
  judge_comments TEXT,
  opponent_arguments TEXT,
  our_arguments TEXT,
  court_orders TEXT,
  next_hearing_date DATE,
  outcome VARCHAR(50),
  documents_submitted TEXT[],
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Case Documents table
CREATE TABLE IF NOT EXISTS case_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  document_type VARCHAR(50),
  document_title TEXT NOT NULL,
  file_url TEXT,
  content TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- AI Strategies table
CREATE TABLE IF NOT EXISTS ai_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  hearing_id UUID REFERENCES hearings(id) ON DELETE SET NULL,
  strategy_type VARCHAR(50),
  strategy_content TEXT NOT NULL,
  confidence_score FLOAT,
  suggested_arguments TEXT[],
  suggested_documents TEXT[],
  legal_precedents TEXT[],
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Indexes
CREATE INDEX idx_cases_user_id ON cases(user_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_hearings_case_id ON hearings(case_id);
CREATE INDEX idx_hearings_date ON hearings(hearing_date DESC);
CREATE INDEX idx_case_documents_case_id ON case_documents(case_id);
CREATE INDEX idx_ai_strategies_case_id ON ai_strategies(case_id);

-- Function to update case updated_at
CREATE OR REPLACE FUNCTION update_case_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cases_timestamp
BEFORE UPDATE ON cases
FOR EACH ROW
EXECUTE FUNCTION update_case_timestamp();
