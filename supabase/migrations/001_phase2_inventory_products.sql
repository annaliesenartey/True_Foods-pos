-- ============================================================
-- Phase 2: Products & Inventory
-- Run this in Supabase > SQL Editor
-- ============================================================

-- Categories
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Products
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  cup_size text NOT NULL CHECK (cup_size IN ('500ml', '1L')),
  price_ghs numeric(10,2) NOT NULL CHECK (price_ghs > 0),
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold integer NOT NULL DEFAULT 10,
  is_active boolean NOT NULL DEFAULT true,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Raw Materials
CREATE TABLE materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  unit text NOT NULL,
  current_stock numeric(10,3) NOT NULL DEFAULT 0,
  low_stock_threshold numeric(10,3) NOT NULL DEFAULT 0,
  cost_per_unit numeric(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Material Purchases (when you buy supplies)
CREATE TABLE material_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  quantity numeric(10,3) NOT NULL CHECK (quantity > 0),
  cost_per_unit numeric(10,2),
  total_cost numeric(10,2),
  purchased_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Production Runs
CREATE TABLE production_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  production_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Products made per production run
CREATE TABLE production_run_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  production_run_id uuid NOT NULL REFERENCES production_runs(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity_produced integer NOT NULL CHECK (quantity_produced > 0)
);

-- Materials consumed per production run
CREATE TABLE production_run_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  production_run_id uuid NOT NULL REFERENCES production_runs(id) ON DELETE CASCADE,
  material_id uuid NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  quantity_used numeric(10,3) NOT NULL CHECK (quantity_used > 0)
);

-- ============================================================
-- Row Level Security — only authenticated staff can access
-- ============================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_run_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_run_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_all" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "staff_all" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "staff_all" ON materials FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "staff_all" ON material_purchases FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "staff_all" ON production_runs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "staff_all" ON production_run_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "staff_all" ON production_run_materials FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- Auto-update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER materials_updated_at BEFORE UPDATE ON materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Seed: Default categories
-- ============================================================
INSERT INTO categories (name) VALUES
  ('Plain Yoghurt'),
  ('Fruit Yoghurt'),
  ('Smoothies'),
  ('Drinks');

-- ============================================================
-- Seed: Default materials
-- ============================================================
INSERT INTO materials (name, unit, low_stock_threshold) VALUES
  ('Powdered Milk', 'kg', 5),
  ('Culture', 'g', 100),
  ('Flavour', 'ml', 500),
  ('Sugar', 'kg', 2),
  ('500ml Cups', 'pieces', 50),
  ('1L Cups', 'pieces', 50),
  ('Labels', 'pieces', 100),
  ('500ml Covers', 'pieces', 50),
  ('1L Covers', 'pieces', 50),
  ('Packaging Bags', 'pieces', 20),
  ('Packaging Boxes', 'pieces', 10);
