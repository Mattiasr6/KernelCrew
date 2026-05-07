import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, Course } from '../models';

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

  getPendingCourses(): Observable<ApiResponse<Course[]>> {
    return this.api.get<ApiResponse<Course[]>>('admin/courses/pending');
  }

  approveCourse(id: number): Observable<ApiResponse<null>> {
    return this.api.patch<ApiResponse<null>>(`admin/courses/${id}/approve`, {});
  }

  rejectCourse(id: number, reason: string): Observable<ApiResponse<null>> {
    return this.api.patch<ApiResponse<null>>(`admin/courses/${id}/reject`, { reason });
  }
}
