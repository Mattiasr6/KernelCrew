import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  // Expuesto como signal pública para consumo en Guards y Components (Solicitud Tech Lead)
  public userSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(null);

  // Computeds basados en role_id (RBAC Custom 3FN)
  user = computed(() => this.userSignal());
  isAuthenticated = computed(() => !!this.tokenSignal());
  isAdmin = computed(() => this.userSignal()?.role_id === 1);
  isInstructor = computed(() => this.userSignal()?.role_id === 2);
  isStudent = computed(() => this.userSignal()?.role_id === 3);

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      this.tokenSignal.set(token);
      this.userSignal.set(JSON.parse(user));
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('auth/login', credentials).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.tokenSignal.set(response.data.token);
          this.userSignal.set(response.data.user);
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }),
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('auth/register', data).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.tokenSignal.set(response.data.token);
          this.userSignal.set(response.data.user);
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }),
    );
  }

  logout(): void {
    this.api.post('auth/logout', {}).subscribe({
      complete: () => this.clearSession(),
      error: () => this.clearSession(),
    });
  }

  clearSession(): void {
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  /**
   * Refresca los datos del usuario actual desde el servidor.
   * Vital para detectar cambios de rol (ej. tras aprobación) en tiempo real.
   */
  refreshUserSession(): void {
    this.api.get<any>('auth/me').subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const updatedUser = response.data;
          this.userSignal.set(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      },
      error: (err) => {
        console.error('Error al refrescar la sesión:', err);
        if (err.status === 401) this.clearSession();
      }
    });
  }
}
