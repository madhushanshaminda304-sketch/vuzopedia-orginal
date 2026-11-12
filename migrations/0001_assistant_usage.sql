CREATE TABLE IF NOT EXISTS assistant_daily_usage (
  day TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL CHECK (attempts >= 0)
);
