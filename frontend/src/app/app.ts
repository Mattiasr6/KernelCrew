import { Component, inject, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { trigger, transition, style, animate, query } from '@angular/animations';
import { NavbarComponent } from './features/layout/components/navbar.component';
import { NotificationComponent } from './core/components/notification.component';
import { KernelAIComponent } from './features/student/kernel-ai/kernel-ai.component';
import { AuthService } from './core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, NotificationComponent, KernelAIComponent, CommonModule],
  animations: [
    trigger('routeFade', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(6px)' })
        ], { optional: true }),
        query(':leave', [
          animate('120ms ease-out', style({ opacity: 0 }))
        ], { optional: true }),
        query(':enter', [
          animate('250ms 130ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
        ], { optional: true })
      ])
    ])
  ],
  template: `
    <app-notification></app-notification>
    <app-navbar></app-navbar>
    <main [@routeFade]="o.isActivated ? o.activatedRoute : ''">
      <router-outlet #o="outlet"></router-outlet>
    </main>
    @if (showKernelAI()) {
      <app-kernel-ai></app-kernel-ai>
    }
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }
      main {
        flex: 1;
      }
    `,
  ],
})
export class App {
  private authService = inject(AuthService);

  showKernelAI = computed(() => !!this.authService.user());
}
