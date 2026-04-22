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
              @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                <mat-error>Ingresa un email válido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input matInput type="password" formControlName="password" />
              @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
                <mat-error>La contraseña es requerida</mat-error>
              }
            </mat-form-field>

            @if (error) {
              <div class="error-message">{{ error }}</div>
            }

            <button
              mat-raised-button
              class="submit-btn"
              type="submit"
              class="full-width"
              [disabled]="loading || form.invalid"
            >
              @if (loading) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Iniciar Sesión
              }
            </button>
          </form>

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
        background: var(--bg-primary);
        padding: 20px;
      }
      .brand-logo {
        font-size: 32px;
        font-weight: bold;
        color: var(--text-primary);
        margin-bottom: 24px;
      }
      .logo-accent {
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .login-card {
        max-width: 400px;
        width: 100%;
        padding: 24px;
        background: var(--glass-bg) !important;
        border: 1px solid var(--glass-border) !important;
        border-radius: 16px !important;
      }
      mat-card-title {
        color: var(--text-primary) !important;
        margin-bottom: 24px !important;
      }
      .full-width {
        width: 100%;
        margin-bottom: 16px;
      }
      .error-message {
        color: #f44336;
        margin-bottom: 16px;
        padding: 12px;
        background: rgba(244, 67, 54, 0.1);
        border-radius: 4px;
        border: 1px solid rgba(244, 67, 54, 0.3);
      }
      .submit-btn {
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)) !important;
        color: white !important;
      }
      .links {
        text-align: center;
        margin-top: 16px;
        a {
          color: var(--accent-primary);
          text-decoration: none;
        }
      }
      button mat-spinner {
        display: inline-block;
      }
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

  get returnUrl(): string {
    return this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  onSubmit(): void {
    console.log('BOTÓN PRESIONADO: Iniciando petición...');
    console.log('Email:', this.form.value.email);
    console.log('Password:', this.form.value.password);
    
    if (this.form.invalid) {
      console.log('FORMULARIO INVÁLIDO');
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.form.value).subscribe({
      next: () => {
        const user = this.authService.user();
        if (user?.role === 'admin') {
          this.router.navigate(['/admin']);
        } else if (user?.role === 'instructor') {
          this.router.navigate(['/my-courses']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Error al iniciar sesión';
      },
    });
  }
}
