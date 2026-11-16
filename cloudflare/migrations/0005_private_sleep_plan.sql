-- Personal schedules are populated only in D1, never in repository seed data.
CREATE TABLE IF NOT EXISTS private_sleep_plan (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  plan_json TEXT NOT NULL CHECK (json_valid(plan_json))
);
