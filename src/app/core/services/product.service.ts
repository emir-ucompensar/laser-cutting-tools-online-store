import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

import { SupabaseService } from './supabase.service';
import { Product, CreateProductDto } from '../models/product.models';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly TABLE = 'products';
  private readonly BUCKET = 'products';

  constructor(
    private supabaseService: SupabaseService,
    private http: HttpClient,
  ) {}

  /** Lee los tipos de producto desde el XML en assets */
  getProductTypes(): Observable<string[]> {
    return this.http
      .get('assets/data/product-types.xml', { responseType: 'text' })
      .pipe(
        map((xml) => {
          const doc = new DOMParser().parseFromString(xml, 'text/xml');
          return Array.from(doc.querySelectorAll('type')).map((el) => el.textContent ?? '');
        })
      );
  }

  /** Obtiene todos los productos ordenados por fecha de creación descendente */
  getProducts(): Observable<Product[]> {
    const promise = this.supabaseService.supabase
      .from(this.TABLE)
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) throw error;
        return data as Product[];
      });

    return from(promise);
  }

  /**
   * Sube una imagen al bucket de storage.
   * Devuelve la URL pública del archivo subido.
   */
  uploadImage(blob: Blob, fileName: string): Observable<string> {
    const promise = this.supabaseService.supabase.storage
      .from(this.BUCKET)
      .upload(fileName, blob, { upsert: true })
      .then(({ data, error }) => {
        if (error) throw error;
        const { data: urlData } = this.supabaseService.supabase.storage
          .from(this.BUCKET)
          .getPublicUrl(data.path);
        return urlData.publicUrl;
      });

    return from(promise);
  }

  /** Elimina un producto por su id */
  deleteProduct(id: string): Observable<void> {
    const promise = this.supabaseService.supabase
      .from(this.TABLE)
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) throw error;
      });

    return from(promise);
  }

  /** Inserta un nuevo producto y devuelve el registro creado */
  createProduct(dto: CreateProductDto): Observable<Product> {
    const promise = this.supabaseService.supabase
      .from(this.TABLE)
      .insert(dto)
      .select()
      .single()
      .then(({ data, error }) => {
        if (error) throw error;
        return data as Product;
      });

    return from(promise);
  }
}
