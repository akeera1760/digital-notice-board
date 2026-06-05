/*
  # Allow public teacher key validation

  Enables teacher registration to verify a key before a user is authenticated.
*/

DROP POLICY IF EXISTS "Teachers can view all keys" ON teacher_keys;

CREATE POLICY "Teacher key validation for registration"
  ON teacher_keys FOR SELECT
  TO public
  USING (true);
