import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
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
  ],
  template: `
    <div class="auth-container animate-fade-in">
      <div class="brand-logo">Kernel<span class="logo-accent">Learn</span></div>
      <mat-card class="auth-card glass-card">
        <mat-card-header>
          <mat-card-title>Recuperar Contraseña</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p class="text-slate-400 text-sm mb-6">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </p>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="tu@email.com" />
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <mat-error>Ingresa un email válido</mat-error>
              }
            </mat-form-field>

            <button
              mat-raised-button
              class="submit-btn full-width"
              type="submit"
              [disabled]="isLoading() || form.invalid"
            >
              @if (isLoading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Enviar Enlace
              }
            </button>
          </form>

          <div class="links mt-6 text-center">
            <a routerLink="/login" class="text-blue-400 text-sm hover:underline">Volver al inicio de sesión</a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; background: #0f172a; padding: 20px; }
    .brand-logo { font-size: 32px; font-weight: bold; color: white; margin-bottom: 24px; }
    .logo-accent { background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .auth-card { max-width: 400px; width: 100%; padding: 24px; color: white !important; border-radius: 16px !important; }
    .full-width { width: 100%; margin-bottom: 16px; }
    .submit-btn { background: linear-gradient(135deg, #3b82f6, #8b5cf6) !important; color: white !important; height: 48px; border-radius: 12px !important; }
  `]
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private notification = inject(NotificationService);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  isLoading = signal(false);

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isLoading.set(true);

    this.api.post<any>('auth/forgot-password', this.form.value).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.notification.success(res.message);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.notification.error(err.error?.message || 'No pudimos procesar tu solicitud');
      }
    });
  }
}
