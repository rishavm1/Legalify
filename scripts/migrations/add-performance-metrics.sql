-- Performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  duration_ms INTEGER NOT NULL,
  status_code INTEGER NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_performance_endpoint ON performance_metrics(endpoint);
CREATE INDEX idx_performance_created_at ON performance_metrics(created_at DESC);
CREATE INDEX idx_performance_duration ON performance_metrics(duration_ms DESC);
