/*
  # Add target year to notices

  Adds a `target_year` column to the notices table so teachers can
  publish notices limited to a specific student year or to all years.
*/

ALTER TABLE notices
  ADD COLUMN IF NOT EXISTS target_years integer[] CHECK (target_years IS NULL OR (array_length(target_years, 1) > 0 AND target_years <@ ARRAY[1,2,3,4]));
