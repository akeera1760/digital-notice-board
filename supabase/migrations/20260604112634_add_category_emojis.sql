/*
  # Update Categories with Emojis

  1. Changes
    - Add `emoji` column to `categories` table
    - Update all categories with appropriate emojis

  2. Emoji Mappings
    - Academic → 📚
    - Clubs & Societies → 👥
    - Events → 🎉
    - Examinations → ✏️
    - Fee Payment → 💳
    - General → 📄
    - Holiday → 🏖️
    - Placement → 💼
    - Scholarships → 🏅
    - Sports → 🏆
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'emoji'
  ) THEN
    ALTER TABLE categories ADD COLUMN emoji text;
  END IF;
END $$;

UPDATE categories SET emoji = '📚' WHERE name = 'Academic';
UPDATE categories SET emoji = '👥' WHERE name = 'Clubs & Societies';
UPDATE categories SET emoji = '🎉' WHERE name = 'Events';
UPDATE categories SET emoji = '✏️' WHERE name = 'Examinations';
UPDATE categories SET emoji = '💳' WHERE name = 'Fee Payment';
UPDATE categories SET emoji = '📄' WHERE name = 'General';
UPDATE categories SET emoji = '🏖️' WHERE name = 'Holiday';
UPDATE categories SET emoji = '💼' WHERE name = 'Placement';
UPDATE categories SET emoji = '🏅' WHERE name = 'Scholarships';
UPDATE categories SET emoji = '🏆' WHERE name = 'Sports';
