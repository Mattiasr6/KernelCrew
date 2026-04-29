import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionService } from '../../core/services/subscription.service';
import { SubscriptionPlan } from '../../core/models';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-student-subscriptions',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="subscriptions-container animate-fade-in">
      <div class="header-section text-center mb-16">
        <h1 class="text-4xl font-bold text-white mb-4 font-h2">Planes de Suscripción</h1>
        <p class="text-slate-400 max-w-2xl mx-auto font-body-md">
          Elige el plan que mejor se adapte a tu camino de aprendizaje en KernelLearn.
        </p>
      </div>

      <!-- Pricing Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        @for (plan of plans(); track plan.id) {
          <div class="pricing-card" [class.featured]="plan.name.toLowerCase().includes('pro') || plan.name.toLowerCase().includes('professional')">
            @if (plan.name.toLowerCase().includes('pro') || plan.name.toLowerCase().includes('professional')) {
              <div class="recommended-badge">Recomendado</div>
            }
            
            <div class="card-header">
              <h3 class="plan-name">{{ plan.name }}</h3>
              <div class="price-container">
                <span class="currency">$</span>
                <span class="amount">{{ plan.price / 100 }}</span>
                <span class="duration">/mes</span>
              </div>
            </div>

            <ul class="features-list">
              <li>
                <span class="material-symbols-outlined icon">check_circle</span>
                {{ plan.max_courses && plan.max_courses > 0 ? 'Hasta ' + plan.max_courses + ' cursos' : 'Cursos ilimitados' }}
              </li>
              <li>
                <span class="material-symbols-outlined icon">check_circle</span>
                Acceso por {{ plan.duration_days }} días
              </li>
              <li>
                <span class="material-symbols-outlined icon">check_circle</span>
                Certificados incluidos
              </li>
              <li>
                <span class="material-symbols-outlined icon">check_circle</span>
                KernelAI Assistant incluido
              </li>
            </ul>

            <button class="subscribe-btn" (click)="subscribe(plan)" [disabled]="isProcessing() && selectedPlanId() === plan.id">
              @if (isProcessing() && selectedPlanId() === plan.id) {
                <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
                <span>Conectando...</span>
              } @else {
                Suscribirme ahora
              }
            </button>
          </div>
        }
      </div>

      <!-- Loading Overlay para bloqueo de UI durante redirección -->
      @if (isProcessing()) {
        <div class="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[1000] flex items-center justify-center">
            <div class="text-center">
                <mat-spinner diameter="50" class="mx-auto mb-4"></mat-spinner>
                <p class="text-white font-bold">Redirigiendo a pasarela segura...</p>
            </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .subscriptions-container { padding: 60px 20px; min-height: 100vh; background: #0f172a; }
    .pricing-card {
      position: relative; background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px; padding: 40px; display: flex; flex-direction: column; transition: all 0.3s ease; backdrop-filter: blur(8px);
    }
    .pricing-card:hover { transform: translateY(-10px); border-color: rgba(255, 255, 255, 0.2); }
    .pricing-card.featured { background: rgba(30, 41, 59, 0.8); border: 2px solid #3b82f6; box-shadow: 0 0 30px rgba(59, 130, 246, 0.2); }
    .recommended-badge {
      position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
      background: #3b82f6; color: white; padding: 4px 16px; border-radius: 20px;
      font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
    }
    .plan-name { font-size: 1.25rem; font-weight: 700; color: #94a3b8; margin-bottom: 16px; }
    .featured .plan-name { color: #3b82f6; }
    .price-container { display: flex; align-items: baseline; gap: 4px; margin-bottom: 32px; }
    .currency { font-size: 1.5rem; font-weight: 600; color: white; }
    .amount { font-size: 3.5rem; font-weight: 800; color: white; }
    .duration { color: #64748b; }
    .features-list { list-style: none; padding: 0; margin: 0 0 40px 0; flex: 1; }
    .features-list li { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; color: #cbd5e1; font-size: 0.95rem; }
    .features-list .icon { font-size: 20px; color: #10b981; }
    .subscribe-btn {
      width: 100%; padding: 14px; border-radius: 12px; background: rgba(255, 255, 255, 0.05);
      color: white; font-weight: 700; border: 1px solid rgba(255, 255, 255, 0.1); cursor: pointer; transition: all 0.2s;
    }
    .featured .subscribe-btn { background: #3b82f6; border-color: #3b82f6; }
    .subscribe-btn:hover:not(:disabled) { background: rgba(255, 255, 255, 0.1); }
    .featured .subscribe-btn:hover:not(:disabled) { background: #2563eb; }
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class StudentSubscriptionsComponent implements OnInit {
  private subscriptionService = inject(SubscriptionService);
  private notification = inject(NotificationService);

  plans = signal<SubscriptionPlan[]>([]);
  isLoading = signal(true);
  isProcessing = signal(false);
  selectedPlanId = signal<number | null>(null);

  ngOnInit() {
    this.loadPlans();
  }

  loadPlans() {
    this.isLoading.set(true);
    this.subscriptionService.getPlans().subscribe({
      next: (res) => {
        this.plans.set(res.data || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  subscribe(plan: SubscriptionPlan) {
    this.isProcessing.set(true);
    this.selectedPlanId.set(plan.id);

    this.subscriptionService.createCheckoutSession(plan.id).subscribe({
      next: (res) => {
        if (res.success && res.data?.url) {
          // Redirección directa a Stripe Checkout
          window.location.href = res.data.url;
        } else {
          this.isProcessing.set(false);
          this.notification.error('No se pudo generar la sesión de pago.');
        }
      },
      error: (err) => {
        this.isProcessing.set(false);
        this.notification.error(err.error?.message || 'Error al conectar con Stripe');
      }
    });
  }
}
