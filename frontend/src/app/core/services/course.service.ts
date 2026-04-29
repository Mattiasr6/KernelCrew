import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, Course, CreateCourseRequest, UpdateCourseRequest } from '../models';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private api = inject(ApiService);

  /**
   * Obtener cursos del instructor autenticado
   */
  getInstructorCourses(): Observable<ApiResponse<{ courses: Course[] }>> {
    return this.api.get<ApiResponse<{ courses: Course[] }>>('instructor/courses');
  }

  /**
   * Crear un nuevo curso
   */
  createCourse(data: CreateCourseRequest): Observable<ApiResponse<{ course: Course }>> {
    return this.api.post<ApiResponse<{ course: Course }>>('instructor/courses', data);
  }

  /**
   * Actualizar un curso existente
   */
  updateCourse(id: number, data: UpdateCourseRequest): Observable<ApiResponse<{ course: Course }>> {
    return this.api.put<ApiResponse<{ course: Course }>>(`instructor/courses/${id}`, data);
  }

  /**
   * Eliminar un curso
   */
  deleteCourse(id: number): Observable<ApiResponse<null>> {
    return this.api.delete<ApiResponse<null>>(`instructor/courses/${id}`);
  }

  /**
   * Obtener catálogo público de cursos
   */
  getCourses(params?: any): Observable<ApiResponse<{ courses: Course[] }>> {
    return this.api.get<ApiResponse<{ courses: Course[] }>>('courses', params);
  }

  /**
   * Obtener detalle de un curso
   */
  getCourse(id: number): Observable<ApiResponse<{ course: Course }>> {
    return this.api.get<ApiResponse<{ course: Course }>>(`courses/${id}`);
  }

  /**
   * Obtener categorías disponibles
   */
  getCategories(): Observable<ApiResponse<any>> {
    return this.api.get<ApiResponse<any>>('courses/categories');
  }

  /**
   * Inscribir al usuario en un curso
   */
  enrollInCourse(id: number): Observable<ApiResponse<any>> {
    return this.api.post<ApiResponse<any>>(`courses/${id}/enroll`, {});
  }

  /**
   * Actualizar el progreso de un curso
   */
  updateProgress(id: number, progress: number): Observable<ApiResponse<any>> {
    return this.api.patch<ApiResponse<any>>(`courses/${id}/progress`, { progress });
  }

  /**
   * Obtener el estado de la inscripción
   */
  getEnrollmentStatus(id: number): Observable<ApiResponse<any>> {
    return this.api.get<ApiResponse<any>>(`courses/${id}/enrollment-status`);
  }
}
