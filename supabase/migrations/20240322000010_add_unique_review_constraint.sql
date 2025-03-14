-- Add a unique constraint to ensure one review per user per product
ALTER TABLE reviews ADD CONSTRAINT unique_user_product_review UNIQUE (user_id, product_name);