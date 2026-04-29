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
   * Crear sesión real en Stripe Sandbox
   */
  createCheckoutSession(planId: number): Observable<ApiResponse<{ url: string }>> {
    return this.api.post<ApiResponse<{ url: string }>>('checkout/session', { plan_id: planId });
  }

  /**
   * Procesar el checkout simulado (Legacy)
   */
  processCheckout(data: { plan_id: number; card_number: string }): Observable<ApiResponse<any>> {
    return this.api.post<ApiResponse<any>>('subscriptions/checkout', data);
  }
}
