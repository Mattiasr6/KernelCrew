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
    <div class="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
      <div class="max-w-md w-full glass-card p-10 text-center animate-fade-in">
        <div class="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          <span class="material-symbols-outlined text-emerald-400 text-5xl">check_circle</span>
        </div>
        
        <h1 class="text-3xl font-bold text-white mb-4 font-h2">¡Pago Exitoso!</h1>
        <p class="text-slate-400 mb-10 font-body-md">
          Tu suscripción ha sido activada correctamente. Ahora tienes acceso a todo el contenido de tu plan.
        </p>

        <button routerLink="/dashboard" class="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg hover:scale-[1.02] transition-transform active:scale-[0.98]">
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
    // Sincronizar sesión para reflejar la nueva suscripción
    this.authService.refreshUserSession();
    this.notification.success('¡Bienvenido al nivel Pro!');
  }
}
