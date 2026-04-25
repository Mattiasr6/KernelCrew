import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.userSignal();

  // Admin role_id es 1 según arquitectura blindada
  if (user && user.role_id === 1) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
