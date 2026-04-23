import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User, UsersResponse, CreateUserRequest, UpdateUserRequest, UserResponse } from '../models';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private api = inject(ApiService);

  getUsers(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    role_id?: number;
  }): Observable<UsersResponse> {
    return this.api.get<UsersResponse>('admin/users', params as Record<string, string | number>);
  }

  getUser(id: number): Observable<UserResponse> {
    return this.api.get<UserResponse>(`admin/users/${id}`);
  }

  createUser(user: CreateUserRequest): Observable<UserResponse> {
    return this.api.post<UserResponse>('admin/users', user);
  }

  updateUser(id: number, user: UpdateUserRequest): Observable<UserResponse> {
    return this.api.put<UserResponse>(`admin/users/${id}`, user);
  }

  deleteUser(id: number): Observable<{ success: boolean; message: string }> {
    return this.api.delete<{ success: boolean; message: string }>(`admin/users/${id}`);
  }
}