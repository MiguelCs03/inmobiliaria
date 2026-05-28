import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si ya hay sesion, saltar el login
  if (authService.isAuthenticated()) {
    const role = authService.getUserRole();
    if (role === 1) return router.parseUrl('/admin/dashboard');
    if (role === 2) return router.parseUrl('/agente/visitas');
    authService.logout();
    return router.parseUrl('/intranet');
  }

  return true;
};
