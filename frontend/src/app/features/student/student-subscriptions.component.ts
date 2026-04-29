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
    <div class="min-h-screen bg-zinc-950 px-4 py-16 animate-fade-in">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <h1 class="text-4xl font-bold tracking-tight text-zinc-50 mb-4">Planes de Suscripción</h1>
          <p class="text-zinc-400 max-w-2xl mx-auto text-lg">
            Elige el plan que mejor se adapte a tu camino de aprendizaje en KernelLearn.
          </p>
        </div>

        <!-- Pricing Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          @for (plan of plans(); track plan.id) {
            <div class="pricing-card" [class.featured]="isFeaturedPlan(plan)">
              @if (isFeaturedPlan(plan)) {
                <div class="recommended-badge">
                  <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
                  Recomendado
                </div>
              }
              
              <div class="card-header">
                <h3 class="plan-name">{{ plan.name }}</h3>
                <div class="price-container">
                  <span class="currency">$</span>
                  <span class="amount">{{ plan.price / 100 }}</span>
                  <span class="duration text-zinc-500">/mes</span>
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
                  <span class="text-violet-400">KernelAI Assistant</span> incluido
                </li>
              </ul>

              <button class="subscribe-btn" [class.featured-btn]="isFeaturedPlan(plan)" (click)="subscribe(plan)" [disabled]="isProcessing() && selectedPlanId() === plan.id">
                @if (isProcessing() && selectedPlanId() === plan.id) {
                  <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
                  <span>Conectando...</span>
                } @else {
                  @if (isFeaturedPlan(plan)) {
                    <span class="material-symbols-outlined mr-2">rocket_launch</span>
                  }
                  Suscribirme ahora
                }
              </button>
            </div>
          }
        </div>

        <!-- Loading Overlay -->
        @if (isProcessing()) {
          <div class="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div class="text-center">
                  <mat-spinner diameter="50" class="mx-auto mb-4"></mat-spinner>
                  <p class="text-zinc-50 font-bold">Redirigiendo a pasarela segura...</p>
              </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    
    .pricing-card {
      position: relative;
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 24px;
      padding: 40px;
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease-in-out;
    }
    .pricing-card:hover { transform: translateY(-8px); border-color: #3f3f46; }
    
    .pricing-card.featured {
      background: #18181b;
      border: 2px solid #8b5cf6;
      box-shadow: 0 0 30px rgba(139, 92, 246, 0.15);
    }
    
    .recommended-badge {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      color: white;
      padding: 6px 20px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .plan-name {
      font-size: 1.25rem;
      font-weight: 700;
      color: #a1a1aa;
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .featured .plan-name { color: #8b5cf6; }
    
    .price-container { display: flex; align-items: baseline; gap: 4px; margin-bottom: 32px; }
    .currency { font-size: 1.5rem; font-weight: 600; color: #fafafa; }
    .amount { font-size: 3.5rem; font-weight: 800; color: #fafafa; line-height: 1; }
    
    .features-list { list-style: none; padding: 0; margin: 0 0 40px 0; flex: 1; }
    .features-list li { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; color: #d4d4d8; font-size: 0.95rem; }
    .features-list .icon { font-size: 20px; color: #10b981; }
    
    .subscribe-btn {
      width: 100%;
      padding: 16px;
      border-radius: 12px;
      background: rgba(6, 182, 212, 0.1);
      color: #06b6d4;
      font-weight: 700;
      border: 1px solid rgba(6, 182, 212, 0.2);
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .subscribe-btn:hover:not(:disabled) {
      background: rgba(6, 182, 212, 0.2);
      transform: translateY(-2px);
    }
    .subscribe-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    
    .subscribe-btn.featured-btn {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      color: white;
      border: none;
    }
    .subscribe-btn.featured-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #7c3aed, #6d28d9);
      box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
    }
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

  isFeaturedPlan(plan: SubscriptionPlan): boolean {
    const name = plan.name.toLowerCase();
    return name.includes('pro') || name.includes('professional') || name.includes('premium') || name.includes('enterprise');
  }

  loadPlans() {
    this.isLoading.set(true);
    this.subscriptionService.getPlans().subscribe({
      next: (res: any) => {
        const plans = Array.isArray(res.data) ? res.data : [];
        this.plans.set(plans);
        this.isLoading.set(false);
      },
      error: () => {
        this.notification.error('Error al cargar los planes de suscripción');
        this.isLoading.set(false);
      }
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
