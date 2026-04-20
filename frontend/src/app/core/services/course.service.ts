import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Course, CourseResponse, CoursesResponse } from '../models';

export interface CourseFilters {
  page?: number;
  per_page?: number;
  search?: string;
  min_price?: number;
  max_price?: number;
}

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private api = inject(ApiService);

  getCourses(filters?: CourseFilters): Observable<CoursesResponse> {
    const params: Record<string, string | number> = {};
    
    if (filters?.page) params.page = filters.page;
    if (filters?.per_page) params.per_page = filters.per_page;
    if (filters?.search) params.search = filters.search;
    if (filters?.min_price !== undefined) params.min_price = filters.min_price;
    if (filters?.max_price !== undefined) params.max_price = filters.max_price;

    return this.api.get<CoursesResponse>('courses', params);
  }

  getCourse(id: number): Observable<CourseResponse> {
    return this.api.get<CourseResponse>(`courses/${id}`);
  }

  createCourse(course: { title: string; description: string; price: number }): Observable<CourseResponse> {
    return this.api.post<CourseResponse>('courses', course);
  }

  updateCourse(id: number, course: { title?: string; description?: string; price?: number; status?: string }): Observable<CourseResponse> {
    return this.api.put<CourseResponse>(`courses/${id}`, course);
  }

  deleteCourse(id: number): Observable<{ success: boolean; message: string }> {
    return this.api.delete<{ success: boolean; message: string }>(`courses/${id}`);
  }

  restoreCourse(id: number): Observable<{ success: boolean; message: string }> {
    return this.api.patch<{ success: boolean; message: string }>(`courses/${id}/restore`);
  }
}