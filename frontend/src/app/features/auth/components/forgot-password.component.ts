import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-forgot-password',
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
    MatSnackBarModule,
  ],
  template: `
    <div class="recovery-container">
      <mat-card class="recovery-card">
        <mat-card-header>
          <mat-card-title>Recuperar Contraseña</mat-card-title>
          <mat-card-subtitle
            >Ingresa tu email y te enviaremos un enlace para restablecer tu
            contraseña</mat-card-subtitle
          >
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

            @if (error) {
              <div class="error-message">{{ error }}</div>
            }

            @if (success) {
              <div class="success-message">{{ success }}</div>
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
                Enviar Enlace
              }
            </button>
          </form>

          <div class="links">
            <a routerLink="/login">Volver a Iniciar Sesión</a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .recovery-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: #f5f5f5;
        padding: 20px;
      }
      .recovery-card {
        max-width: 450px;
        width: 100%;
        padding: 20px;
      }
      mat-card-subtitle {
        margin-bottom: 20px;
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
      .success-message {
        color: #4caf50;
        margin-bottom: 16px;
        padding: 12px;
        background: #e8f5e9;
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
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  loading = false;
  error = '';
  success = '';

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    this.api.post('password/forgot', { email: this.form.value.email }).subscribe({
      next: () => {
        this.success = 'Se ha enviado un enlace de recuperación a tu email';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Error al enviar solicitud';
      },
    });
  }
}
