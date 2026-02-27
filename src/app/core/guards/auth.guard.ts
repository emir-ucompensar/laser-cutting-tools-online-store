import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';

/**
 * Protege rutas que requieren sesión activa.
 * Si no hay sesión, redirige a /login.
 */
export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  return auth.getSession().pipe(
    map(session => session ? true : router.createUrlTree(['/login']))
  );
};
