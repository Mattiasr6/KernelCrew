import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
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
    <div class="register-container">
      <div class="brand-logo">
        Kernel<span class="logo-accent">Learn</span>
      </div>
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title>Crear Cuenta</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nombre completo</mat-label>
              <input matInput formControlName="name" placeholder="Juan Pérez" />
              @if (form.get('name')?.invalid && form.get('name')?.touched) {
                <mat-error>{{ getErrorMessage('name') }}</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="tu@email.com" />
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <mat-error>{{ getErrorMessage('email') }}</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input matInput type="password" formControlName="password" />
              @if (form.get('password')?.invalid && form.get('password')?.touched) {
                <mat-error>{{ getErrorMessage('password') }}</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirmar contraseña</mat-label>
              <input matInput type="password" formControlName="password_confirmation" />
              @if (form.get('password_confirmation')?.invalid && form.get('password_confirmation')?.touched) {
                <mat-error>{{ getErrorMessage('password_confirmation') }}</mat-error>
              }
              @if (form.hasError('passwordMismatch') && form.get('password_confirmation')?.touched) {
                <mat-error>Las contraseñas no coinciden</mat-error>
              }
            </mat-form-field>

            @if (errorMessage()) {
                <div class="error-banner">
                    <span class="material-symbols-outlined">error</span>
                    {{ errorMessage() }}
                </div>
            }

            <button
              mat-raised-button
              class="submit-btn full-width"
              type="submit"
              [disabled]="isLoading() || form.invalid"
            >
              @if (isLoading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Crear Cuenta
              }
            </button>
          </form>

          <div class="links">
            <a routerLink="/login">¿Ya tienes cuenta? Inicia sesión</a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .register-container {
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
      .register-card {
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
        border-radius: 12px !important;
      }

      .error-banner {
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.2);
        color: #f87171;
        padding: 12px;
        border-radius: 12px;
        margin-bottom: 16px;
        font-size: 0.9rem;
      }

      .links {
        text-align: center;
        margin-top: 16px;
        a { color: #60a5fa; text-decoration: none; font-size: 0.9rem; }
      }
    `,
  ],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form: FormGroup = this.fb.group(
    {
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]],
    },
    { validators: this.passwordMatchValidator },
  );

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirm = form.get('password_confirmation');
    if (password && confirm && password.value !== confirm.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.register(this.form.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.handleBackendErrors(err);
      },
    });
  }

  private handleBackendErrors(err: any): void {
    const errorResponse = err.error;
    
    if (err.status === 422 && errorResponse.errors) {
      Object.keys(errorResponse.errors).forEach(key => {
        const control = this.form.get(key);
        if (control) {
          control.setErrors({ serverError: errorResponse.errors[key][0] });
        }
      });
    } else {
      this.errorMessage.set(errorResponse.message || 'Error al procesar el registro');
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control) return '';

    if (control.hasError('required')) return 'Este campo es obligatorio';
    if (control.hasError('email')) return 'Ingresa un email válido';
    if (control.hasError('minlength')) return 'Mínimo 8 caracteres';
    if (control.hasError('serverError')) return control.getError('serverError');
    
    return '';
  }
}
