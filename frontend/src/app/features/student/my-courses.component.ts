import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EnrollmentService, EnrolledCourse } from '../../core/services/enrollment.service';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="px-4 py-6 md:py-12">
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">Mis Cursos</h1>
            <p class="text-zinc-400 mt-1">Continúa aprendiendo donde lo dejaste.</p>
          </div>
          <a routerLink="/courses" mat-stroked-button class="explore-btn">
            <span class="material-symbols-outlined text-[18px]">explore</span>
            Explorar Catálogo
          </a>
        </div>

        @if (isLoading()) {
          <div class="flex justify-center py-24">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        } @else if (courses().length === 0) {
          <div class="border-2 border-dashed border-zinc-800 rounded-xl p-8 md:p-16 text-center">
            <span class="material-symbols-outlined text-6xl text-zinc-700 block mb-4">school</span>
            <h2 class="text-xl font-semibold text-zinc-300 mb-2">No tienes cursos inscritos</h2>
            <p class="text-zinc-500 mb-6">Compra créditos y explora nuestro catálogo para empezar tu primer curso.</p>
            <a routerLink="/credits" mat-flat-button class="primary-btn inline-flex">
              <span class="material-symbols-outlined text-[16px] mr-1">database</span>
              Comprar Créditos
            </a>
          </div>
        } @else {
          <!-- Stats -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div class="stat-card">
              <div class="stat-icon stat-icon-zinc">
                <span class="material-symbols-outlined text-xl">library_books</span>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ stats().total }}</span>
                <span class="stat-label">Total</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon stat-icon-cyan">
                <span class="material-symbols-outlined text-xl">trending_up</span>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ stats().in_progress }}</span>
                <span class="stat-label">En Progreso</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon stat-icon-emerald">
                <span class="material-symbols-outlined text-xl">emoji_events</span>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ stats().completed }}</span>
                <span class="stat-label">Completados</span>
              </div>
            </div>
          </div>

          <!-- Courses Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (course of courses(); track course.id) {
              <div class="course-card">
                <!-- Thumbnail -->
                <div class="relative">
                  <div class="card-thumbnail">
                    @if (course.thumbnail) {
                      <img [src]="course.thumbnail" [alt]="course.title" class="w-full h-full object-cover" />
                    } @else {
                      <div class="w-full h-full bg-zinc-800 flex items-center justify-center">
                        <span class="material-symbols-outlined text-4xl text-zinc-700">code_blocks</span>
                      </div>
                    }
                    <div class="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent"></div>
                  </div>
                  <!-- Level Badge -->
                  <div class="absolute top-3 left-3">
                    <span class="level-badge" [class]="'level-' + course.level">
                      {{ course.level === 'beginner' ? 'Inicial' : course.level === 'intermediate' ? 'Intermedio' : 'Avanzado' }}
                    </span>
                  </div>
                  <!-- Completed Badge -->
                  @if (course.is_completed) {
                    <div class="absolute top-3 right-3">
                      <span class="completed-chip">
                        <span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">verified</span>
                        Completado
                      </span>
                    </div>
                  }
                </div>

                <div class="p-5 flex flex-col flex-1">
                  <!-- Title -->
                  <h3 class="text-lg font-semibold text-zinc-100 mb-2 line-clamp-2">{{ course.title }}</h3>

                  <!-- Instructor + Date -->
                  <div class="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-zinc-500 mb-4">
                    @if (course.instructor) {
                      <span class="flex items-center gap-1">
                        <span class="material-symbols-outlined text-[14px]">person</span>
                        {{ course.instructor.name }}
                      </span>
                    }
                    @if (course.enrollment_date) {
                      <span class="flex items-center gap-1">
                        <span class="material-symbols-outlined text-[14px]">calendar_today</span>
                        {{ course.enrollment_date | date:'dd MMM' }}
                      </span>
                    }
                    @if (course.category) {
                      <span class="flex items-center gap-1 ml-auto">
                        <span class="material-symbols-outlined text-[14px]">category</span>
                        {{ $any(course.category).name ?? course.category }}
                      </span>
                    }
                  </div>

                  <!-- Progress Bar -->
                  <div class="mb-4">
                    <div class="flex justify-between items-center mb-1.5">
                      <span class="text-xs font-medium uppercase tracking-wider text-zinc-500">
                        {{ course.completed_lessons }}/{{ course.total_lessons }} lecciones
                      </span>
                      <span class="text-sm font-bold"
                        [class.text-cyan-400]="!course.is_completed"
                        [class.text-emerald-400]="course.is_completed">
                        {{ course.progress }}%
                      </span>
                    </div>
                    <div class="progress-track">
                      <div
                        class="progress-fill"
                        [style.width.%]="course.progress"
                        [class.progress-cyan]="!course.is_completed"
                        [class.progress-emerald]="course.is_completed"
                      ></div>
                    </div>
                  </div>

                  <!-- Action Button -->
                  <div class="mt-auto">
                    @if (course.is_completed) {
                      <a mat-flat-button [routerLink]="['/my-certificates']" class="cert-btn w-full">
                        <span class="material-symbols-outlined text-[16px] mr-1">workspace_premium</span>
                        Ver Certificado
                      </a>
                    } @else {
                      <a mat-stroked-button [routerLink]="['/courses', course.id, 'learn']" class="continue-btn w-full">
                        <span class="material-symbols-outlined text-[16px] mr-1">play_circle</span>
                        Continuar Aprendiendo
                      </a>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* Buttons */
    .explore-btn {
      color: #06b6d4 !important;
      border-color: rgba(6, 182, 212, 0.3) !important;
      border-radius: 10px !important;
      font-weight: 500 !important;
      padding: 8px 20px !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 8px !important;
    }
    .primary-btn {
      background: linear-gradient(135deg, #06b6d4, #0891b2) !important;
      color: #fff !important;
      border-radius: 10px !important;
      font-weight: 600 !important;
      box-shadow: 0 0 15px rgba(6, 182, 212, 0.2) !important;
    }

    /* Stat Cards */
    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 14px;
      padding: 20px 24px;
    }
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .stat-icon-zinc {
      background: rgba(255, 255, 255, 0.05);
      color: #a1a1aa;
    }
    .stat-icon-cyan {
      background: rgba(6, 182, 212, 0.12);
      color: #06b6d4;
    }
    .stat-icon-emerald {
      background: rgba(16, 185, 129, 0.12);
      color: #10b981;
    }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value {
      font-size: 1.5rem;
      font-weight: 800;
      color: #fafafa;
      line-height: 1.2;
    }
    .stat-label {
      font-size: 0.8rem;
      color: #a1a1aa;
    }

    /* Course Cards */
    .course-card {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 14px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
    }
    .course-card:hover {
      transform: translateY(-4px);
      border-color: #06b6d4;
      box-shadow: 0 0 25px rgba(6, 182, 212, 0.15);
    }
    .card-thumbnail {
      width: 100%;
      height: 160px;
      overflow: hidden;
    }

    /* Badges */
    .level-badge {
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .level-beginner {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.25);
    }
    .level-intermediate {
      background: rgba(6, 182, 212, 0.15);
      color: #06b6d4;
      border: 1px solid rgba(6, 182, 212, 0.25);
    }
    .level-advanced {
      background: rgba(139, 92, 246, 0.15);
      color: #8b5cf6;
      border: 1px solid rgba(139, 92, 246, 0.25);
    }
    .completed-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 0.7rem;
      font-weight: 700;
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.25);
    }

    /* Progress Bar */
    .progress-track {
      width: 100%;
      background: #27272a;
      border-radius: 9999px;
      height: 8px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      border-radius: 9999px;
      transition: width 0.6s ease-out;
    }
    .progress-cyan {
      background: linear-gradient(90deg, #06b6d4, #0891b2);
    }
    .progress-emerald {
      background: linear-gradient(90deg, #10b981, #059669);
    }

    /* Action Buttons */
    .continue-btn {
      color: #06b6d4 !important;
      border-color: rgba(6, 182, 212, 0.25) !important;
      border-radius: 10px !important;
      font-weight: 600 !important;
      padding: 10px 20px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 6px !important;
      transition: all 0.2s ease !important;
    }
    .continue-btn:hover {
      background: rgba(6, 182, 212, 0.08) !important;
      border-color: #06b6d4 !important;
    }
    .cert-btn {
      background: rgba(16, 185, 129, 0.15) !important;
      color: #10b981 !important;
      border: 1px solid rgba(16, 185, 129, 0.2) !important;
      border-radius: 10px !important;
      font-weight: 600 !important;
      padding: 10px 20px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 6px !important;
      box-shadow: 0 0 15px rgba(16, 185, 129, 0.12) !important;
      transition: all 0.2s ease !important;
    }
    .cert-btn:hover {
      background: #10b981 !important;
      color: #fff !important;
      box-shadow: 0 0 25px rgba(16, 185, 129, 0.3) !important;
    }

    /* Utility */
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    ::ng-deep .mat-mdc-progress-spinner circle {
      stroke: #06b6d4 !important;
    }
  `],
})
export class MyCoursesComponent implements OnInit {
  private enrollmentService = inject(EnrollmentService);
  private destroyRef = inject(DestroyRef);

  courses = signal<EnrolledCourse[]>([]);
  stats = signal({ total: 0, completed: 0, in_progress: 0 });
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadMyCourses();
  }

  loadMyCourses(): void {
    this.enrollmentService.getMyCourses().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.courses.set(response.data ?? []);
          this.stats.set(response.stats ?? { total: 0, completed: 0, in_progress: 0 });
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }
}
