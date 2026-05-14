-- ============================================================
-- Phase 4: Customers + Expenses
-- Run in Supabase > SQL Editor
-- ============================================================

-- ── Customers ─────────────────────────────────────────────────
CREATE TABLE customers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  phone       text,
  email       text,
  notes       text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- Link orders to a customer (optional — existing orders stay NULL)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES customers(id) ON DELETE SET NULL;

-- ── Expenses ──────────────────────────────────────────────────
CREATE TABLE expenses (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category     text NOT NULL,          -- 'Rent','Transport','Utilities','Marketing','Packaging','Other'
  description  text NOT NULL,
  amount       numeric(10,2) NOT NULL CHECK (amount > 0),
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  notes        text,
  created_at   timestamptz DEFAULT now()
);

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_all" ON customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "staff_all" ON expenses  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── Grants ────────────────────────────────────────────────────
GRANT ALL ON TABLE customers, expenses TO authenticated;
