-- Add a test license for an existing subscription
INSERT INTO public.licenses (id, user_id, product_name, license_key, active, created_at, updated_at)
SELECT 
  gen_random_uuid(), -- Generate a random UUID for the license
  user_id, -- Use the user_id from the subscription
  'Autovoter', -- Product name
  'AUT-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 20)), -- Generate a license key with AUT prefix
  true, -- Set as active
  NOW(), -- Current timestamp for created_at
  NOW() -- Current timestamp for updated_at
FROM public.subscriptions
WHERE status = 'active'
LIMIT 1;
