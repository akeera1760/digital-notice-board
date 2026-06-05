/*
  # Seed Default Data

  Seeds default departments and categories for the notice board.
*/

INSERT INTO departments (name, code) VALUES
  ('Computer Science & Engineering', 'CSE'),
  ('CSE-Core', 'CORE'),
  ('Electronics & Communication', 'ECE'),
  ('Civil Engineering', 'CE'),
  ('Electrical Engineering', 'EE'),
  ('Information Technology', 'IT')
ON CONFLICT (code) DO NOTHING;

INSERT INTO categories (name, color, icon) VALUES
  ('Academic', '#2563EB', 'book-open'),
  ('Examinations', '#DC2626', 'file-text'),
  ('Events', '#16A34A', 'calendar'),
  ('Placement', '#D97706', 'briefcase'),
  ('Sports', '#0891B2', 'trophy'),
  ('Clubs & Societies', '#7C3AED', 'users'),
  ('Scholarships', '#059669', 'award'),
  ('General', '#6B7280', 'bell'),
  ('Holiday', '#EA580C', 'sun'),
  ('Fee Payment', '#B45309', 'credit-card')
ON CONFLICT (name) DO NOTHING;
