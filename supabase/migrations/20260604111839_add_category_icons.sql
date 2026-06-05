/*
  # Add Icon Field to Categories

  1. Changes
    - Add `icon` column to `categories` table to store lucide-react icon names
    - Update existing categories with appropriate icons based on their names

  2. Icon Mappings
    - Academic → BookOpen
    - Clubs & Societies → Users
    - Events → Calendar
    - Examinations → Pencil
    - Fee Payment → CreditCard
    - General → FileText
    - Holiday → Palmtree
    - Placement → Briefcase
    - Scholarships → Award
    - Sports → Trophy
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'icon'
  ) THEN
    ALTER TABLE categories ADD COLUMN icon text DEFAULT 'Dot';
  END IF;
END $$;

UPDATE categories SET icon = 'BookOpen' WHERE name = 'Academic';
UPDATE categories SET icon = 'Users' WHERE name = 'Clubs & Societies';
UPDATE categories SET icon = 'Calendar' WHERE name = 'Events';
UPDATE categories SET icon = 'Pencil' WHERE name = 'Examinations';
UPDATE categories SET icon = 'CreditCard' WHERE name = 'Fee Payment';
UPDATE categories SET icon = 'FileText' WHERE name = 'General';
UPDATE categories SET icon = 'Palmtree' WHERE name = 'Holiday';
UPDATE categories SET icon = 'Briefcase' WHERE name = 'Placement';
UPDATE categories SET icon = 'Award' WHERE name = 'Scholarships';
UPDATE categories SET icon = 'Trophy' WHERE name = 'Sports';
