import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="callback-container">
      <div class="loading-spinner"></div>
      <p class="text-zinc-400 mt-4">Procesando autenticación...</p>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #09090b;
    }
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #27272a;
      border-top-color: #06b6d4;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class AuthCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private api = inject(ApiService);

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    const error = this.route.snapshot.queryParamMap.get('error');

    if (error) {
      this.handleError();
      return;
    }

    if (token) {
      this.authService.setToken(token);
      this.api.get<any>('auth/me').subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const user = response.data;
            this.authService.userSignal.set(user);
            localStorage.setItem('user', JSON.stringify(user));
            this.redirectByRole(user.role_id);
          } else {
            this.handleError();
          }
        },
        error: () => {
          this.handleError();
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  private redirectByRole(roleId: number): void {
    const returnUrl = localStorage.getItem('returnUrl');
    if (returnUrl) {
      localStorage.removeItem('returnUrl');
      this.router.navigateByUrl(returnUrl);
    } else {
      this.router.navigate([this.getRedirectByRole(roleId)]);
    }
  }

  private handleError(): void {
    this.authService.clearSession();
    this.router.navigate(['/login']);
  }

  private getRedirectByRole(roleId: number): string {
    switch (roleId) {
      case 1: return '/admin';
      case 2: return '/instructor';
      default: return '/dashboard';
    }
  }
}