import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models';

export interface UserListResponse {
  data: User[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'instructor' | 'student';
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'admin' | 'instructor' | 'student';
  status?: 'active' | 'inactive';
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private api = inject(ApiService);

  getUsers(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    role?: string;
  }): Observable<UserListResponse> {
    return this.api.get<UserListResponse>('users', params as Record<string, string | number>);
  }

  getUser(id: number): Observable<User> {
    return this.api.get<User>(`users/${id}`);
  }

  createUser(user: CreateUserRequest): Observable<User> {
    return this.api.post<User>('users', user);
  }

  updateUser(id: number, user: UpdateUserRequest): Observable<User> {
    return this.api.put<User>(`users/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.api.delete<void>(`users/${id}`);
  }
}
