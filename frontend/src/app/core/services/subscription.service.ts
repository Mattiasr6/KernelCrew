import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, SubscriptionPlan } from '../models';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private api = inject(ApiService);

  /**
   * Obtener todos los planes disponibles
   */
  getPlans(): Observable<ApiResponse<SubscriptionPlan[]>> {
    return this.api.get<ApiResponse<SubscriptionPlan[]>>('subscriptions/plans');
  }

  /**
   * Procesar el checkout simulado
   */
  processCheckout(data: { plan_id: number; card_number: string }): Observable<ApiResponse<any>> {
    return this.api.post<ApiResponse<any>>('subscriptions/checkout', data);
  }
}
