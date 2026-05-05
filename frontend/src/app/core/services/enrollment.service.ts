import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, Course } from '../models';

export interface EnrolledCourse {
  id: number;
  title: string;
  slug: string;
  description: string;
  level: string;
  thumbnail?: string;
  price_in_credits?: number;
  instructor: {
    id: number;
    name: string;
    avatar?: string;
  } | null;
  category?: { id: number; name: string; slug: string } | null;
  progress: number;
  total_lessons: number;
  completed_lessons: number;
  is_completed: boolean;
  enrollment_date: string;
  completed_at?: string;
}

export interface MyCoursesResponse {
  success: boolean;
  data: EnrolledCourse[];
  stats: {
    total: number;
    completed: number;
    in_progress: number;
  };
}

export interface AccessibleCoursesResponse {
  success: boolean;
  data: {
    data: Course[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  plan_name: string;
  allowed_levels: string[];
}

export interface AccessCheckResponse {
  success: boolean;
  has_access: boolean;
  course_level: string;
  plan_name: string;
  reason?: string;
  message?: string;
}

export interface MyProgressResponse {
  progress: number;
  completed_lesson_ids: number[];
  last_lesson_id: number | null;
  completed_at: string | null;
}

export interface CompleteLessonResponse {
  progress: number;
  completed_lesson_id: number;
  certificate_ready: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class EnrollmentService {
  private api = inject(ApiService);

  getMyCourses(): Observable<ApiResponse<any>> {
    return this.api.get<ApiResponse<any>>('student/my-courses');
  }

  getAccessibleCourses(): Observable<ApiResponse<AccessibleCoursesResponse>> {
    return this.api.get<ApiResponse<AccessibleCoursesResponse>>('courses/accessible');
  }

  checkCourseAccess(courseId: number): Observable<ApiResponse<AccessCheckResponse>> {
    return this.api.get<ApiResponse<AccessCheckResponse>>(`courses/${courseId}/access-check`);
  }

  markCourseComplete(courseId: number): Observable<ApiResponse<any>> {
    return this.api.post<ApiResponse<any>>(`courses/${courseId}/complete`, {});
  }

  getMyProgress(courseId: number): Observable<ApiResponse<MyProgressResponse>> {
    return this.api.get<ApiResponse<MyProgressResponse>>(`courses/${courseId}/my-progress`);
  }

  completeLesson(lessonId: number): Observable<ApiResponse<CompleteLessonResponse>> {
    return this.api.post<ApiResponse<CompleteLessonResponse>>(`lessons/${lessonId}/complete`, {});
  }
}