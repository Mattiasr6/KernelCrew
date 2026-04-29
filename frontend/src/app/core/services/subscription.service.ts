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
   * Obtener suscripción activa del usuario
   */
  getActive(): Observable<ApiResponse<any>> {
    return this.api.get<ApiResponse<any>>('subscriptions/active');
  }

  /**
   * Obtener historial de suscripciones del usuario
   */
  getHistory(): Observable<ApiResponse<any>> {
    return this.api.get<ApiResponse<any>>('subscriptions/history');
  }

  /**
   * Actualizar auto_renew de una suscripción
   */
  updateAutoRenew(subscriptionId: number, autoRenew: boolean): Observable<ApiResponse<any>> {
    return this.api.patch<ApiResponse<any>>(
      `subscriptions/${subscriptionId}/auto-renew`,
      { auto_renew: autoRenew }
    );
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

  /**
   * ADMIN: Obtener todas las transacciones de pago
   */
  getAdminPayments(params?: any): Observable<ApiResponse<any>> {
    return this.api.get<ApiResponse<any>>('admin/payments', params);
  }

  /**
   * ADMIN: Obtener estadísticas de pagos
   */
  getAdminStats(): Observable<ApiResponse<any>> {
    return this.api.get<ApiResponse<any>>('admin/payments/stats');
  }
}
