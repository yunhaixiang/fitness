CREATE TABLE IF NOT EXISTS training_entries (
  date TEXT NOT NULL,
  exercise TEXT NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('home', 'gym')),
  sets_json TEXT NOT NULL,
  effort TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (date, exercise)
);
CREATE INDEX IF NOT EXISTS training_exercise_date ON training_entries(exercise, date DESC);
