import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EnrollmentService, EnrolledCourse } from '../../core/services/enrollment.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="min-h-screen bg-zinc-950 px-4 py-8">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-bold tracking-tight text-zinc-50">Mis Cursos</h1>
            <p class="text-zinc-400 mt-1">Continúa desde donde lo dejaste</p>
          </div>
          <a routerLink="/courses" class="btn-primary">
            <mat-icon>explore</mat-icon>
            Explorar más cursos
          </a>
        </div>

        @if (isLoading()) {
          <div class="flex justify-center py-20">
            <mat-spinner diameter="50"></mat-spinner>
          </div>
        } @else if (courses().length === 0) {
          <div class="border-2 border-dashed border-zinc-800 rounded-xl p-12 text-center">
            <mat-icon class="text-6xl text-zinc-600">school</mat-icon>
            <h2 class="text-xl font-semibold text-zinc-50 mt-4">No tienes cursos inscritos</h2>
            <p class="text-zinc-400 mt-2">Explora nuestro catálogo y encuentra tu próximo curso</p>
            <a routerLink="/courses" mat-flat-button class="btn-primary mt-4">
              Ver Cursos Disponibles
            </a>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div class="stat-card">
              <div class="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <mat-icon class="text-cyan-400">library_books</mat-icon>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ stats().total }}</span>
                <span class="stat-label">Total</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <mat-icon class="text-cyan-400">trending_up</mat-icon>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ stats().in_progress }}</span>
                <span class="stat-label">En Progreso</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <mat-icon class="text-emerald-400">emoji_events</mat-icon>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ stats().completed }}</span>
                <span class="stat-label">Completados</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (course of courses(); track course.id) {
              <div class="course-card">
                <div class="flex items-center justify-between p-4 bg-zinc-900/50 border-b border-zinc-800">
                  <span class="level-badge" [class]="'badge-' + course.level">{{ course.level }}</span>
                  @if (course.is_completed) {
                    <span class="completed-badge">
                      <mat-icon class="text-emerald-400">verified</mat-icon>
                      <span class="text-emerald-400">Completado</span>
                    </span>
                  }
                </div>

                <div class="p-5">
                  <h3 class="text-lg font-medium text-zinc-100 mb-2 line-clamp-2">{{ course.title }}</h3>
                  <p class="text-sm text-zinc-400 line-clamp-2 mb-4">{{ course.description }}</p>
                  
                  <div class="flex items-center gap-2 mb-4">
                    <span class="text-xs text-zinc-500">Instructor:</span>
                    <span class="text-sm text-zinc-300 font-medium">{{ course.instructor.name }}</span>
                  </div>

                  <div class="mb-4">
                    <div class="flex justify-between items-center mb-2">
                      <span class="text-xs font-medium uppercase tracking-wider text-zinc-500">Progreso</span>
                      <span class="text-sm font-bold" [class]="course.progress === 100 ? 'text-emerald-400' : 'text-cyan-400'">{{ course.progress }}%</span>
                    </div>
                    <div class="progress-track">
                      <div 
                        class="progress-fill" 
                        [style.width.%]="course.progress"
                        [class.completed]="course.progress === 100"
                      ></div>
                    </div>
                  </div>

                  <div class="text-xs text-zinc-500">
                    @if (course.completed_at) {
                      Completado el {{ course.completed_at | date:'dd MMM yyyy' }}
                    } @else {
                      Inscrito el {{ course.enrollment_date | date:'dd MMM yyyy' }}
                    }
                  </div>
                </div>

                <div class="p-4 pt-0">
                  @if (course.is_completed) {
                    <a mat-flat-button color="accent" [routerLink]="['/courses', course.id]" class="w-full cert-btn">
                      <mat-icon>workspace_premium</mat-icon>
                      Ver Certificado
                    </a>
                  } @else {
                    <a mat-flat-button class="w-full continue-btn" [routerLink]="['/courses', course.id]">
                      <mat-icon>play_circle</mat-icon>
                      Continuar
                    </a>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .btn-primary {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #06b6d4, #8b5cf6);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease-in-out;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 20px rgba(6, 182, 212, 0.3); }
    
    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: #18181b;
      padding: 1.25rem;
      border-radius: 12px;
      border: 1px solid #27272a;
    }
    
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: #fafafa; }
    .stat-label { font-size: 0.875rem; color: #a1a1aa; }
    
    .course-card {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s ease-in-out;
    }
    .course-card:hover { transform: translateY(-4px); border-color: #06b6d4; box-shadow: 0 0 20px rgba(6, 182, 212, 0.15); }
    
    .level-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-beginner { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
    .badge-intermediate { background: rgba(6, 182, 212, 0.15); color: #06b6d4; border: 1px solid rgba(6, 182, 212, 0.2); }
    .badge-advanced { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; border: 1px solid rgba(139, 92, 246, 0.2); }
    
    .completed-badge {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    .progress-track {
      width: 100%;
      background: #27272a;
      border-radius: 9999px;
      height: 6px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #06b6d4, #8b5cf6);
      border-radius: 9999px;
      transition: width 0.5s ease-out;
    }
    .progress-fill.completed { background: linear-gradient(90deg, #10b981, #059669); }
    
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .continue-btn {
      background: rgba(6, 182, 212, 0.15) !important;
      color: #06b6d4 !important;
      border: 1px solid rgba(6, 182, 212, 0.2) !important;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    .continue-btn:hover {
      background: rgba(6, 182, 212, 0.25) !important;
    }
    
    .cert-btn {
      background: rgba(16, 185, 129, 0.15) !important;
      color: #10b981 !important;
      border: 1px solid rgba(16, 185, 129, 0.2) !important;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    .cert-btn:hover {
      background: rgba(16, 185, 129, 0.25) !important;
    }
    
    ::ng-deep .mat-mdc-progress-bar {
      --mdc-linear-progress-active-indicator-color: #06b6d4;
      --mdc-linear-progress-track-color: #27272a;
    }
  `],
})
export class MyCoursesComponent implements OnInit {
  private enrollmentService = inject(EnrollmentService);
  private authService = inject(AuthService);

  courses = signal<EnrolledCourse[]>([]);
  stats = signal({ total: 0, completed: 0, in_progress: 0 });
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadMyCourses();
  }

  loadMyCourses(): void {
    this.enrollmentService.getMyCourses().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.courses.set(response.data.data);
          this.stats.set(response.data.stats);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }
}