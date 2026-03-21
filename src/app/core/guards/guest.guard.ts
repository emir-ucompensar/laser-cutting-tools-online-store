import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';

/**
 * Permite solo usuarios sin sesión en rutas públicas de auth.
 * Si ya hay sesión activa, redirige a /home.
 */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.getSession().pipe(
    map((session) => (session ? router.createUrlTree(['/home']) : true))
  );
};
