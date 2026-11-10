-- Personal profile values are entered in D1, never seeded from source control.
CREATE TABLE IF NOT EXISTS private_profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  height_cm REAL CHECK (height_cm BETWEEN 50 AND 250)
);
