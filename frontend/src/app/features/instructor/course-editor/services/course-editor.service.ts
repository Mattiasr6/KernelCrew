import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { Course } from '../../../../core/models';

export type EditorCourse = Omit<Course, 'category'> & {
  sections_count?: number;
  lessons_count?: number;
  students_count?: number;
  rejection_reason?: string | null;
  category_id?: number;
  category?: { id: number; name: string; slug: string } | null;
};

@Injectable({ providedIn: 'root' })
export class CourseEditorService {
  private api = inject(ApiService);

  currentCourse = signal<EditorCourse | null>(null);

  fetchCourse(id: number): Observable<{ success: boolean; data: EditorCourse }> {
    return this.api.get<{ success: boolean; data: EditorCourse }>(`instructor/courses/${id}`).pipe(
      tap((res: { success: boolean; data: EditorCourse }) => {
        if (res.success && res.data) {
          this.currentCourse.set(res.data);
        }
      }),
    );
  }

  updateBasic(
    courseId: number,
    data: { title?: string; description?: string; category_id?: number; level?: string; thumbnail?: string },
  ): Observable<{ success: boolean; data: EditorCourse; message?: string }> {
    return this.api.patch<{ success: boolean; data: EditorCourse; message?: string }>(
      `instructor/courses/${courseId}/basic`,
      data,
    ).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.currentCourse.update((c) => (c ? { ...c, ...res.data } as EditorCourse : null));
        }
      }),
    );
  }

  updatePricing(
    courseId: number,
    data: { price_in_credits: number },
  ): Observable<{ success: boolean; data: EditorCourse; message?: string }> {
    return this.api.patch<{ success: boolean; data: EditorCourse; message?: string }>(
      `instructor/courses/${courseId}/pricing`,
      data,
    ).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.currentCourse.update((c) => (c ? { ...c, ...res.data } as EditorCourse : null));
        }
      }),
    );
  }
}
