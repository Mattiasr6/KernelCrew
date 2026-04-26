import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, InstructorApplication, ApplicationPayload } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/v1`;

  /**
   * Estudiante: Enviar nueva postulación
   */
  submitApplication(payload: ApplicationPayload): Observable<ApiResponse<InstructorApplication>> {
    return this.http.post<ApiResponse<InstructorApplication>>(
      `${this.apiUrl}/instructor-applications`, 
      payload
    );
  }

  /**
   * Admin: Listar todas las postulaciones con estado 'pending'
   */
  getPendingApplications(): Observable<ApiResponse<{ data: InstructorApplication[] }>> {
    return this.http.get<ApiResponse<{ data: InstructorApplication[] }>>(
      `${this.apiUrl}/admin/instructor-applications`
    );
  }

  /**
   * Admin: Aprobar una postulación (Cambia automáticamente el role_id en el backend)
   */
  approveApplication(id: number): Observable<ApiResponse<InstructorApplication>> {
    return this.http.patch<ApiResponse<InstructorApplication>>(
      `${this.apiUrl}/admin/instructor-applications/${id}/approve`, 
      {}
    );
  }

  /**
   * Admin: Rechazar una postulación
   */
  rejectApplication(id: number): Observable<ApiResponse<InstructorApplication>> {
    return this.http.patch<ApiResponse<InstructorApplication>>(
      `${this.apiUrl}/admin/instructor-applications/${id}/reject`, 
      {}
    );
  }
}
