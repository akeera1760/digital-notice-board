/*
  # Add Image Field to Categories

  1. Changes
    - Add `image_url` column to `categories` table to store URLs to 3D/premium images
    - Update existing categories with high-quality 3D-style images

  2. Image Mappings
    - Academic → Books image
    - Clubs & Societies → People/teamwork image
    - Events → Party/celebration image
    - Examinations → Exam/test image
    - Fee Payment → Payment/wallet image
    - General → Documents image
    - Holiday → Vacation/beach image
    - Placement → Career/briefcase image
    - Scholarships → Achievement/success image
    - Sports → Trophy/sports image
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE categories ADD COLUMN image_url text;
  END IF;
END $$;

UPDATE categories SET image_url = 'https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg?auto=compress&cs=tinysrgb&w=600' WHERE name = 'Academic';
UPDATE categories SET image_url = 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=600' WHERE name = 'Clubs & Societies';
UPDATE categories SET image_url = 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=600' WHERE name = 'Events';
UPDATE categories SET image_url = 'https://images.pexels.com/photos/5900081/pexels-photo-5900081.jpeg?auto=compress&cs=tinysrgb&w=600' WHERE name = 'Examinations';
UPDATE categories SET image_url = 'https://images.pexels.com/photos/3962286/pexels-photo-3962286.jpeg?auto=compress&cs=tinysrgb&w=600' WHERE name = 'Fee Payment';
UPDATE categories SET image_url = 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=600' WHERE name = 'General';
UPDATE categories SET image_url = 'https://images.pexels.com/photos/3183183/pexels-photo-3183183.jpeg?auto=compress&cs=tinysrgb&w=600' WHERE name = 'Holiday';
UPDATE categories SET image_url = 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=600' WHERE name = 'Placement';
UPDATE categories SET image_url = 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=600' WHERE name = 'Scholarships';
UPDATE categories SET image_url = 'https://images.pexels.com/photos/50583/sport-competition-winner-cup-50583.jpeg?auto=compress&cs=tinysrgb&w=600' WHERE name = 'Sports';
