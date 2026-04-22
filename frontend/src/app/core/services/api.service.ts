import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import * as mocks from '../mocks/api.mocks';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8000/api/v1';
  private useMocks = true; // Toggle para usar mocks o API real

  get<T>(endpoint: string, params?: Record<string, string | number>): Observable<T> {
    if (this.useMocks) {
      return this.handleMock<T>(endpoint, 'GET', params);
    }
    
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        httpParams = httpParams.set(key, String(params[key]));
      });
    }
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { params: httpParams });
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    if (this.useMocks) {
      return this.handleMock<T>(endpoint, 'POST', body);
    }
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body);
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    if (this.useMocks) {
      return this.handleMock<T>(endpoint, 'PUT', body);
    }
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body);
  }

  patch<T>(endpoint: string, body?: unknown): Observable<T> {
    if (this.useMocks) {
      return this.handleMock<T>(endpoint, 'PATCH', body);
    }
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}`, body);
  }

  delete<T>(endpoint: string): Observable<T> {
    if (this.useMocks) {
      return this.handleMock<T>(endpoint, 'DELETE');
    }
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`);
  }

  // Toggle entre mocks y API real
  setMockMode(enabled: boolean): void {
    this.useMocks = enabled;
    console.log(`[ApiService] Mock mode: ${enabled ? 'ON' : 'OFF'}`);
  }

  isMockMode(): boolean {
    return this.useMocks;
  }

  // Router para mocks
  private handleMock<T>(endpoint: string, method: string, data?: unknown): Observable<T> {
    const params = data as Record<string, string | number | undefined>;
    const body = data as Record<string, unknown>;

    // Auth endpoints
    if (endpoint === 'auth/register' && method === 'POST') {
      return mocks.mockRegister(body as any) as Observable<T>;
    }
    if (endpoint === 'auth/login' && method === 'POST') {
      return mocks.mockLogin(body as any) as Observable<T>;
    }
    if (endpoint === 'auth/forgot-password' && method === 'POST') {
      return mocks.mockForgotPassword(body as any) as Observable<T>;
    }
    if (endpoint === 'auth/reset-password' && method === 'POST') {
      return mocks.mockResetPassword(body as any) as Observable<T>;
    }
    if (endpoint === 'auth/logout' && method === 'POST') {
      return mocks.mockLogout() as Observable<T>;
    }

    // Course endpoints (public)
    if (endpoint === 'courses' && method === 'GET') {
      return mocks.mockGetCourses(params) as Observable<T>;
    }
    if (endpoint.match(/^courses\/(\d+)$/) && method === 'GET') {
      const id = parseInt(endpoint.match(/^courses\/(\d+)$/)![1], 10);
      return mocks.mockGetCourse(id) as Observable<T>;
    }

    // Instructor course endpoints
    if (endpoint === 'instructor/courses' && method === 'POST') {
      return mocks.mockCreateCourse(body as any) as Observable<T>;
    }
    if (endpoint.match(/^instructor\/courses\/(\d+)$/) && method === 'PUT') {
      const id = parseInt(endpoint.match(/^instructor\/courses\/(\d+)$/)![1], 10);
      return mocks.mockUpdateCourse(id, body as any) as Observable<T>;
    }
    if (endpoint.match(/^instructor\/courses\/(\d+)$/) && method === 'DELETE') {
      const id = parseInt(endpoint.match(/^instructor\/courses\/(\d+)$/)![1], 10);
      return mocks.mockDeleteCourse(id) as Observable<T>;
    }

    // Admin course endpoints
    if (endpoint === 'admin/courses' && method === 'GET') {
      return mocks.mockGetAllCourses(params) as Observable<T>;
    }
    if (endpoint.match(/^admin\/courses\/(\d+)\/publish$/) && method === 'PATCH') {
      const id = parseInt(endpoint.match(/^admin\/courses\/(\d+)\/publish$/)![1], 10);
      const isPublished = (body as any)?.is_published ?? true;
      return mocks.mockPublishCourse(id, isPublished) as Observable<T>;
    }
    if (endpoint.match(/^admin\/courses\/(\d+)$/) && method === 'DELETE') {
      const id = parseInt(endpoint.match(/^admin\/courses\/(\d+)$/)![1], 10);
      return mocks.mockDeleteCourse(id) as Observable<T>;
    }

    // Admin user endpoints
    if (endpoint === 'admin/users' && method === 'GET') {
      return mocks.mockGetUsers(params) as Observable<T>;
    }
    if (endpoint === 'admin/users' && method === 'POST') {
      return mocks.mockCreateUser(body as any) as Observable<T>;
    }
    if (endpoint.match(/^admin\/users\/(\d+)$/) && method === 'PUT') {
      const id = parseInt(endpoint.match(/^admin\/users\/(\d+)$/)![1], 10);
      return mocks.mockUpdateUser(id, body as any) as Observable<T>;
    }
    if (endpoint.match(/^admin\/users\/(\d+)$/) && method === 'DELETE') {
      const id = parseInt(endpoint.match(/^admin\/users\/(\d+)$/)![1], 10);
      return mocks.mockDeleteUser(id) as Observable<T>;
    }

    // Fallback: simulate API error for unmocked endpoints
    return of({
      success: false,
      message: `Endpoint no mockeado: ${method} ${endpoint}`,
      errors: {}
    } as T).pipe(delay(500));
  }
}