/*
  # Seed sample teacher keys

  Adds sample teacher registration keys for testing purposes.
  These keys can be used during teacher registration.
*/

INSERT INTO teacher_keys (key, name, department_id) VALUES
  ('TEACHER-ADMIN-1760', 'Admin', NULL),
  ('TEACHER-HOD-CSE-1721', 'Computer Science & Engineering HOD', (SELECT id FROM departments WHERE code = 'CSE')),
  ('TEACHER-HOD-CORE-1722', 'CSE_CORE HOD', (SELECT id FROM departments WHERE code = 'CORE')),
  ('TEACHER-HOD-ECE-1723', 'Electrical & Communication HOD', (SELECT id FROM departments WHERE code = 'ECE')),
  ('TEACHER-HOD-IT-1724', 'Information Technology HOD', (SELECT id FROM departments WHERE code = 'IT')),
  ('TEACHER-HOD-CE-1725', 'Civil Engineering HOD', (SELECT id FROM departments WHERE code = 'CE')),
  ('TEACHER-HOD-EE-1726', 'Electrical Engineering HOD', (SELECT id FROM departments WHERE code = 'EE')),
  ('TEACHER-OTHER-1727', 'Other', NULL)
ON CONFLICT (key) DO NOTHING;
