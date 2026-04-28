import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SubscriptionService } from '../../core/services/subscription.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { SubscriptionPlan } from '../../core/models';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-student-subscriptions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatProgressSpinnerModule],
  template: `
    <div class="subscriptions-container animate-fade-in">
      <div class="header-section text-center mb-16">
        <h1 class="text-4xl font-bold text-white mb-4">Planes de Suscripción</h1>
        <p class="text-slate-400 max-w-2xl mx-auto">
          Elige el plan que mejor se adapte a tu camino de aprendizaje en KernelLearn.
        </p>
      </div>

      <!-- Pricing Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        @for (plan of plans(); track plan.id) {
          <div class="pricing-card" [class.featured]="plan.name.toLowerCase().includes('pro')">
            @if (plan.name.toLowerCase().includes('pro')) {
              <div class="recommended-badge">Recomendado</div>
            }
            
            <div class="card-header">
              <h3 class="plan-name">{{ plan.name }}</h3>
              <div class="price-container">
                <span class="currency">$</span>
                <span class="amount">{{ plan.price }}</span>
                <span class="duration">/mes</span>
              </div>
            </div>

            <ul class="features-list">
              <li>
                <span class="material-symbols-outlined icon">check_circle</span>
                {{ plan.max_courses ? 'Hasta ' + plan.max_courses + ' cursos' : 'Cursos ilimitados' }}
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
                Soporte de la comunidad
              </li>
            </ul>

            <button class="subscribe-btn" (click)="openCheckout(plan)">
              Suscribirme
            </button>
          </div>
        }
      </div>

      <!-- Checkout Modal -->
      @if (showCheckout) {
        <div class="modal-overlay" (click)="closeCheckout()">
          <div class="modal-content glass-card" (click)="$event.stopPropagation()">
            <h2 class="text-2xl font-bold text-white mb-6">Finalizar Suscripción</h2>
            <p class="text-slate-400 mb-8">
              Estás por suscribirte al plan <strong>{{ selectedPlan?.name }}</strong> por <strong>\${{ selectedPlan?.price }}</strong>.
            </p>

            <form [formGroup]="checkoutForm" (ngSubmit)="processPayment()" class="space-y-6">
              <div class="form-group">
                <label>Número de Tarjeta (Simulación)</label>
                <input type="text" formControlName="card_number" placeholder="4242 4242 4242 4242" maxlength="19">
              </div>

              <div class="flex gap-4">
                <div class="form-group flex-1">
                  <label>Expiración</label>
                  <input type="text" placeholder="MM/YY">
                </div>
                <div class="form-group flex-1">
                  <label>CVC</label>
                  <input type="text" placeholder="123">
                </div>
              </div>

              <div class="pt-4">
                <button type="submit" class="pay-btn" [disabled]="checkoutForm.invalid || isProcessing()">
                  @if (isProcessing()) {
                    <mat-spinner diameter="24"></mat-spinner>
                    <span>Procesando pago...</span>
                  } @else {
                    Pagar Ahora
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .subscriptions-container { padding: 60px 20px; min-height: 100vh; background: #0f172a; }

    .pricing-card {
      position: relative;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 40px;
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
      backdrop-filter: blur(8px);
    }

    .pricing-card:hover { transform: translateY(-10px); border-color: rgba(255, 255, 255, 0.2); }

    .pricing-card.featured {
      background: rgba(30, 41, 59, 0.8);
      border: 2px solid #3b82f6;
      box-shadow: 0 0 30px rgba(59, 130, 246, 0.2);
    }

    .recommended-badge {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: #3b82f6;
      color: white;
      padding: 4px 16px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
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
      width: 100%;
      padding: 14px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.05);
      color: white;
      font-weight: 700;
      border: 1px solid rgba(255, 255, 255, 0.1);
      cursor: pointer;
      transition: all 0.2s;
    }

    .featured .subscribe-btn { background: #3b82f6; border-color: #3b82f6; }
    .subscribe-btn:hover { background: rgba(255, 255, 255, 0.1); }
    .featured .subscribe-btn:hover { background: #2563eb; }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }

    .modal-content {
      width: 450px;
      max-width: 95%;
      padding: 40px;
      border-radius: 24px;
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .form-group label { display: block; font-size: 0.85rem; color: #94a3b8; margin-bottom: 8px; }
    .form-group input {
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 12px 16px;
      border-radius: 10px;
      color: white;
      outline: none;
    }

    .pay-btn {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      border-radius: 12px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    .pay-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class StudentSubscriptionsComponent implements OnInit {
  private subscriptionService = inject(SubscriptionService);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  plans = signal<SubscriptionPlan[]>([]);
  isLoading = signal(true);
  isProcessing = signal(false);
  showCheckout = false;
  selectedPlan: SubscriptionPlan | null = null;

  checkoutForm: FormGroup = this.fb.group({
    plan_id: [null, Validators.required],
    card_number: ['', [Validators.required, Validators.minLength(16)]]
  });

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

  openCheckout(plan: SubscriptionPlan) {
    this.selectedPlan = plan;
    this.checkoutForm.patchValue({ plan_id: plan.id });
    this.showCheckout = true;
  }

  closeCheckout() {
    this.showCheckout = false;
    this.selectedPlan = null;
    this.checkoutForm.reset();
  }

  processPayment() {
    if (this.checkoutForm.invalid) return;

    this.isProcessing.set(true);
    this.subscriptionService.processCheckout(this.checkoutForm.value).subscribe({
      next: (res) => {
        this.notification.success(res.message || 'Pago procesado con éxito');
        this.isProcessing.set(false);
        this.closeCheckout();
        
        // Refrescar la sesión para obtener el nuevo rol o estado de suscripción
        this.authService.refreshUserSession();
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isProcessing.set(false);
        this.notification.error(err.error?.message || 'Error en el pago');
      }
    });
  }
}
