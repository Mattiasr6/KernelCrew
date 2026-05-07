import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, Course } from '../models';

export interface AdminStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  enrolled_students: number;
  total_revenue: number;
  total_courses: number;
  published_courses: number;
  pending_courses: number;
  total_enrollments: number;
  retention_rate: number;
  category_distribution: { name: string; count: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private api = inject(ApiService);

  getStats(): Observable<ApiResponse<AdminStats>> {
    return this.api.get<ApiResponse<AdminStats>>('admin/stats');
  }

  getAllCourses(): Observable<ApiResponse<{ data: Course[] }>> {
    return this.api.get<ApiResponse<{ data: Course[] }>>('admin/courses');
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
