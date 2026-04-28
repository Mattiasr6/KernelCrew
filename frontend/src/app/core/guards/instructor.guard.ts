import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const instructorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.userSignal();

  // Validación basada en el nombre del rol (string)
  if (user && (user.role === 'instructor' || user.role === 'docente')) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
