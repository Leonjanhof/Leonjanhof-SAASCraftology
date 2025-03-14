-- Enable realtime for reviews table
alter publication supabase_realtime add table reviews;

-- Enable realtime for licenses table
alter publication supabase_realtime add table licenses;

-- Enable realtime for subscriptions table
alter publication supabase_realtime add table subscriptions;
