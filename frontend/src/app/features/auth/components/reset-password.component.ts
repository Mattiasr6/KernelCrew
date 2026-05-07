import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-zinc-950 flex items-center justify-center px-4 relative overflow-hidden">

      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-violet-900/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div class="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-900/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div class="w-full max-w-md space-y-6 relative z-10">
        <!-- Logo -->
        <div class="text-center">
          <h1 class="text-3xl font-extrabold tracking-tighter">
            <span class="text-zinc-50">Kernel</span><span class="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Learn</span>
          </h1>
          <p class="text-sm text-zinc-500 mt-2">Nueva contraseña</p>
        </div>

        <!-- Card -->
        <div class="bg-zinc-900/60 backdrop-blur-md border border-zinc-800 rounded-2xl p-8 shadow-2xl shadow-black/50">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Email (readonly) -->
            <div>
              <label class="block text-sm font-medium text-zinc-400 mb-1.5">Email</label>
              <input
                type="email"
                formControlName="email"
                readonly
                class="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-400 cursor-not-allowed outline-none"
              />
            </div>

            <!-- New Password -->
            <div>
              <label class="block text-sm font-medium text-zinc-400 mb-1.5">Nueva Contraseña</label>
              <input
                type="password"
                formControlName="password"
                class="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
              />
              @if (form.get('password')?.invalid && form.get('password')?.touched) {
                <p class="text-xs text-rose-400 mt-1.5">Mínimo 8 caracteres</p>
              }
            </div>

            <!-- Confirm Password -->
            <div>
              <label class="block text-sm font-medium text-zinc-400 mb-1.5">Confirmar Contraseña</label>
              <input
                type="password"
                formControlName="password_confirmation"
                class="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
              />
              @if (form.get('password_confirmation')?.touched && form.hasError('mismatch')) {
                <p class="text-xs text-rose-400 mt-1.5">Las contraseñas no coinciden</p>
              }
            </div>

            @if (errorMessage()) {
              <div class="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-3">
                <span class="material-symbols-outlined text-rose-400 text-[18px] shrink-0 mt-0.5">error</span>
                <span class="text-sm text-rose-300">{{ errorMessage() }}</span>
              </div>
            }

            <button
              type="submit"
              [disabled]="isLoading() || form.invalid"
              class="w-full bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-all shadow-[0_0_15px_rgba(139,92,246,0.25)] hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] inline-flex items-center justify-center gap-2"
            >
              @if (isLoading()) {
                <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Actualizando...</span>
              } @else {
                <span class="material-symbols-outlined text-[18px]">lock_reset</span>
                Actualizar Contraseña
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`],
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
  errorMessage = signal<string | null>(null);

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
    this.errorMessage.set(null);

    this.api.post<any>('auth/reset-password', this.form.value).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.notification.success(res.message || 'Contraseña actualizada');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Token expirado o inválido');
      },
    });
  }
}
