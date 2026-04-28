import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, CourseReview } from '../models';

export interface ReviewResponse {
  reviews: CourseReview[];
  average_rating: number;
  total_reviews: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private api = inject(ApiService);

  /**
   * Obtener todas las reseñas de un curso
   */
  getReviews(courseId: number): Observable<ApiResponse<ReviewResponse>> {
    return this.api.get<ApiResponse<ReviewResponse>>(`courses/${courseId}/reviews`);
  }

  /**
   * Enviar una nueva reseña
   */
  submitReview(courseId: number, data: { rating: number; comment?: string }): Observable<ApiResponse<CourseReview>> {
    return this.api.post<ApiResponse<CourseReview>>(`courses/${courseId}/reviews`, data);
  }
}
