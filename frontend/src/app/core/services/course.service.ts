import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Course, CourseListResponse } from '../models';

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
  }): Observable<CourseListResponse> {
    return this.api.get<CourseListResponse>('courses', params as Record<string, string | number>);
  }

  getCourse(id: number): Observable<Course> {
    return this.api.get<Course>(`courses/${id}`);
  }

  createCourse(course: Partial<Course>): Observable<Course> {
    return this.api.post<Course>('courses', course);
  }

  updateCourse(id: number, course: Partial<Course>): Observable<Course> {
    return this.api.put<Course>(`courses/${id}`, course);
  }

  deleteCourse(id: number): Observable<void> {
    return this.api.delete<void>(`courses/${id}`);
  }
}
