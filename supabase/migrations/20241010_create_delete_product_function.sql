-- Create a function to delete a product by its product_id
CREATE OR REPLACE FUNCTION delete_product(p_product_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_product RECORD;
  v_result JSONB;
BEGIN
  -- Check if the product exists
  SELECT * INTO v_product FROM products WHERE product_id = p_product_id;
  
  IF NOT FOUND THEN
    -- Try to find by id if product_id not found
    SELECT * INTO v_product FROM products WHERE id = p_product_id;
    
    IF NOT FOUND THEN
      RETURN jsonb_build_object(
        'success', false,
        'message', 'Product not found'
      );
    END IF;
  END IF;
  
  -- Delete the product
  DELETE FROM products WHERE product_id = COALESCE(v_product.product_id, p_product_id);
  
  -- Return success response
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Product deleted successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'message', 'Failed to delete product: ' || SQLERRM
  );
END;
$$;

-- Add publication for realtime
ALTER PUBLICATION supabase_realtime ADD TABLE products;
