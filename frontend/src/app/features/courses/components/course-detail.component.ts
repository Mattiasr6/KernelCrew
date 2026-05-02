import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CourseService } from '../../../core/services/course.service';
import { CurriculumService } from '../../../core/services/curriculum.service';
import { Course, CourseSection } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';
import { CourseReviewsComponent } from './course-reviews.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatSnackBarModule,
    CourseReviewsComponent,
  ],
  template: `
    <div class="course-detail-container animate-fade-in">
      @if (loading) {
        <div class="loading">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (course()) {
        <div class="breadcrumb"><a routerLink="/courses" class="text-slate-400 hover:text-white">Cursos</a> <span class="text-slate-600mx-2">/</span> <span class="text-blue-400">{{ course()!.title }}</span></div>

        <div class="course-header glass-card">
          <div class="header-content">
            <div class="flex gap-2 mb-4">
              <span class="badge" [ngClass]="'badge-' + course()!.level">{{ course()!.level | uppercase }}</span>
              <span class="badge badge-category">{{ course()!.category | uppercase }}</span>
            </div>
            
            <h1 class="text-4xl font-bold text-white mb-4">{{ course()!.title }}</h1>
            
            <div class="flex items-center gap-2 mb-6">
                <div class="flex text-yellow-400">
                    <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
                </div>
                <span class="text-white font-bold text-sm">{{ course()!.average_rating || '0.0' }}</span>
                <span class="text-slate-500 text-sm">({{ course()!.reviews_count || 0 }} reseñas)</span>
            </div>

            <p class="text-slate-400 text-lg mb-6 leading-relaxed">{{ course()!.short_description }}</p>

            <div class="meta-info flex gap-6 mb-8 text-slate-300">
              <span class="flex items-center gap-2">
                <span class="material-symbols-outlined text-blue-400">schedule</span>
                {{ course()!.duration_hours || course()!.duration }} horas
              </span>
              <span class="flex items-center gap-2">
                <span class="material-symbols-outlined text-purple-400">person</span>
                {{ course()!.instructor_name || 'Instructor' }}
              </span>
            </div>

            <div class="actions-section">
              @if (!enrolled()) {
                <button class="enroll-btn" (click)="enroll()" [disabled]="isEnrolling()">
                  @if (isEnrolling()) {
                    <mat-spinner diameter="20"></mat-spinner>
                  } @else {
                    <span class="material-symbols-outlined">auto_awesome</span>
                    Inscribirme ahora
                  }
                </button>
              } @else {
                <button class="go-to-course-btn" [routerLink]="['/courses', course()!.id, 'learn']">
                  <span class="material-symbols-outlined">play_circle</span>
                  Ir al Aula Virtual
                </button>
              }
            </div>
          </div>
          
          <div class="header-image relative">
            <img
              class="rounded-2xl shadow-2xl border border-white/10"
              [src]="course()!.thumbnail || 'https://placehold.co/600x400?text=Course'"
              [alt]="course()!.title"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent rounded-2xl"></div>
          </div>
        </div>

        <div class="course-body mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
          <div class="md:col-span-2 space-y-8">
            <section class="glass-card p-8">
              <h2 class="text-2xl font-bold text-white mb-4">Descripción del curso</h2>
              <p class="text-slate-300 leading-loose text-justify">{{ course()!.description }}</p>
            </section>

            <section class="glass-card p-8">
              <h2 class="text-2xl font-bold text-white mb-6">Temario / Syllabus</h2>
              @if (curriculumSections().length === 0) {
                <p class="text-slate-500">Próximamente disponible...</p>
              }
              <div class="space-y-3">
                @for (section of curriculumSections(); track section.id) {
                  <div class="border border-zinc-800 rounded-xl overflow-hidden">
                    <div class="flex items-center gap-3 px-5 py-4 bg-zinc-900/50 cursor-pointer select-none" (click)="toggleCurriculumSection(section.id)">
                      <span class="material-symbols-outlined text-zinc-500 text-sm transition-transform" [class.rotate-90]="!collapsedCurriculum[section.id]">chevron_right</span>
                      <span class="material-symbols-outlined text-cyan-400 text-[20px]">folder</span>
                      <span class="font-semibold text-zinc-200 text-sm flex-1">{{ section.title }}</span>
                      <span class="text-xs text-zinc-500">{{ section.lessons?.length || 0 }} lecciones</span>
                    </div>
                    @if (!collapsedCurriculum[section.id]) {
                      <div class="border-t border-zinc-800">
                        @for (lesson of section.lessons; track lesson.id) {
                          <div class="flex items-center gap-3 px-5 py-3 hover:bg-zinc-800/30 transition-colors">
                            <span class="material-symbols-outlined text-zinc-600 text-[18px]" [class.text-emerald-400]="lesson.is_free">play_circle</span>
                            <span class="text-sm text-zinc-300 flex-1">{{ lesson.title }}</span>
                            @if (lesson.is_free) {
                              <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Gratis</span>
                            }
                            <span class="text-xs text-zinc-600">{{ lesson.duration_minutes }} min</span>
                          </div>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            </section>

            <!-- Sistema de Reseñas (US-23) -->
            <app-course-reviews [courseId]="course()!.id" [enrolled]="enrolled()"></app-course-reviews>
          </div>

          <div class="space-y-6">
            <div class="glass-card p-6">
              <h3 class="font-bold text-white mb-4">Requisitos</h3>
              <ul class="space-y-3 text-slate-400 text-sm">
                <li class="flex gap-2"><span class="material-symbols-outlined text-emerald-400 text-sm">check_circle</span> Conexión a internet</li>
                <li class="flex gap-2"><span class="material-symbols-outlined text-emerald-400 text-sm">check_circle</span> Conocimientos básicos</li>
                <li class="flex gap-2"><span class="material-symbols-outlined text-emerald-400 text-sm">check_circle</span> Ganas de aprender</li>
              </ul>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .course-detail-container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; background: #0f172a; min-height: 100vh; }
      .loading { display: flex; justify-content: center; padding: 100px; }
      .course-header { display: grid; grid-template-columns: 1fr 450px; gap: 40px; padding: 40px; border-radius: 24px; }
      @media (max-width: 992px) { .course-header { grid-template-columns: 1fr; } }
      
      .badge { padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em; }
      .badge-beginner { background: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.2); }
      .badge-category { background: rgba(59, 130, 246, 0.1); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.2); }

      .enroll-btn, .go-to-course-btn {
        display: flex; align-items: center; justify-content: center; gap: 10px;
        padding: 16px 32px; border-radius: 12px; font-weight: 700; border: none; cursor: pointer; transition: all 0.3s;
      }
      .enroll-btn { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3); }
      .enroll-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4); }
      .go-to-course-btn { background: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.2); }
      .go-to-course-btn:hover { background: rgba(16, 185, 129, 0.2); }

      .animate-fade-in { animation: fadeIn 0.5s ease-out; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    `,
  ],
})
export class CourseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courseService = inject(CourseService);
  private curriculumService = inject(CurriculumService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  course = signal<Course | null>(null);
  enrolled = signal(false);
  loading = true;
  isEnrolling = signal(false);
  curriculumSections = signal<CourseSection[]>([]);
  collapsedCurriculum: Record<number, boolean> = {};

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCourse(+id);
      this.loadCurriculum(+id);
      this.checkEnrollment(+id);
    }
  }

  loadCurriculum(courseId: number) {
    this.courseService.getCourse(courseId).subscribe({
      next: () => {
        this.curriculumService.getPublicCurriculum(courseId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (res) => {
              const sections = res.data?.sections || [];
              this.curriculumSections.set(sections);
              sections.forEach(s => { this.collapsedCurriculum[s.id] = false; });
            }
          });
      }
    });
  }

  toggleCurriculumSection(sectionId: number) {
    this.collapsedCurriculum[sectionId] = !this.collapsedCurriculum[sectionId];
  }

  loadCourse(id: number): void {
    this.courseService.getCourse(id).subscribe({
      next: (response) => {
        if (response.data) {
          this.course.set(response.data.course);
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  checkEnrollment(id: number): void {
    if (!this.authService.isAuthenticated()) return;
    this.courseService.getEnrollmentStatus(id).subscribe({
      next: (res) => {
        if (res.data) this.enrolled.set(true);
      }
    });
  }

  enroll(): void {
    if (!this.authService.isAuthenticated()) {
      this.snackBar.open('Inicia sesión para inscribirte', 'OK', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }

    this.isEnrolling.set(true);
    this.courseService.enrollInCourse(this.course()!.id).subscribe({
      next: (res) => {
        this.isEnrolling.set(false);
        this.enrolled.set(true);
        this.snackBar.open(res.message || '¡Genial!', '¡Genial!', { duration: 5000 });
      },
      error: (err) => {
        this.isEnrolling.set(false);
        if (err.status === 403) {
          this.snackBar.open(err.error.message || 'Error de suscripción', 'Ver Planes', { duration: 5000 })
            .onAction().subscribe(() => this.router.navigate(['/subscriptions']));
        } else {
          this.snackBar.open(err.error?.message || 'Error al inscribirse', 'Cerrar');
        }
      }
    });
  }
}
