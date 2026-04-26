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
      <mat-spinner></mat-spinner>
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
    const token = this.route.snapshot.queryParamMap.get('token');

    if (token) {
      // Guardar token para que el interceptor lo use en auth/me
      localStorage.setItem('token', token);
      
      // Obtener datos completos del usuario
      this.api.get<any>('auth/me').subscribe({
        next: (response) => {
          if (response.success) {
            const user = response.data;
            localStorage.setItem('user', JSON.stringify(user));
            
            // Actualizar el estado global en el AuthService
            this.authService.userSignal.set(user);
            
            // Lógica de Redirección Inteligente
            const returnUrl = localStorage.getItem('returnUrl');
            if (returnUrl) {
                localStorage.removeItem('returnUrl');
                this.router.navigateByUrl(returnUrl);
            } else {
                this.router.navigate([this.getRedirectByRole(user.role_id)]);
            }
          }
        },
        error: () => {
            localStorage.removeItem('token');
            this.router.navigate(['/login']);
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  private getRedirectByRole(roleId: number): string {
    switch (roleId) {
      case 1: return '/admin';
      case 2: return '/instructor';
      default: return '/dashboard';
    }
  }
}
