import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(
      environment.supabase.url,
      environment.supabase.key
    );
  }

  /**
   * Expone el cliente de Supabase para que otros servicios lo usen.
   * No se usa directamente en componentes — solo en servicios.
   */
  get supabase(): SupabaseClient {
    return this.client;
  }
}
