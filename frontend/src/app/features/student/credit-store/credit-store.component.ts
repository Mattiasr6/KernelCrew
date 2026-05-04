import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface CreditPackage {
  id: number;
  name: string;
  credits_amount: number;
  price_usd: number;
}

interface Transaction {
  id: number;
  date: string;
  amount: number;
  status: string;
  package_name: string;
  credits_amount: number;
}

@Component({
  selector: 'app-credit-store',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-zinc-950 px-4 py-16 animate-fade-in">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-12">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6">
            <span class="material-symbols-outlined text-4xl text-amber-400" style="font-variation-settings: 'FILL' 1;">database</span>
          </div>
          <h1 class="text-4xl font-bold tracking-tight text-zinc-50 mb-3">Tienda de Créditos</h1>
          <p class="text-zinc-400 max-w-lg mx-auto">Compra créditos para acceder a cursos de forma permanente. Sin suscripciones ni renovaciones.</p>
          <div class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800">
            <span class="material-symbols-outlined text-amber-400 text-[18px]" style="font-variation-settings: 'FILL' 1;">database</span>
            <span class="text-sm text-zinc-300">Tu saldo:</span>
            <span class="text-sm font-bold text-amber-400">{{ authService.user()?.credits_balance ?? 0 }} créditos</span>
          </div>
        </div>

        @if (isLoading()) {
          <div class="flex items-center justify-center py-24">
            <div class="w-10 h-10 border-2 border-zinc-700 border-t-cyan-500 rounded-full animate-spin"></div>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            @for (pkg of packages(); track pkg.id) {
              <div class="pricing-card" [class.featured]="pkg.name === 'Pro'">
                @if (pkg.name === 'Pro') {
                  <div class="recommended-badge">Recomendado</div>
                }
                <div class="card-header">
                  <h3 class="plan-name">{{ pkg.name }}</h3>
                  <div class="price-container">
                    <span class="currency">$</span>
                    <span class="amount">{{ pkg.price_usd }}</span>
                  </div>
                </div>
                <div class="credits-display">
                  <span class="material-symbols-outlined text-amber-400 text-3xl" style="font-variation-settings: 'FILL' 1;">database</span>
                  <span class="credits-amount">{{ pkg.credits_amount }}</span>
                  <span class="text-zinc-500 text-sm">créditos</span>
                </div>
                <button
                  class="buy-btn"
                  [class.featured-btn]="pkg.name === 'Pro'"
                  (click)="buyPackage(pkg)"
                  [disabled]="isProcessing()"
                >
                  @if (isProcessing() && selectedId() === pkg.id) {
                    <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Procesando...</span>
                  } @else {
                    <span>Comprar por &#36;{{ pkg.price_usd }}</span>
                  }
                </button>
              </div>
            }
          </div>

          @if (transactions().length > 0) {
            <div class="mt-16 border-t border-zinc-800 pt-12">
              <h2 class="text-2xl font-bold text-zinc-50 mb-6">Últimas Transacciones</h2>
              <div class="overflow-x-auto rounded-xl border border-zinc-800">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="bg-zinc-900 text-zinc-400 text-left">
                      <th class="px-5 py-4 font-semibold">Fecha</th>
                      <th class="px-5 py-4 font-semibold">Paquete</th>
                      <th class="px-5 py-4 font-semibold">Créditos</th>
                      <th class="px-5 py-4 font-semibold">Monto (USD)</th>
                      <th class="px-5 py-4 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-zinc-800">
                    @for (tx of transactions(); track tx.id) {
                      <tr class="hover:bg-zinc-900/50 transition-colors">
                        <td class="px-5 py-4 text-zinc-300">{{ tx.date }}</td>
                        <td class="px-5 py-4 text-zinc-100 font-medium">{{ tx.package_name }}</td>
                        <td class="px-5 py-4 text-amber-400 font-bold">{{ tx.credits_amount }}</td>
                        <td class="px-5 py-4 text-zinc-300">&#36;{{ tx.amount }}</td>
                        <td class="px-5 py-4">
                          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                            [ngClass]="tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'">
                            {{ tx.status === 'completed' ? 'Completado' : tx.status }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          <div class="text-center mt-12">
            <div class="inline-flex items-center gap-2 text-zinc-500 text-sm">
              <span class="material-symbols-outlined text-[16px]">lock</span>
              <span>Pago único seguro vía Stripe</span>
              <span class="text-zinc-700">|</span>
              <span class="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Créditos disponibles de por vida</span>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .pricing-card {
      position: relative; background: #18181b; border: 1px solid #27272a;
      border-radius: 24px; padding: 40px 32px;
      display: flex; flex-direction: column; align-items: center; text-align: center;
      transition: all 0.3s ease-in-out;
    }
    .pricing-card:hover { transform: translateY(-8px); border-color: #3f3f46; }
    .pricing-card.featured {
      border: 2px solid #8b5cf6; box-shadow: 0 0 30px rgba(139, 92, 246, 0.15);
    }

    .recommended-badge {
      position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      color: white; padding: 6px 20px; border-radius: 9999px;
      font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
    }

    .card-header { margin-bottom: 24px; }
    .plan-name {
      font-size: 1.25rem; font-weight: 700; color: #a1a1aa;
      margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em;
    }
    .featured .plan-name { color: #8b5cf6; }

    .price-container { display: flex; align-items: baseline; justify-content: center; gap: 4px; }
    .currency { font-size: 1.5rem; font-weight: 600; color: #fafafa; }
    .amount { font-size: 3.5rem; font-weight: 800; color: #fafafa; line-height: 1; }

    .credits-display {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      margin: 24px 0 32px; padding: 16px; border-radius: 16px;
      background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.1);
      width: 100%;
    }
    .credits-amount { font-size: 2rem; font-weight: 800; color: #f59e0b; }

    .buy-btn {
      width: 100%; padding: 16px; border-radius: 12px;
      background: rgba(6, 182, 212, 0.1); color: #06b6d4;
      font-weight: 700; border: 1px solid rgba(6, 182, 212, 0.2);
      cursor: pointer; transition: all 0.2s;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .buy-btn:hover:not(:disabled) { background: rgba(6, 182, 212, 0.2); transform: translateY(-2px); }
    .buy-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .buy-btn.featured-btn {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      color: white; border: none;
    }
    .buy-btn.featured-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #7c3aed, #6d28d9);
      box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
    }
  `]
})
export class CreditStoreComponent implements OnInit {
  private api = inject(ApiService);
  authService = inject(AuthService);
  private notification = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  packages = signal<CreditPackage[]>([]);
  transactions = signal<Transaction[]>([]);
  isLoading = signal(true);
  isProcessing = signal(false);
  selectedId = signal<number | null>(null);

  ngOnInit() {
    this.loadPackages();
    this.loadTransactions();
  }

  loadTransactions() {
    this.api.get<{ success: boolean; data: Transaction[] }>('payments')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.transactions.set(res.data || []);
        }
      });
  }

  loadPackages() {
    this.api.get<{ success: boolean; data: CreditPackage[] }>('credit-packages')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.packages.set(res.data || []);
          this.isLoading.set(false);
        },
        error: () => {
          this.notification.error('Error al cargar paquetes');
          this.isLoading.set(false);
        }
      });
  }

  buyPackage(pkg: CreditPackage) {
    this.isProcessing.set(true);
    this.selectedId.set(pkg.id);

    this.api.post<{ success: boolean; data: { url: string } }>('stripe/credits/checkout', {
      credit_package_id: pkg.id,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.data?.url) {
            window.location.href = res.data.url;
          }
        },
        error: () => {
          this.isProcessing.set(false);
          this.notification.error('Error al iniciar el pago');
        }
      });
  }
}
