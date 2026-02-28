import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { capacitorStorageAdapter } from '../storage/capacitor-storage.adapter';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(
      environment.supabase.url,
      environment.supabase.key,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
          // Usa @capacitor/preferences para persistir la sesión de forma
          // nativa en Android y en web vía su capa de compatibilidad.
          storage: capacitorStorageAdapter,
        }
      }
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
