import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, CourseSection, Lesson } from '../models';

@Injectable({
  providedIn: 'root',
})
export class CurriculumService {
  private api = inject(ApiService);

  getCurriculum(courseId: number): Observable<ApiResponse<{ sections: CourseSection[] }>> {
    return this.api.get<ApiResponse<{ sections: CourseSection[] }>>(
      `instructor/courses/${courseId}/curriculum`
    );
  }

  createSection(courseId: number, data: { title: string; order?: number }): Observable<ApiResponse<CourseSection>> {
    return this.api.post<ApiResponse<CourseSection>>(
      `instructor/courses/${courseId}/sections`,
      data
    );
  }

  updateSection(sectionId: number, data: Partial<CourseSection>): Observable<ApiResponse<CourseSection>> {
    return this.api.put<ApiResponse<CourseSection>>(
      `instructor/sections/${sectionId}`,
      data
    );
  }

  deleteSection(sectionId: number): Observable<ApiResponse<null>> {
    return this.api.delete<ApiResponse<null>>(`instructor/sections/${sectionId}`);
  }

  createLesson(sectionId: number, data: Partial<Lesson>): Observable<ApiResponse<Lesson>> {
    return this.api.post<ApiResponse<Lesson>>(
      `instructor/sections/${sectionId}/lessons`,
      data
    );
  }

  updateLesson(lessonId: number, data: Partial<Lesson>): Observable<ApiResponse<Lesson>> {
    return this.api.put<ApiResponse<Lesson>>(
      `instructor/lessons/${lessonId}`,
      data
    );
  }

  deleteLesson(lessonId: number): Observable<ApiResponse<null>> {
    return this.api.delete<ApiResponse<null>>(`instructor/lessons/${lessonId}`);
  }

  reorderSections(courseId: number, sections: { id: number; order: number }[]): Observable<ApiResponse<null>> {
    return this.api.post<ApiResponse<null>>(
      `instructor/courses/${courseId}/sections/reorder`,
      { sections }
    );
  }

  reorderLessons(lessons: { id: number; order: number }[]): Observable<ApiResponse<null>> {
    return this.api.post<ApiResponse<null>>(
      'instructor/lessons/reorder',
      { lessons }
    );
  }
}
