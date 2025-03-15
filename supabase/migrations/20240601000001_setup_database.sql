-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  email TEXT,
  name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  image TEXT,
  token_identifier TEXT NOT NULL,
  subscription TEXT,
  credits TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create licenses table
CREATE TABLE IF NOT EXISTS public.licenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  product_name TEXT NOT NULL,
  license_key TEXT NOT NULL,
  hwid TEXT,
  active BOOLEAN DEFAULT TRUE,
  last_reset_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  rating INTEGER NOT NULL,
  review_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT unique_user_product UNIQUE (user_id, product_name)
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  stripe_id TEXT,
  customer_id TEXT,
  price_id TEXT,
  stripe_price_id TEXT,
  amount INTEGER,
  currency TEXT,
  interval TEXT,
  status TEXT,
  current_period_start INTEGER,
  current_period_end INTEGER,
  cancel_at_period_end BOOLEAN,
  canceled_at INTEGER,
  ended_at INTEGER,
  started_at INTEGER,
  metadata JSONB,
  custom_field_data JSONB,
  customer_cancellation_reason TEXT,
  customer_cancellation_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create webhook_events table
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  type TEXT NOT NULL,
  stripe_event_id TEXT,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create license key generation function
CREATE OR REPLACE FUNCTION generate_license_key(product_code TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  random_part TEXT;
  date_part TEXT;
  license_key TEXT;
BEGIN
  -- Generate a random alphanumeric string (6 characters)
  SELECT string_agg(substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', ceil(random() * 36)::integer, 1), '')
  FROM generate_series(1, 6) 
  INTO random_part;
  
  -- Get current date in YYYYMMDD format
  date_part := to_char(current_date, 'YYYYMMDD');
  
  -- Combine parts to form license key
  license_key := product_code || '-' || random_part || '-' || date_part;
  
  RETURN license_key;
END;
$$;

-- Set up Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users policies
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = user_id);

-- Licenses policies
DROP POLICY IF EXISTS "Users can view their own licenses" ON public.licenses;
CREATE POLICY "Users can view their own licenses" ON public.licenses
  FOR SELECT USING (auth.uid() = user_id);

-- Reviews policies
DROP POLICY IF EXISTS "Users can view all reviews" ON public.reviews;
CREATE POLICY "Users can view all reviews" ON public.reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own reviews" ON public.reviews;
CREATE POLICY "Users can create their own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Subscriptions policies
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Enable realtime
alter publication supabase_realtime add table licenses;
alter publication supabase_realtime add table reviews;
alter publication supabase_realtime add table subscriptions;
