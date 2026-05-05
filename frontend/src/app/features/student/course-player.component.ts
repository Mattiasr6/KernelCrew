import { Component, inject, signal, computed, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CourseService } from '../../core/services/course.service';
import { CurriculumService } from '../../core/services/curriculum.service';
import { EnrollmentService } from '../../core/services/enrollment.service';
import { CertificateService } from '../../core/services/certificate.service';
import { NotificationService } from '../../core/services/notification.service';
import { Course, CourseSection, Lesson } from '../../core/models';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-course-player',
  standalone: true,
  imports: [CommonModule, RouterLink, MatProgressSpinnerModule, MatSnackBarModule],
  template: `
    <div class="player-container animate-fade-in">
      @if (loading()) {
        <div class="loading">
          <mat-spinner diameter="50"></mat-spinner>
        </div>
      } @else if (course(); as c) {
        <!-- Navigation Header -->
        <header class="player-header">
          <button class="back-btn" [routerLink]="['/courses', c.id]">
            <span class="material-symbols-outlined">arrow_back</span>
            <span class="hidden sm:inline">Volver</span>
          </button>
          <h1 class="text-base sm:text-lg font-bold text-white truncate mx-4">{{ c.title }}</h1>
          <a routerLink="/my-courses" class="text-xs text-zinc-500 hover:text-zinc-300 shrink-0">Mis Cursos</a>
        </header>

        <div class="content-grid">
          <!-- LEFT: Main Content Area -->
          <main class="main-content">
            @if (selectedLesson(); as lesson) {
              <!-- Video Player -->
              @if (lesson.video_url) {
                <div class="video-container">
                  <iframe
                    [src]="sanitizeVideoUrl(lesson.video_url)"
                    class="w-full h-full"
                    frameborder="0"
                    allowfullscreen
                    allow="autoplay; fullscreen"
                  ></iframe>
                </div>
              } @else {
                <div class="video-container bg-zinc-900 flex items-center justify-center">
                  <span class="material-symbols-outlined text-6xl text-zinc-700">play_circle</span>
                </div>
              }

              <!-- Lesson Content -->
              <div class="lesson-body">
                <h2 class="text-2xl font-bold text-zinc-100 mb-4">{{ lesson.title }}</h2>
                @if (lesson.content) {
                  <div class="text-zinc-300 leading-relaxed whitespace-pre-line">{{ lesson.content }}</div>
                }
              </div>

              <!-- Actions Bar -->
              <div class="actions-bar">
                <div class="flex items-center gap-4">
                  <span class="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                    Progreso: {{ progressPct() }}%
                  </span>
                  <div class="h-1.5 w-32 bg-zinc-800 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-500"
                      [ngClass]="progressPct() >= 100 ? 'bg-emerald-500' : 'bg-cyan-500'"
                      [style.width.%]="progressPct()">
                    </div>
                  </div>
                </div>

                @if (progressPct() < 100) {
                  <button
                    class="complete-btn"
                    [class.completed]="isLessonCompleted(lesson.id)"
                    (click)="markLessonComplete(lesson)"
                    [disabled]="isLessonCompleted(lesson.id) || isCompleting()"
                  >
                    @if (isCompleting()) {
                      <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Guardando...</span>
                    } @else if (isLessonCompleted(lesson.id)) {
                      <span class="material-symbols-outlined text-[18px]">check_circle</span>
                      <span>Completada</span>
                    } @else {
                      <span class="material-symbols-outlined text-[18px]">done</span>
                      <span>Marcar como Completada</span>
                    }
                  </button>
                }
              </div>
            } @else {
              <div class="flex flex-col items-center justify-center h-full text-zinc-600 gap-4">
                <span class="material-symbols-outlined text-7xl">touch_app</span>
                <p class="text-lg">Selecciona una lección del temario</p>
              </div>
            }
          </main>

          <!-- RIGHT: Sidebar Curriculum -->
          <aside class="sidebar">
            <div class="sidebar-header">
              <h3 class="text-sm font-bold text-zinc-100 uppercase tracking-wider">Contenido</h3>
              <span class="text-xs text-zinc-500">{{ progressPct() }}%</span>
            </div>

            <div class="sidebar-body">
              @for (section of sections(); track section.id; let sIdx = $index) {
                <div class="section-group">
                  <button
                    class="section-header"
                    (click)="toggleSection($index)"
                  >
                    <span class="flex items-center gap-2 min-w-0">
                      <span class="material-symbols-outlined text-zinc-500 text-lg shrink-0 transition-transform"
                        [class.rotate-90]="expandedSections()[sIdx]">
                        chevron_right
                      </span>
                      <span class="text-xs font-semibold text-zinc-300 truncate">{{ section.title }}</span>
                    </span>
                    <span class="text-[11px] text-zinc-600 shrink-0">
                      {{ completedCountInSection(section) }}/{{ section.lessons?.length || 0 }}
                    </span>
                  </button>

                  @if (expandedSections()[sIdx]) {
                    <div class="lessons-list">
                      @for (lesson of section.lessons; track lesson.id) {
                        <button
                          class="lesson-item"
                          [class.active]="selectedLesson()?.id === lesson.id"
                          [class.completed]="isLessonCompleted(lesson.id)"
                          (click)="selectLesson(lesson)"
                        >
                          <span class="material-symbols-outlined text-lg shrink-0"
                            [class.text-emerald-400]="isLessonCompleted(lesson.id)"
                            [class.text-zinc-600]="!isLessonCompleted(lesson.id)">
                            {{ isLessonCompleted(lesson.id) ? 'check_circle' : 'radio_button_unchecked' }}
                          </span>
                          <span class="text-sm truncate flex-1 text-left"
                            [ngClass]="selectedLesson()?.id === lesson.id ? 'text-zinc-100 font-medium' : 'text-zinc-400'">
                            {{ lesson.title }}
                          </span>
                          <span class="text-[11px] text-zinc-600 shrink-0">{{ lesson.duration_minutes }}m</span>
                        </button>
                      }
                    </div>
                  }
                </div>
              }
              @if (sections().length === 0) {
                <div class="p-6 text-center text-zinc-500 text-sm">Sin contenido</div>
              }
            </div>
          </aside>
        </div>

        <!-- Success Modal (Climax) -->
        @if (showCertificateModal()) {
          <div class="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6" (click)="showCertificateModal.set(false)">
            <div class="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center shadow-2xl animate-fade-in" (click)="$event.stopPropagation()">
              <div class="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-500/30">
                <span class="material-symbols-outlined text-white text-4xl fill-icon">workspace_premium</span>
              </div>
              <h2 class="text-3xl font-bold text-white mb-2">¡Felicidades!</h2>
              <p class="text-zinc-400 mb-2">Has completado todos los módulos del curso.</p>
              <p class="text-zinc-500 text-sm mb-8">Tu certificado está listo para descargar.</p>
              <div class="flex flex-col gap-3">
                <button class="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold text-lg shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-3" (click)="downloadCertificate()">
                  <span class="material-symbols-outlined">download</span>
                  Descargar Certificado
                </button>
                <button class="text-zinc-500 hover:text-zinc-300 text-sm transition-colors" routerLink="/courses">Explorar más cursos</button>
              </div>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .player-container { @apply min-h-screen flex flex-col bg-zinc-950; }
    .loading { @apply flex items-center justify-center h-screen; }

    .player-header {
      @apply h-[60px] flex items-center gap-2 px-4 sticky top-0 z-40;
      background: rgba(9, 9, 11, 0.95);
      border-bottom: 1px solid theme('colors.zinc.800');
    }
    .back-btn { @apply flex items-center gap-1.5 bg-transparent border-none text-zinc-400 cursor-pointer text-sm px-2.5 py-1.5 rounded-lg transition-all; }
    .back-btn:hover { @apply text-zinc-50; background: rgba(255,255,255,0.05); }

    .content-grid { @apply grid overflow-hidden; grid-template-columns: 1fr 360px; height: calc(100vh - 60px); }
    @media (max-width: 1024px) { .content-grid { grid-template-columns: 1fr; } }

    .main-content { @apply overflow-y-auto flex flex-col; }
    .video-container { @apply relative w-full; aspect-ratio: 16 / 9; background: #000; }
    .video-container iframe { @apply absolute inset-0 w-full h-full; }
    .lesson-body { @apply px-10 py-8 flex-1; }
    .actions-bar { @apply flex items-center justify-between gap-4 px-10 py-5 sticky bottom-0 border-t; border-color: theme('colors.zinc.800'); background: rgba(24,24,27,0.6); backdrop-filter: blur(8px); }
    @media (max-width: 640px) { .actions-bar { @apply flex-col; } }

    .complete-btn { @apply flex items-center gap-2 px-6 py-3 rounded-xl border-none font-semibold text-sm cursor-pointer transition-all bg-cyan-500 text-white; }
    .complete-btn:hover:not(:disabled) { @apply bg-cyan-600 -translate-y-0.5; }
    .complete-btn.completed { background: rgba(16,185,129,0.15); @apply text-emerald-400 cursor-default; }
    .complete-btn:disabled { @apply opacity-50 cursor-not-allowed; }

    .sidebar { @apply border-l overflow-hidden; border-color: theme('colors.zinc.800'); background: theme('colors.zinc.950'); }
    .sidebar-header { @apply flex items-center justify-between px-[18px] py-4 border-b; border-color: theme('colors.zinc.800'); background: rgba(24,24,27,0.4); }
    .sidebar-body { @apply flex-1 overflow-y-auto py-2; }

    .section-group { border-bottom: 1px solid rgba(39,39,42,0.4); }
    .section-header { @apply flex items-center justify-between w-full px-[18px] py-3 bg-transparent border-none cursor-pointer transition-all text-left; }
    .section-header:hover { background: rgba(255,255,255,0.02); }
    .rotate-90 { transform: rotate(90deg); }
    .lessons-list { @apply pb-2; }

    .lesson-item { @apply flex items-center gap-2.5 w-full py-2.5 pl-9 pr-[18px] bg-transparent border-none cursor-pointer transition-all text-left; }
    .lesson-item:hover { background: rgba(255,255,255,0.02); }
    .lesson-item.active { background: rgba(6,182,212,0.06); border-right: 3px solid theme('colors.cyan.500'); }

    .fill-icon { font-variation-settings: 'FILL' 1; }
  `]
})
export class CoursePlayerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courseService = inject(CourseService);
  private curriculumService = inject(CurriculumService);
  private enrollmentService = inject(EnrollmentService);
  private certService = inject(CertificateService);
  private notification = inject(NotificationService);
  private snackBar = inject(MatSnackBar);
  private sanitizer = inject(DomSanitizer);
  private destroyRef = inject(DestroyRef);

  course = signal<Course | null>(null);
  sections = signal<CourseSection[]>([]);
  selectedLesson = signal<Lesson | null>(null);
  completedLessonIds = signal<number[]>([]);
  progressPct = signal(0);
  loading = signal(true);
  isCompleting = signal(false);
  showCertificateModal = signal(false);
  lastLessonId: number | null = null;
  expandedSections = signal<boolean[]>([]);

  courseId = 0;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.courseId = id;
      this.loadCourse(id);
      this.loadCurriculum(id);
      this.loadProgress(id);
    }
  }

  loadCourse(id: number) {
    this.courseService.getCourse(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        if (res.data) this.course.set(res.data.course);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('No se pudo cargar el curso. Intenta de nuevo.', 'Cerrar', { duration: 5000 });
      }
    });
  }

  loadCurriculum(courseId: number) {
    this.curriculumService.getPublicCurriculum(courseId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const secs = res.data?.sections || [];
          this.sections.set(secs);
          this.expandedSections.set(secs.map(() => true));
        }
      });
  }

  loadProgress(courseId: number) {
    this.enrollmentService.getMyProgress(courseId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.progressPct.set(res.data.progress);
            this.completedLessonIds.set(res.data.completed_lesson_ids || []);
            this.lastLessonId = res.data.last_lesson_id;
          }
          this.loading.set(false);

          // Auto-select first uncompleted lesson or last watched
          const allLessons = this.getAllLessons();
          if (allLessons.length > 0) {
            const target = this.lastLessonId
              ? allLessons.find(l => l.id === this.lastLessonId)
              : allLessons.find(l => !this.isLessonCompleted(l.id));
            this.selectedLesson.set(target || allLessons[0]);
          }
        },
        error: () => {
          this.loading.set(false);
          this.snackBar.open('No estás inscrito en este curso', 'OK', { duration: 5000 });
          this.router.navigate(['/courses', courseId]);
        }
      });
  }

  getAllLessons(): Lesson[] {
    return this.sections().flatMap(s => s.lessons || []);
  }

  isLessonCompleted(lessonId: number): boolean {
    return this.completedLessonIds().includes(lessonId);
  }

  completedCountInSection(section: CourseSection): number {
    return (section.lessons || []).filter(l => this.isLessonCompleted(l.id)).length;
  }

  toggleSection(index: number) {
    const current = [...this.expandedSections()];
    current[index] = !current[index];
    this.expandedSections.set(current);
  }

  selectLesson(lesson: Lesson) {
    this.selectedLesson.set(lesson);
    // Auto-expand parent section
    const idx = this.sections().findIndex(s => s.lessons?.some(l => l.id === lesson.id));
    if (idx >= 0) {
      const ex = [...this.expandedSections()];
      ex[idx] = true;
      this.expandedSections.set(ex);
    }
  }

  markLessonComplete(lesson: Lesson) {
    if (this.isLessonCompleted(lesson.id) || this.isCompleting()) return;

    this.isCompleting.set(true);
    this.enrollmentService.completeLesson(lesson.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isCompleting.set(false);
          if (res.success && res.data) {
            const newIds = [...this.completedLessonIds(), lesson.id];
            this.completedLessonIds.set(newIds);
            this.progressPct.set(res.data.progress);

            if (res.data.certificate_ready) {
              this.showCertificateModal.set(true);
            }
          }
        },
        error: () => {
          this.isCompleting.set(false);
          this.snackBar.open('Error al guardar el progreso', 'Cerrar');
        }
      });
  }

  sanitizeVideoUrl(url: string): SafeResourceUrl {
    if (!url) return '';
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    const src = match ? `https://www.youtube.com/embed/${match[1]}` : url;
    return this.sanitizer.bypassSecurityTrustResourceUrl(src);
  }

  downloadCertificate() {
    this.certService.getMyCertificates()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const cert = res.data?.find(c => c.course_id === this.courseId);
          if (cert) {
            this.certService.downloadPdf(cert.certificate_code)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: (blob) => {
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Certificado_${cert.certificate_code}.pdf`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                }
              });
          } else {
            this.snackBar.open('Certificado no encontrado', 'Cerrar');
          }
        }
      });
  }
}
