INSERT INTO licenses (user_id, product_name, license_key, hwid, active)
VALUES 
  ((SELECT id FROM auth.users LIMIT 1), 'Autovoter', 'AV-1234ABCD5678', NULL, true),
  ((SELECT id FROM auth.users LIMIT 1), 'FactionsBot', 'FB-5678EFGH1234', 'HWID-12345-67890', true),
  ((SELECT id FROM auth.users LIMIT 1), 'EMC Captcha Solver', 'CS-9012IJKL3456', NULL, true);