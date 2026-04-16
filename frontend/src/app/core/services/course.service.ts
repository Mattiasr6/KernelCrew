import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Course, CoursesResponse, CourseResponse, CreateCourseRequest, UpdateCourseRequest } from '../models';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private api = inject(ApiService);

  getCourses(params?: {
    page?: number;
    per_page?: number;
    level?: string;
    category?: string;
    search?: string;
  }): Observable<CoursesResponse> {
    return this.api.get<CoursesResponse>('courses', params as Record<string, string | number>);
  }

  getCourse(id: number): Observable<CourseResponse> {
    return this.api.get<CourseResponse>(`courses/${id}`);
  }

  createCourse(course: CreateCourseRequest): Observable<CourseResponse> {
    return this.api.post<CourseResponse>('instructor/courses', course);
  }

  updateCourse(id: number, course: UpdateCourseRequest): Observable<CourseResponse> {
    return this.api.put<CourseResponse>(`instructor/courses/${id}`, course);
  }

  deleteCourse(id: number): Observable<{ success: boolean; message: string }> {
    return this.api.delete<{ success: boolean; message: string }>(`instructor/courses/${id}`);
  }

  // Admin methods
  getAllCourses(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    is_published?: boolean;
  }): Observable<CoursesResponse> {
    return this.api.get<CoursesResponse>('admin/courses', params as Record<string, string | number>);
  }

  publishCourse(id: number, isPublished: boolean): Observable<{ success: boolean; message: string }> {
    return this.api.patch<{ success: boolean; message: string }>(`admin/courses/${id}/publish`, { is_published: isPublished });
  }
}