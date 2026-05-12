-- ============================================================
-- Stock helper functions (run after 001)
-- ============================================================

CREATE OR REPLACE FUNCTION increment_material_stock(p_material_id uuid, p_quantity numeric)
RETURNS void AS $$
BEGIN
  UPDATE materials SET current_stock = current_stock + p_quantity WHERE id = p_material_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_material_stock(p_material_id uuid, p_quantity numeric)
RETURNS void AS $$
BEGIN
  UPDATE materials SET current_stock = GREATEST(0, current_stock - p_quantity) WHERE id = p_material_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_product_stock(p_product_id uuid, p_quantity integer)
RETURNS void AS $$
BEGIN
  UPDATE products SET stock_quantity = stock_quantity + p_quantity WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_product_stock(p_product_id uuid, p_quantity integer)
RETURNS void AS $$
BEGIN
  UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - p_quantity) WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
