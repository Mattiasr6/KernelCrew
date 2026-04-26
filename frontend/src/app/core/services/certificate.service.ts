import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Certificate } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/v1/certificates`;

  /**
   * Obtener todos los certificados del usuario autenticado
   */
  getMyCertificates(): Observable<ApiResponse<Certificate[]>> {
    return this.http.get<ApiResponse<Certificate[]>>(this.apiUrl);
  }

  /**
   * Descargar el PDF del certificado
   */
  downloadPdf(uuid: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${uuid}/download`, {
      responseType: 'blob'
    });
  }
}
