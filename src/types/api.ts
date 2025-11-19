export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Product {
  data: {
    id: number;
    name: string;
    description?: string | null;
    price: number;
    stock: number;
    out_of_stock: boolean;
    created_at: string;
  }[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  product: Product;
}

export interface Cart {
  id: number;
  items: CartItem[];
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product: Product;
}

export interface Order {
  id: number;
  order_number: string;
  total: number;
  address: string;
  phone: string;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export interface AuthSuccess {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

