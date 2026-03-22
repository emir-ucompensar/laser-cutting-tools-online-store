import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';

import { SupabaseService } from './supabase.service';
import { CartItem } from '../models/cart.models';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly TABLE = 'cart_items';

  constructor(private supabaseService: SupabaseService) {}

  getCartItems(): Observable<CartItem[]> {
    const promise = this.supabaseService.supabase
      .from(this.TABLE)
      .select(`
        id,
        product_id,
        quantity,
        user_id,
        products:product_id (
          id,
          name,
          type,
          price,
          image_url
        )
      `)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) throw error;

        return (data ?? []).map((row: any) => {
          const relation = Array.isArray(row.products) ? row.products[0] : row.products;
          return {
            id: row.id,
            product_id: row.product_id,
            quantity: row.quantity,
            user_id: row.user_id,
            products: relation,
          } as CartItem;
        });
      });

    return from(promise);
  }

  addProduct(productId: string, userId: string): Observable<void> {
    const promise = this.supabaseService.supabase
      .from(this.TABLE)
      .select('id, quantity')
      .eq('product_id', productId)
      .eq('user_id', userId)
      .maybeSingle()
      .then(async ({ data, error }) => {
        if (error) throw error;

        if (data?.id) {
          const { error: updateError } = await this.supabaseService.supabase
            .from(this.TABLE)
            .update({ quantity: (data.quantity ?? 0) + 1 })
            .eq('id', data.id);

          if (updateError) throw updateError;
          return;
        }

        const { error: insertError } = await this.supabaseService.supabase
          .from(this.TABLE)
          .insert({
            product_id: productId,
            quantity: 1,
            user_id: userId,
          });

        if (insertError) throw insertError;
      });

    return from(promise);
  }

  updateQuantity(itemId: string, quantity: number): Observable<void> {
    const promise = this.supabaseService.supabase
      .from(this.TABLE)
      .update({ quantity })
      .eq('id', itemId)
      .then(({ error }) => {
        if (error) throw error;
      });

    return from(promise);
  }

  removeItem(itemId: string): Observable<void> {
    const promise = this.supabaseService.supabase
      .from(this.TABLE)
      .delete()
      .eq('id', itemId)
      .then(({ error }) => {
        if (error) throw error;
      });

    return from(promise);
  }
}
