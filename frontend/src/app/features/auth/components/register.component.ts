import { Component, inject } from '@angular/core';
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
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title>Crear Cuenta</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nombre completo</mat-label>
              <input matInput formControlName="name" placeholder="Juan Pérez" />
              @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
                <mat-error>El nombre es requerido</mat-error>
              }
            </mat-form-field>

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
              @if (form.get('password')?.hasError('minlength') && form.get('password')?.touched) {
                <mat-error>Mínimo 8 caracteres</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirmar contraseña</mat-label>
              <input matInput type="password" formControlName="password_confirmation" />
              @if (
                form.get('password_confirmation')?.hasError('required') &&
                form.get('password_confirmation')?.touched
              ) {
                <mat-error>Confirma tu contraseña</mat-error>
              }
              @if (
                form.hasError('passwordMismatch') && form.get('password_confirmation')?.touched
              ) {
                <mat-error>Las contraseñas no coinciden</mat-error>
              }
            </mat-form-field>

            @if (error) {
              <div class="error-message">{{ error }}</div>
            }

            <button
              mat-raised-button
              color="primary"
              type="submit"
              class="full-width"
              [disabled]="loading || form.invalid"
            >
              @if (loading) {
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
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: #f5f5f5;
        padding: 20px;
      }
      .register-card {
        max-width: 400px;
        width: 100%;
        padding: 20px;
      }
      .full-width {
        width: 100%;
        margin-bottom: 16px;
      }
      .error-message {
        color: #f44336;
        margin-bottom: 16px;
        padding: 12px;
        background: #ffebee;
        border-radius: 4px;
      }
      .links {
        text-align: center;
        margin-top: 16px;
        a {
          color: #1976d2;
          text-decoration: none;
        }
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

  loading = false;
  error = '';

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

    this.loading = true;
    this.error = '';

    this.authService.register(this.form.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Error al registrar usuario';
      },
    });
  }
}
