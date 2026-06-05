/*
  # Allow public access to department list

  This migration updates the department SELECT policy so the registration
  page can fetch department values before the user is authenticated.
*/

DROP POLICY IF EXISTS "Anyone can view departments" ON departments;

CREATE POLICY "Anyone can view departments"
  ON departments FOR SELECT
  TO public
  USING (true);
