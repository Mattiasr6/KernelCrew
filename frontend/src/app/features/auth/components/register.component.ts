import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-zinc-950 flex items-center justify-center px-4 relative overflow-hidden">

      <!-- Ambient glows -->
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-violet-900/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div class="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-900/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div class="absolute top-0 right-0 w-[250px] h-[250px] bg-violet-800/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div class="w-full max-w-md space-y-6 relative z-10">
        <!-- Logo -->
        <div class="text-center">
          <h1 class="text-3xl font-extrabold tracking-tighter">
            <span class="text-zinc-50">Kernel</span><span class="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Learn</span>
          </h1>
          <p class="text-sm text-zinc-500 mt-2">Crea tu cuenta</p>
        </div>

        <!-- Card -->
        <div class="bg-zinc-900/60 backdrop-blur-md border border-zinc-800 rounded-2xl p-8 shadow-2xl shadow-black/50">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-zinc-400 mb-1.5">Nombre completo</label>
              <input
                type="text"
                formControlName="name"
                placeholder="Juan Pérez"
                class="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
              />
              @if (form.get('name')?.invalid && form.get('name')?.touched) {
                <p class="text-xs text-rose-400 mt-1.5">{{ getErrorMessage('name') }}</p>
              }
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-zinc-400 mb-1.5">Email</label>
              <input
                type="email"
                formControlName="email"
                placeholder="tu@email.com"
                class="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
              />
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <p class="text-xs text-rose-400 mt-1.5">{{ getErrorMessage('email') }}</p>
              }
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm font-medium text-zinc-400 mb-1.5">Contraseña</label>
              <input
                type="password"
                formControlName="password"
                class="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
              />
              @if (form.get('password')?.invalid && form.get('password')?.touched) {
                <p class="text-xs text-rose-400 mt-1.5">{{ getErrorMessage('password') }}</p>
              }
            </div>

            <!-- Confirm Password -->
            <div>
              <label class="block text-sm font-medium text-zinc-400 mb-1.5">Confirmar contraseña</label>
              <input
                type="password"
                formControlName="password_confirmation"
                class="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
              />
              @if (form.get('password_confirmation')?.invalid && form.get('password_confirmation')?.touched) {
                <p class="text-xs text-rose-400 mt-1.5">{{ getErrorMessage('password_confirmation') }}</p>
              }
              @if (form.hasError('passwordMismatch') && form.get('password_confirmation')?.touched) {
                <p class="text-xs text-rose-400 mt-1.5">Las contraseñas no coinciden</p>
              }
            </div>

            <!-- Error Banner -->
            @if (errorMessage()) {
              <div class="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-3">
                <span class="material-symbols-outlined text-rose-400 text-[18px] shrink-0 mt-0.5">error</span>
                <span class="text-sm text-rose-300">{{ errorMessage() }}</span>
              </div>
            }

            <!-- Submit -->
            <button
              type="submit"
              [disabled]="isLoading() || form.invalid"
              class="w-full bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-all shadow-[0_0_15px_rgba(139,92,246,0.25)] hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] inline-flex items-center justify-center gap-2"
            >
              @if (isLoading()) {
                <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Creando cuenta...</span>
              } @else {
                <span class="material-symbols-outlined text-[18px]">person_add</span>
                Crear Cuenta
              }
            </button>
          </form>

          <!-- Footer -->
          <div class="flex justify-center mt-6 pt-4 border-t border-zinc-800">
            <a routerLink="/login" class="text-sm text-violet-400 hover:text-violet-300 transition-colors">
              ¿Ya tienes cuenta? Inicia sesión
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`],
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
        this.isLoading.set(false);
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
      Object.keys(errorResponse.errors).forEach((key) => {
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
