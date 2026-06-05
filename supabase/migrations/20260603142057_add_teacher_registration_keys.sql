/*
  # Add teacher registration key table

  ## Summary
  Adds a table to store valid teacher registration keys that are issued by the institution.
  Only users with a valid key can register as teachers.

  ## New Tables
  - `teacher_keys` - Valid registration keys for teacher accounts with metadata
*/

CREATE TABLE IF NOT EXISTS teacher_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  used_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  used_at timestamptz
);

ALTER TABLE teacher_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view all keys"
  ON teacher_keys FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
  );

CREATE POLICY "No public insert"
  ON teacher_keys FOR INSERT
  TO authenticated
  WITH CHECK (false);
