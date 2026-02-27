/** Representa un producto de la tienda */
export interface Product {
  id: string;
  name: string;
  type: string;
  price: number;
  image_url: string;
  created_by: string;
  created_at: string;
}

/** Datos requeridos para insertar un nuevo producto */
export type CreateProductDto = Omit<Product, 'id' | 'created_at'>;
