-- Values are populated privately in D1; no personal data is seeded here.
ALTER TABLE private_profile ADD COLUMN age_years INTEGER CHECK (age_years BETWEEN 18 AND 120);
ALTER TABLE private_profile ADD COLUMN sex TEXT CHECK (sex IN ('male', 'female'));
ALTER TABLE private_profile ADD COLUMN exercise_reference_weight_kg REAL CHECK (exercise_reference_weight_kg BETWEEN 20 AND 350);
