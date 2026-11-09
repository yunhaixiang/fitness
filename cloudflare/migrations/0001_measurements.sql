CREATE TABLE IF NOT EXISTS measurements (
  date TEXT PRIMARY KEY,
  weight REAL NOT NULL CHECK(weight BETWEEN 20 AND 350),
  bf REAL NOT NULL CHECK(bf BETWEEN 2 AND 70),
  measured_at TEXT NOT NULL,
  body_fat_measured_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS measurements_time ON measurements(measured_at);
CREATE TABLE IF NOT EXISTS sync_tokens (
  id INTEGER PRIMARY KEY CHECK(id = 1),
  token_hash TEXT NOT NULL
);
