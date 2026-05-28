import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Bloquear acceso si no hay sesion valida
  if (!authService.isAuthenticated()) {
    return router.parseUrl('/intranet');
  }

  return true;
};
