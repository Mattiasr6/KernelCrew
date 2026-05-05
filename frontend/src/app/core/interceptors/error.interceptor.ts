import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Silenciar errores de logout — el AuthService los maneja internamente
      if (req.url.includes('/logout')) {
        return throwError(() => error);
      }

      if (error.status === 0) {
        notification.error('Sin conexión con el servidor');
      } else if (error.status === 403) {
        notification.error('No tienes permisos para realizar esta acción');
      } else if (error.status >= 500) {
        notification.error('Error del servidor');
      }

      return throwError(() => error);
    })
  );
};