import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, User } from '../models';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private api = inject(ApiService);

  /**
   * Obtener lista de usuarios (Admin only)
   */
  getUsers(params?: Record<string, string | number>): Observable<ApiResponse<{ users: User[] }>> {
    return this.api.get<ApiResponse<{ users: User[] }>>('admin/users', params);
  }

  /**
   * Eliminar un usuario
   */
  deleteUser(id: number): Observable<ApiResponse<null>> {
    return this.api.delete<ApiResponse<null>>(`admin/users/${id}`);
  }

  /**
   * Activar/Desactivar usuario
   */
  toggleStatus(id: number): Observable<ApiResponse<null>> {
    return this.api.patch<ApiResponse<null>>(`admin/users/${id}/toggle-status`);
  }
}
