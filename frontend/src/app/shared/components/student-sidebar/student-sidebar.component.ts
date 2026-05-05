import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-student-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="fixed left-0 top-0 h-full flex flex-col py-6 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-lg h-screen w-64 border-r border-white/10 shadow-2xl z-40 hidden md:flex">
      <div class="px-6 mb-10 flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          <span class="material-symbols-outlined text-white" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
        </div>
        <div>
          <h1 class="text-lg font-black text-slate-100 tracking-tight">KernelLearn</h1>
          <p class="font-inter text-slate-300 text-xs opacity-80">Faculty Portal</p>
        </div>
      </div>
      
      <div class="flex-1 flex flex-col px-3 gap-2">
        <a 
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all font-inter"
          routerLink="/dashboard"
          routerLinkActive="bg-white/10 text-blue-400 border-l-4 border-blue-500 rounded-r-lg"
          [routerLinkActiveOptions]="{ exact: true }">
          <span class="material-symbols-outlined text-[20px]">home</span>
          <span class="font-medium text-sm">Home</span>
        </a>
        <a 
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all font-inter"
          routerLink="/my-certificates"
          routerLinkActive="bg-white/10 text-blue-400 border-l-4 border-blue-500 rounded-r-lg">
          <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">workspace_premium</span>
          <span class="font-semibold text-sm">Mis Certificados</span>
        </a>
        @if (!authService.isInstructor()) {
          <a 
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all font-inter"
            routerLink="/become-teacher"
            routerLinkActive="bg-white/10 text-blue-400 border-l-4 border-blue-500 rounded-r-lg">
            <span class="material-symbols-outlined text-[20px]">school</span>
            <span class="font-medium text-sm">Become a Teacher</span>
          </a>
        }
      </div>

      <div class="px-6 mt-auto">
        <button class="w-full py-2.5 rounded-lg border border-white/10 text-slate-300 font-inter text-sm hover:bg-white/5 transition-all flex items-center justify-center gap-2 shadow-sm">
          <span class="material-symbols-outlined text-[18px]">data_usage</span>
          View Status
        </button>
      </div>
    </nav>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class StudentSidebarComponent {
  authService = inject(AuthService);
}
