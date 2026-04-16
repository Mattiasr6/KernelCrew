import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User, LoginRequest, RegisterRequest, AuthResponse, AuthData } from '../models';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  private userSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(null);

  user = computed(() => this.userSignal());
  isAuthenticated = computed(() => !!this.tokenSignal());
  isAdmin = computed(() => this.userSignal()?.role === 'admin');
  isInstructor = computed(() => this.userSignal()?.role === 'instructor');
  isStudent = computed(() => this.userSignal()?.role === 'student');

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
    });
    this.clearSession();
  }

  private clearSession(): void {
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }
}