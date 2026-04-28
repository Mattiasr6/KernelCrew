import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models';

export interface AdminStats {
  total_users: number;
  active_students: number;
  inactive_students: number;
  total_revenue: number;
  total_courses: number;
  retention_rate: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private api = inject(ApiService);

  getStats(): Observable<ApiResponse<AdminStats>> {
    return this.api.get<ApiResponse<AdminStats>>('admin/stats');
  }
}
