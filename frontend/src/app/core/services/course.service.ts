import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  instructor_id: number;
  status: 'draft' | 'published';
  instructor?: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface CourseMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CourseListResponse {
  success: boolean;
  message: string;
  data: Course[];
  meta: CourseMeta;
}

export interface CourseDetailResponse {
  success: boolean;
  message: string;
  data: Course;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/courses`;

  getCourses(page: number = 1, perPage: number = 10): Observable<CourseListResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    return this.http.get<CourseListResponse>(this.apiUrl, { params });
  }

  getCourse(id: number): Observable<CourseDetailResponse> {
    return this.http.get<CourseDetailResponse>(`${this.apiUrl}/${id}`);
  }

  getCourseBySlug(slug: string): Observable<CourseDetailResponse> {
    return this.http.get<CourseDetailResponse>(`${this.apiUrl}/${slug}`);
  }
}
