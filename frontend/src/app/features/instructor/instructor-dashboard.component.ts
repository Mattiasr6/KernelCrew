import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardData, Activity } from '../../core/models';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="bg-background text-on-background min-h-screen flex font-body-md overflow-hidden selection:bg-primary-container selection:text-on-primary-container">
      
      <!-- SideNavBar (Adaptada de Stitch) -->
      <nav class="fixed left-0 top-0 h-full flex flex-col py-6 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-lg h-screen w-64 border-r border-white/10 shadow-2xl z-40 hidden md:flex">
        <div class="px-6 mb-10 flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <span class="material-symbols-outlined text-white" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
          </div>
          <div>
            <h1 class="text-lg font-black text-slate-100 tracking-tight">EduPortal</h1>
            <p class="font-inter text-slate-300 text-xs opacity-80">Faculty Portal</p>
          </div>
        </div>
        
        <div class="flex-1 flex flex-col px-3 gap-2">
          <a class="flex items-center gap-3 px-4 py-3 bg-white/10 text-blue-400 border-l-4 border-blue-500 rounded-r-lg font-inter" routerLink="/instructor">
            <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">dashboard</span>
            <span class="font-semibold text-sm">Dashboard</span>
          </a>
          <a class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all font-inter" routerLink="/my-certificates">
            <span class="material-symbols-outlined text-[20px]">workspace_premium</span>
            <span class="font-medium text-sm">Mis Certificados</span>
          </a>
          <a class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all font-inter" routerLink="/instructor/courses">
            <span class="material-symbols-outlined text-[20px]">menu_book</span>
            <span class="font-medium text-sm">Mis Cursos</span>
          </a>
        </div>

        <div class="px-6 mt-auto">
          <button class="w-full py-2.5 rounded-lg border border-white/10 text-slate-300 font-inter text-sm hover:bg-white/5 transition-all flex items-center justify-center gap-2 shadow-sm">
            <span class="material-symbols-outlined text-[18px]">data_usage</span>
            View Status
          </button>
        </div>
      </nav>

      <!-- Main Canvas -->
      <main class="flex-1 md:ml-64 relative p-6 min-h-screen overflow-y-auto">
        <!-- Ambient Background Glow -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div class="max-w-[1280px] mx-auto space-y-8 animate-fade-in relative z-10">
          
          <!-- Header -->
          <header class="mb-8">
            <h1 class="text-3xl md:text-4xl font-bold text-white mb-2 font-h2">Resumen de Créditos</h1>
            <p class="text-slate-400 font-body-md">Gestiona tus créditos de inscripción y metas de publicación.</p>
          </header>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <!-- Main Focus Card: Créditos de Inscripción -->
            <div class="lg:col-span-7">
              <div class="glass-card rounded-2xl p-8 relative overflow-hidden h-full flex flex-col justify-between border border-white/10 bg-slate-900/40 backdrop-blur-xl">
                <!-- Decorative background glow -->
                <div class="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div class="relative z-10">
                  <div class="flex items-center gap-3 mb-8">
                    <div class="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                      <span class="material-symbols-outlined text-emerald-400" style="font-variation-settings: 'FILL' 1;">stars</span>
                    </div>
                    <h2 class="text-2xl font-bold text-white font-h3">Créditos de Inscripción</h2>
                  </div>

                  <div class="mb-10">
                    <div class="flex items-baseline gap-3">
                      <span class="text-7xl font-black text-emerald-400 leading-none drop-shadow-[0_0_15px_rgba(16,185,129,0.4)] font-h1">
                        {{ dashboardData()?.credits_available ?? 0 }}
                      </span>
                      <span class="text-lg text-slate-400 font-medium">Créditos Disponibles</span>
                    </div>
                  </div>

                  <div class="mt-auto pt-8 border-t border-white/5">
                    <div class="flex justify-between items-center mb-3">
                      <span class="text-sm font-semibold text-slate-300">Progreso para tu próximo crédito</span>
                      <span class="text-sm font-bold text-emerald-400">
                        {{ dashboardData()?.gamification?.progress_current ?? 0 }}/{{ dashboardData()?.gamification?.progress_target ?? 3 }} Cursos
                      </span>
                    </div>
                    
                    <div class="h-4 w-full bg-slate-800/50 rounded-full overflow-hidden border border-white/5 p-[2px]">
                      <div class="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full relative transition-all duration-1000 ease-out"
                           [style.width.%]="progressPercentage()">
                        <div class="absolute top-0 left-0 right-0 h-[1px] bg-white/30"></div>
                      </div>
                    </div>
                    
                    <p class="text-xs text-slate-400 mt-4 flex items-center gap-2">
                      <span class="material-symbols-outlined text-xs">info</span>
                      Publica {{ 3 - (dashboardData()?.gamification?.progress_current ?? 0) }} cursos más para obtener 1 crédito adicional.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Supporting Card: Actividad Reciente -->
            <div class="lg:col-span-5">
              <div class="glass-card rounded-2xl p-6 h-full border border-white/10 bg-slate-900/40 backdrop-blur-xl">
                <div class="flex items-center justify-between mb-8">
                  <h3 class="text-xl font-bold text-white font-h3">Actividad Reciente</h3>
                  <button class="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors">Ver todo</button>
                </div>

                <ul class="space-y-4">
                  @for (activity of dashboardData()?.recent_activity; track activity.id) {
                    <li class="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5 group">
                      <div class="w-11 h-11 rounded-full flex items-center justify-center border transition-transform group-hover:scale-110"
                           [ngClass]="getActivityConfig(activity.type).containerClass">
                        <span class="material-symbols-outlined text-lg">{{ getActivityConfig(activity.type).icon }}</span>
                      </div>
                      
                      <div class="flex-1">
                        <p class="text-sm font-medium text-slate-200">{{ activity.description }}</p>
                        <p class="text-xs text-slate-500 mt-1 uppercase tracking-wider">{{ activity.created_at | date:'shortTime' }} • {{ activity.created_at | date:'dd MMM' }}</p>
                      </div>

                      <span class="text-xs font-bold px-2 py-1 rounded-md" [ngClass]="getActivityConfig(activity.type).textClass">
                        {{ getActivityConfig(activity.type).badge }}
                      </span>
                    </li>
                  } @empty {
                    <div class="flex flex-col items-center justify-center py-12 text-slate-500 opacity-50">
                      <span class="material-symbols-outlined text-5xl mb-4">history_toggle_off</span>
                      <p class="text-sm">Aún no tienes actividad registrada.</p>
                    </div>
                  }
                </ul>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-fade-in { animation: fadeIn 0.8s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class InstructorDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private authService = inject(AuthService);

  dashboardData = signal<DashboardData | null>(null);
  isLoading = signal(true);

  progressPercentage = computed(() => {
    const data = this.dashboardData();
    if (!data || !data.gamification) return 0;
    return (data.gamification.progress_current / data.gamification.progress_target) * 100;
  });

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading.set(true);
    this.dashboardService.getInstructorStats().subscribe({
      next: (res) => {
        this.dashboardData.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getActivityConfig(type: string) {
    const configs: Record<string, any> = {
      'course_published': {
        icon: 'publish',
        containerClass: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
        textClass: 'text-blue-400 bg-blue-500/5',
        badge: '+1 Progreso'
      },
      'credit_earned': {
        icon: 'star',
        containerClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        textClass: 'text-emerald-400 bg-emerald-500/5',
        badge: '+1 CRÉDITO'
      },
      'application_approved': {
        icon: 'verified_user',
        containerClass: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
        textClass: 'text-purple-400 bg-purple-500/5',
        badge: 'FACULTY'
      }
    };

    return configs[type] || {
      icon: 'notifications',
      containerClass: 'bg-slate-500/10 border-slate-500/20 text-slate-400',
      textClass: 'text-slate-400 bg-slate-500/5',
      badge: 'INFO'
    };
  }
}
