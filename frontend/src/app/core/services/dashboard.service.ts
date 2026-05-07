import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, DashboardData } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/instructor`;

  /**
   * Obtener estadísticas, progreso de créditos y actividad reciente del instructor
   */
  getInstructorStats(): Observable<ApiResponse<DashboardData>> {
    return this.http.get<ApiResponse<DashboardData>>(`${this.apiUrl}/dashboard`);
  }

  /**
   * Obtener estudiantes inscritos en los cursos del instructor con progreso
   */
  getStudents(): Observable<ApiResponse<Array<{ student_name: string; student_email: string; course_title: string; course_id: number; progress: number; enrollment_date: string; completed_at: string | null }>>> {
    return this.http.get<any>(`${this.apiUrl}/students`);
  }
}
