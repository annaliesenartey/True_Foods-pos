export type CupSize = "500ml" | "1L";

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category_id: string | null;
  cup_size: CupSize;
  price_ghs: number;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Material {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
  low_stock_threshold: number;
  cost_per_unit: number | null;
  created_at: string;
  updated_at: string;
}

export interface MaterialPurchase {
  id: string;
  material_id: string;
  quantity: number;
  cost_per_unit: number | null;
  total_cost: number | null;
  purchased_at: string;
  notes: string | null;
  created_at: string;
  material?: Material;
}

export interface ProductionRun {
  id: string;
  production_date: string;
  notes: string | null;
  created_at: string;
  items?: ProductionRunItem[];
  materials_used?: ProductionRunMaterial[];
}

export interface ProductionRunItem {
  id: string;
  production_run_id: string;
  product_id: string;
  quantity_produced: number;
  product?: Product;
}

export interface ProductionRunMaterial {
  id: string;
  production_run_id: string;
  material_id: string;
  quantity_used: number;
  material?: Material;
}
