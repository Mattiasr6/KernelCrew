import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
      <div class="max-w-md w-full glass-card p-10 text-center">
        <div class="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/30">
          <span class="material-symbols-outlined text-amber-400 text-5xl">cancel</span>
        </div>
        
        <h1 class="text-3xl font-bold text-white mb-4">Pago Cancelado</h1>
        <p class="text-slate-400 mb-10">
          No se ha realizado ningún cargo a tu cuenta. Puedes volver a intentarlo cuando estés listo.
        </p>

        <button routerLink="/subscriptions" class="w-full py-4 rounded-xl bg-slate-800 text-white font-bold border border-white/10 hover:bg-slate-700 transition-all">
          Volver a Planes
        </button>
      </div>
    </div>
  `
})
export class PaymentCancelComponent {}
