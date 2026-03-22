export interface CartProduct {
  id: string;
  name: string;
  type: string;
  price: number;
  image_url: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  user_id: string;
  products: CartProduct;
}
