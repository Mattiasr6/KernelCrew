import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div class="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center animate-fade-in">
        <div class="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
          <span class="material-symbols-outlined text-emerald-400 text-5xl">check_circle</span>
        </div>
        
        <h1 class="text-3xl font-bold text-zinc-50 mb-4">¡Pago Exitoso!</h1>
        <p class="text-zinc-400 mb-10">
          Tu suscripción ha sido activada correctamente. Ahora tienes acceso a todo el contenido de tu plan.
        </p>

        <button routerLink="/dashboard" class="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 text-white font-bold shadow-lg hover:scale-[1.02] transition-transform active:scale-[0.98]">
          Ir a mi Dashboard
        </button>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class PaymentSuccessComponent implements OnInit {
  private authService = inject(AuthService);
  private notification = inject(NotificationService);

  ngOnInit() {
    // Sincronizar sesión para reflejar el nuevo saldo/suscripción
    this.authService.refreshUserSession();
    this.notification.success('Pago procesado correctamente.');
  }
}
