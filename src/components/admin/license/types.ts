export interface License {
  id: string;
  user_id: string;
  product_name: string;
  license_key: string;
  hwid: string | null;
  created_at: string;
  updated_at: string;
  active: boolean;
  last_reset_date?: string | null;
  expires_at?: string | null;
  user_email?: string;
}

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
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role_name: string;
}

export interface LicenseFormData {
  userId: string;
  productName: string;
  expiryDate: Date | undefined;
}

export const LICENSES_PER_PAGE = 10;
