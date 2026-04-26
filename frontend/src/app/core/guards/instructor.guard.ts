import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const instructorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.userSignal();

  // Instructor role_id es 2 según arquitectura blindada
  if (user && user.role_id === 2) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
