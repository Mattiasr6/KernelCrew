import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
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
          <p class="text-sm text-zinc-500 mt-2">Bienvenido de nuevo</p>
        </div>

        <!-- Card -->
        <div class="bg-zinc-900/60 backdrop-blur-md border border-zinc-800 rounded-2xl p-8 shadow-2xl shadow-black/50">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
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
                <span>Ingresando...</span>
              } @else {
                <span class="material-symbols-outlined text-[18px]">login</span>
                Iniciar Sesión
              }
            </button>
          </form>

          <!-- Social divider -->
          <div class="flex items-center gap-3 my-5">
            <div class="flex-1 h-px bg-zinc-800"></div>
            <span class="text-xs text-zinc-600">O continúa con</span>
            <div class="flex-1 h-px bg-zinc-800"></div>
          </div>

          <!-- OAuth buttons -->
          <div class="grid grid-cols-2 gap-3">
            <button type="button" (click)="loginWithProvider('google')"
              class="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-300 transition-all">
              <span class="font-bold text-[15px]">G</span>
              <span class="text-sm">Google</span>
            </button>
            <button type="button" (click)="loginWithProvider('github')"
              class="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-300 transition-all">
              <span class="font-bold text-[15px]">&#x27e8;/&#x27e9;</span>
              <span class="text-sm">GitHub</span>
            </button>
          </div>

          <!-- Footer links -->
          <div class="flex flex-col items-center gap-2 mt-6 pt-4 border-t border-zinc-800">
            <a routerLink="/auth/forgot-password" class="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">¿Olvidaste tu contraseña?</a>
            <a routerLink="/register" class="text-sm text-violet-400 hover:text-violet-300 transition-colors">¿No tienes cuenta? Regístrate</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.form.value).subscribe({
      next: (res) => {
        const user = res.data?.user || (res as any).user;
        const userRole = user?.role || 'student';
        this.isLoading.set(false);
        this.notification.success(`¡Bienvenido de nuevo, ${user.name}!`);
        this.router.navigate([this.getRedirectByRole(userRole)]);
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
      this.errorMessage.set(errorResponse.message || 'Credenciales inválidas o error de servidor');
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control) return '';
    if (control.hasError('required')) return 'Este campo es obligatorio';
    if (control.hasError('email')) return 'Ingresa un email válido';
    if (control.hasError('serverError')) return control.getError('serverError');
    return '';
  }

  loginWithProvider(provider: string): void {
    window.location.href = `${environment.apiUrl}/auth/${provider}/redirect`;
  }

  private getRedirectByRole(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin':
        return '/admin';
      case 'instructor':
        return '/instructor';
      case 'docente':
        return '/instructor';
      default:
        return '/dashboard';
    }
  }
}
