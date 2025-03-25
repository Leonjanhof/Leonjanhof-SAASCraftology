export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  price_id: string;
  features: string[];
  is_subscription: boolean;
  is_popular: boolean;
  icon_name: string;
  created_at: string;
  updated_at: string;
  product_id?: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  price_id: string;
  features: string[];
  is_subscription: boolean;
  is_popular: boolean;
  icon_name: string;
}
