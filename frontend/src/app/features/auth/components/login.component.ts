import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-container">
      <div class="brand-logo">
        Kernel<span class="logo-accent">Learn</span>
      </div>
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Iniciar Sesión</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="tu@email.com" />
              @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                <mat-error>El email es requerido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input matInput type="password" formControlName="password" />
            </mat-form-field>

            @if (error) {
              <div class="error-message">{{ error }}</div>
            }

            <button
              mat-raised-button
              class="submit-btn full-width"
              type="submit"
              [disabled]="loading || form.invalid"
            >
              @if (loading) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Iniciar Sesión
              }
            </button>
          </form>

          <div class="social-divider">
            <span>O continúa con</span>
          </div>

          <div class="social-buttons">
            <button type="button" class="social-btn google" (click)="loginWithProvider('google')">
                <i class="icon">G</i> Google
            </button>
            <button type="button" class="social-btn github" (click)="loginWithProvider('github')">
                <i class="icon">Git</i> GitHub
            </button>
          </div>

          <div class="links">
            <a routerLink="/register">¿No tienes cuenta? Regístrate</a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .login-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: #0f172a;
        padding: 20px;
      }
      .brand-logo {
        font-size: 32px;
        font-weight: bold;
        color: white;
        margin-bottom: 24px;
      }
      .logo-accent {
        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .login-card {
        max-width: 400px;
        width: 100%;
        padding: 24px;
        background: rgba(30, 30, 50, 0.6) !important;
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 16px !important;
        color: white !important;
      }
      mat-card-title { color: white !important; margin-bottom: 24px !important; }
      .full-width { width: 100%; margin-bottom: 16px; }
      .submit-btn {
        background: linear-gradient(135deg, #3b82f6, #8b5cf6) !important;
        color: white !important;
        height: 48px;
      }

      .social-divider {
        display: flex;
        align-items: center;
        text-align: center;
        margin: 20px 0;
        color: rgba(255,255,255,0.4);
        font-size: 0.8rem;
        &::before, &::after {
            content: '';
            flex: 1;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        span { padding: 0 10px; }
      }

      .social-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 20px;
      }

      .social-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.05);
        color: white;
        cursor: pointer;
        transition: all 0.2s;
        font-weight: 500;

        &:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
        .icon { font-style: normal; font-weight: bold; }
      }

      .links { text-align: center; margin-top: 16px; a { color: #60a5fa; text-decoration: none; font-size: 0.9rem; } }
    `,
  ],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  loading = false;
  error = '';

  onSubmit(): void {
  if (this.form.invalid) return;
  this.loading = true;
  this.authService.login(this.form.value).subscribe({
    // Agregamos el '!' después de role_id
    next: (res) => this.router.navigate([this.getRedirectByRole(res.data.user.role_id!)]),
    error: (err) => { this.loading = false; this.error = 'Credenciales inválidas'; }
  });
  }

  loginWithProvider(provider: string): void {
    // Redirección al backend (IP .28 solicitada)
    window.location.href = `http://192.168.1.28:8000/api/v1/auth/${provider}/redirect`;
  }

  private getRedirectByRole(roleId: number): string {
    switch (roleId) {
      case 1: return '/admin';
      case 2: return '/instructor';
      default: return '/dashboard';
    }
  }
}
