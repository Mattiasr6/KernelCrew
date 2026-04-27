import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="callback-container">
      <mat-spinner diameter="50"></mat-spinner>
      <p>Finalizando autenticación...</p>
    </div>
  `,
  styles: [`
    .callback-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: #0f172a;
      color: white;
    }
    p { margin-top: 20px; font-family: 'Inter', sans-serif; opacity: 0.8; }
  `]
})
export class AuthCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private api = inject(ApiService);

  ngOnInit() {
    // 1. Capturar token y decodificar caracteres especiales (ej: %7C -> |)
    const rawToken = this.route.snapshot.queryParamMap.get('token');
    
    if (rawToken) {
      const decodedToken = decodeURIComponent(rawToken);
      
      // 2. Establecer token para que el interceptor lo reconozca inmediatamente
      this.authService.setToken(decodedToken);
      
      // 3. Forzar comunicación con la API Real (desactivar mocks)
      this.api.setMockMode(false);
      
      // 4. Obtener datos completos del usuario
      this.api.get<any>('auth/me').subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const user = response.data;
            
            // Guardar datos y actualizar señal reactiva
            localStorage.setItem('user', JSON.stringify(user));
            this.authService.userSignal.set(user);
            
            // 5. Redirección inteligente
            const returnUrl = localStorage.getItem('returnUrl');
            if (returnUrl) {
                localStorage.removeItem('returnUrl');
                this.router.navigateByUrl(returnUrl);
            } else {
                this.router.navigate([this.getRedirectByRole(user.role_id)]);
            }
          } else {
            console.error('Callback fallido:', response.message);
            this.handleError();
          }
        },
        error: (err) => {
          console.error('Error de red en el callback:', err);
          this.handleError();
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  private handleError() {
    this.authService.clearSession();
    this.router.navigate(['/login']);
  }

  private getRedirectByRole(roleId: number): string {
    switch (Number(roleId)) {
      case 1: return '/admin';
      case 2: return '/instructor';
      default: return '/dashboard';
    }
  }
}
