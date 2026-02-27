import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Session } from '@supabase/supabase-js';

import { SupabaseService } from './supabase.service';
import { AuthResult } from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private supabaseService: SupabaseService) {}

  /** Registra un nuevo usuario con email y contraseña */
  register(email: string, password: string): Observable<AuthResult> {
    const promise = this.supabaseService.supabase.auth
      .signUp({ email, password })
      .then(({ data, error }) => ({
        data: data ?? null,
        error: error?.message ?? null,
      }));

    return from(promise);
  }

  /** Inicia sesión con email y contraseña */
  login(email: string, password: string): Observable<AuthResult> {
    const promise = this.supabaseService.supabase.auth
      .signInWithPassword({ email, password })
      .then(({ data, error }) => ({
        data: data ?? null,
        error: error?.message ?? null,
      }));

    return from(promise);
  }

  /** Cierra la sesión activa */
  logout(): Observable<{ error: string | null }> {
    const promise = this.supabaseService.supabase.auth
      .signOut()
      .then(({ error }) => ({ error: error?.message ?? null }));

    return from(promise);
  }

  /** Verifica el código OTP recibido por email tras el registro */
  verifyOtp(email: string, token: string): Observable<AuthResult> {
    const promise = this.supabaseService.supabase.auth
      .verifyOtp({ email, token: String(token), type: 'signup' })
      .then(({ data, error }) => ({
        data: data ?? null,
        error: error?.message ?? null,
      }));

    return from(promise);
  }

  /** Devuelve la sesión activa o null si no hay usuario autenticado */
  getSession(): Observable<Session | null> {
    const promise = this.supabaseService.supabase.auth
      .getSession()
      .then(({ data }) => data.session);

    return from(promise);
  }

  /** Emite cada vez que el estado de autenticación cambia (login, logout, token refresh) */
  get authState$(): Observable<Session | null> {
    return new Observable((observer) => {
      const { data } = this.supabaseService.supabase.auth.onAuthStateChange(
        (_event, session) => observer.next(session)
      );

      // Limpieza cuando el observable se destruye
      return () => data.subscription.unsubscribe();
    });
  }
}
