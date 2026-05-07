import { Component, DestroyRef, inject, signal, OnInit, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardData, Activity } from '../../core/models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Ambient Background Glow -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>

    <div class="max-w-7xl mx-auto space-y-8 animate-fade-in relative z-10">

          <!-- CTA: Crear Nuevo Curso -->
          <div class="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-cyan-400" style="font-variation-settings: 'FILL' 1;">add_circle</span>
              </div>
              <div>
                <h3 class="text-base sm:text-lg font-bold text-zinc-100">Comienza algo nuevo</h3>
                <p class="text-xs sm:text-sm text-zinc-500 mt-0.5">Crea un curso y compártelo con la comunidad</p>
              </div>
            </div>
            <a routerLink="/instructor/courses" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] w-full sm:w-auto justify-center">
              <span class="material-symbols-outlined text-[16px]">add</span>
              Crear Nuevo Curso
            </a>
          </div>

          <!-- Métricas del Instructor -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div class="metric-card">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <span class="material-symbols-outlined text-cyan-400">school</span>
                </div>
                <div>
                  <p class="text-2xl font-bold text-zinc-50">{{ dashboardData()?.stats?.courses_count || 0 }}</p>
                  <p class="text-xs text-zinc-500 uppercase tracking-wider">Cursos</p>
                </div>
              </div>
            </div>
            <div class="metric-card">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <span class="material-symbols-outlined text-emerald-400">people</span>
                </div>
                <div>
                  <p class="text-2xl font-bold text-zinc-50">{{ dashboardData()?.stats?.active_students || 0 }}</p>
                  <p class="text-xs text-zinc-500 uppercase tracking-wider">Estudiantes</p>
                </div>
              </div>
            </div>
            <div class="metric-card">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <span class="material-symbols-outlined text-amber-400">star</span>
                </div>
                <div>
                  <p class="text-2xl font-bold text-zinc-50">{{ dashboardData()?.stats?.average_rating || 0 }}</p>
                  <p class="text-xs text-zinc-500 uppercase tracking-wider">Calificación</p>
                </div>
              </div>
            </div>
            <div class="metric-card">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <span class="material-symbols-outlined text-emerald-400">check_circle</span>
                </div>
                <div>
                  <p class="text-2xl font-bold text-zinc-50">{{ dashboardData()?.stats?.courses_count || 0 }}</p>
                  <p class="text-xs text-zinc-500 uppercase tracking-wider">Publicados</p>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            <!-- Main Focus Card: Créditos de Inscripción -->
            <div class="lg:col-span-7">
              <div class="credit-card">
                <div class="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div class="relative z-10">
                  <div class="flex items-center gap-3 mb-5">
                    <div class="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <span class="material-symbols-outlined text-emerald-400" style="font-variation-settings: 'FILL' 1;">stars</span>
                    </div>
                    <h2 class="text-2xl font-bold text-zinc-50">Créditos de Inscripción</h2>
                  </div>

                  <div class="mb-6">
                    <div class="flex items-baseline gap-3">
                      <span class="text-7xl font-black text-emerald-400 leading-none drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                        {{ dashboardData()?.credits_available ?? 0 }}
                      </span>
                      <span class="text-lg text-zinc-400 font-medium">Créditos Disponibles</span>
                    </div>
                  </div>

                  <div class="mt-auto pt-5 border-t border-zinc-800">
                    <div class="flex justify-between items-center mb-3">
                      <span class="text-sm font-semibold text-zinc-300">Progreso para tu próximo crédito</span>
                      <span class="text-sm font-bold text-emerald-400">
                        {{ dashboardData()?.gamification?.progress_current ?? 0 }}/{{ dashboardData()?.gamification?.progress_target ?? 3 }} Cursos
                      </span>
                    </div>
                    
                    <div class="h-4 w-full bg-zinc-800 rounded-full overflow-hidden border border-zinc-700 p-[2px]">
                      <div class="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full relative transition-all duration-1000 ease-out"
                           [style.width.%]="progressPercentage()">
                        <div class="absolute top-0 left-0 right-0 h-[1px] bg-white/20"></div>
                      </div>
                    </div>
                    
                    <p class="text-xs text-zinc-500 mt-4 flex items-center gap-2">
                      <span class="material-symbols-outlined text-xs">info</span>
                      Publica {{ 3 - (dashboardData()?.gamification?.progress_current ?? 0) }} cursos más para obtener 1 crédito adicional.
                    </p>

                    <a routerLink="/credits" class="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors mt-5">
                      <span class="material-symbols-outlined text-[14px]">open_in_new</span>
                      Gastar créditos en otros cursos
                    </a>
                  </div>
                </div>
              </div>

            <!-- Supporting Card: Actividad Reciente -->
            <div class="lg:col-span-5">
              <div class="activity-card">
                <div class="flex items-center justify-between mb-8">
                  <h3 class="text-xl font-bold text-zinc-50">Actividad Reciente</h3>
                  <button class="text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition-colors">Ver todo</button>
                </div>

                <ul class="space-y-4">
                  @for (activity of dashboardData()?.recent_activity; track activity.id) {
                    <li class="flex items-center gap-4 p-4 rounded-xl hover:bg-zinc-800/50 transition-all border border-transparent hover:border-zinc-700 group">
                      <div class="w-11 h-11 rounded-full flex items-center justify-center border transition-transform group-hover:scale-110 border-zinc-700"
                           [ngClass]="getActivityConfig(activity.type).containerClass">
                        <span class="material-symbols-outlined text-lg">{{ getActivityConfig(activity.type).icon }}</span>
                      </div>
                      
                      <div class="flex-1">
                        <p class="text-sm font-medium text-zinc-200">{{ activity.description }}</p>
                        <p class="text-xs text-zinc-500 mt-1 uppercase tracking-wider">{{ activity.created_at | date:'shortTime' }} • {{ activity.created_at | date:'dd MMM' }}</p>
                      </div>

                      <span class="text-xs font-bold px-2 py-1 rounded-md" [ngClass]="getActivityConfig(activity.type).textClass">
                        {{ getActivityConfig(activity.type).badge }}
                      </span>
                    </li>
                  } @empty {
                    <div class="flex flex-col items-center justify-center py-12 text-zinc-600">
                      <span class="material-symbols-outlined text-5xl mb-4">history_toggle_off</span>
                      <p class="text-sm">Aún no tienes actividad registrada.</p>
                    </div>
                   }
                 </ul>
               </div>
             </div>
           </div>

          <!-- Tabla de Progreso de Estudiantes -->
          <div class="lg:col-span-12 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h3 class="text-lg font-bold text-zinc-100">Estudiantes Inscritos</h3>
                <p class="text-xs text-zinc-500 mt-0.5">Progreso de cada estudiante en tus cursos</p>
              </div>
              <span class="text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full">{{ students().length }} inscritos</span>
            </div>

            @if (studentsLoading()) {
              <div class="flex justify-center py-12">
                <div class="w-8 h-8 border-2 border-zinc-700 border-t-cyan-500 rounded-full animate-spin"></div>
              </div>
            } @else if (students().length === 0) {
              <div class="flex flex-col items-center justify-center py-12 text-zinc-600">
                <span class="material-symbols-outlined text-4xl mb-3">group_off</span>
                <p class="text-sm">Aún no hay estudiantes inscritos en tus cursos</p>
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="border-b border-zinc-800">
                      <th class="text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 py-3 px-4">Estudiante</th>
                      <th class="text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 py-3 px-4">Curso</th>
                      <th class="text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 py-3 px-4">Progreso</th>
                      <th class="text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 py-3 px-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-zinc-800">
                    @for (s of students(); track s.student_email + s.course_id) {
                      <tr class="hover:bg-zinc-800/30 transition-colors">
                        <td class="py-3 px-4">
                          <div class="flex flex-col">
                            <span class="text-sm font-medium text-zinc-200">{{ s.student_name }}</span>
                            <span class="text-xs text-zinc-500">{{ s.student_email }}</span>
                          </div>
                        </td>
                        <td class="py-3 px-4">
                          <span class="text-sm text-zinc-300 line-clamp-1">{{ s.course_title }}</span>
                        </td>
                        <td class="py-3 px-4 min-w-[180px]">
                          <div class="flex items-center gap-3">
                            <div class="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                class="h-full rounded-full transition-all duration-500"
                                [class.bg-cyan-500]="s.progress < 100"
                                [class.bg-emerald-500]="s.progress >= 100"
                                [style.width.%]="s.progress"
                              ></div>
                            </div>
                            <span class="text-xs font-bold text-zinc-400 w-10 text-right">{{ s.progress }}%</span>
                          </div>
                        </td>
                        <td class="py-3 px-4">
                          @if (s.progress >= 100) {
                            <span class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                              <span class="material-symbols-outlined text-[12px]">check_circle</span>
                              Completado
                            </span>
                          } @else {
                            <span class="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full">
                              <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block"></span>
                              En Progreso
                            </span>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>
      </div>
     `,
  styles: [`
    :host { display: block; position: relative; }
    .animate-fade-in { animation: fadeIn 0.8s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    
    .metric-card {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 12px;
      padding: 1.25rem;
      transition: all 0.2s ease-in-out;
    }
    .metric-card:hover { border-color: #3f3f46; }
    
    .credit-card {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 24px;
      padding: 2rem;
      position: relative;
      overflow: hidden;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .activity-card {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 24px;
      padding: 1.5rem;
      height: 100%;
    }
    
    ::ng-deep .bg-cyan-500\\/10 { background-color: rgba(6, 182, 212, 0.1); }
    ::ng-deep .bg-emerald-500\\/10 { background-color: rgba(16, 185, 129, 0.1); }
    ::ng-deep .bg-amber-500\\/10 { background-color: rgba(245, 158, 11, 0.1); }
    ::ng-deep .bg-violet-500\\/10 { background-color: rgba(139, 92, 246, 0.1); }
  `]
})
export class InstructorDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  dashboardData = signal<DashboardData | null>(null);
  students = signal<any[]>([]);
  isLoading = signal(true);
  studentsLoading = signal(true);

  progressPercentage = computed(() => {
    const data = this.dashboardData();
    if (!data || !data.gamification) return 0;
    return (data.gamification.progress_current / data.gamification.progress_target) * 100;
  });

  ngOnInit() {
    this.loadStats();
    this.loadStudents();
  }

  loadStats() {
  this.isLoading.set(true);
  this.dashboardService.getInstructorStats().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
    next: (res) => {
      this.dashboardData.set(res.data ?? null);
      this.isLoading.set(false);
    },
    error: () => this.isLoading.set(false)
  });
  }

  loadStudents() {
    this.studentsLoading.set(true);
    this.dashboardService.getStudents().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => {
        if (res.success && res.data) this.students.set(res.data);
        this.studentsLoading.set(false);
      },
      error: () => this.studentsLoading.set(false),
    });
  }

  getActivityConfig(type: string) {
    const configs: Record<string, any> = {
      'course_published': {
        icon: 'publish',
        containerClass: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
        textClass: 'text-cyan-400 bg-cyan-500/5',
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
        containerClass: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
        textClass: 'text-violet-400 bg-violet-500/5',
        badge: 'FACULTY'
      }
    };

    return configs[type] || {
      icon: 'notifications',
      containerClass: 'bg-zinc-500/10 border-zinc-700 text-zinc-400',
      textClass: 'text-zinc-400 bg-zinc-500/5',
      badge: 'INFO'
    };
  }
}
