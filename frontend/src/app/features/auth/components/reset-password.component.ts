import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService } from '../../../core/services/notification.service';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-reset-password',
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
          <mat-card-title>Nueva Contraseña</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" readonly />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nueva Contraseña</mat-label>
              <input matInput type="password" formControlName="password" />
              @if (form.get('password')?.invalid && form.get('password')?.touched) {
                <mat-error>Mínimo 8 caracteres</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirmar Contraseña</mat-label>
              <input matInput type="password" formControlName="password_confirmation" />
              @if (form.get('password_confirmation')?.touched && form.hasError('mismatch')) {
                <mat-error>Las contraseñas no coinciden</mat-error>
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
                Actualizar Contraseña
              }
            </button>
          </form>
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
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private notification = inject(NotificationService);

  form: FormGroup = this.fb.group({
    token: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', [Validators.required]],
  }, { validators: this.passwordMatchValidator });

  isLoading = signal(false);

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    const email = this.route.snapshot.queryParamMap.get('email');
    
    if (token && email) {
      this.form.patchValue({ token, email });
    } else {
      this.notification.error('Enlace de recuperación inválido');
      this.router.navigate(['/login']);
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('password_confirmation')?.value ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isLoading.set(true);

    this.api.post<any>('auth/reset-password', this.form.value).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.notification.success(res.message);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.notification.error(err.error?.message || 'Token expirado o inválido');
      }
    });
  }
}
