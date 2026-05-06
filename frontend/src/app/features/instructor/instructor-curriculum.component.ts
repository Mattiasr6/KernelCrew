import { Component, inject, signal, computed, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurriculumService } from '../../core/services/curriculum.service';
import { CourseService } from '../../core/services/course.service';
import { CourseSection, Lesson } from '../../core/models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LessonEditorComponent } from './lesson-editor.component';

@Component({
  selector: 'app-instructor-curriculum',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LessonEditorComponent],
  template: `
    <div class="animate-fade-in">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <a routerLink="/instructor/courses" class="text-zinc-400 hover:text-zinc-200 text-sm flex items-center gap-1 mb-2 transition-colors">
            <span class="material-symbols-outlined text-[16px]">arrow_back</span>
            Volver a cursos
          </a>
          <h1 class="text-3xl font-bold tracking-tight text-zinc-50">Curriculum Builder</h1>
          <p class="text-zinc-400 mt-1">Estructura las secciones y lecciones de tu curso.</p>
          @if (courseStatus(); as status) {
            <div class="mt-3 flex items-center gap-2">
              <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                [ngClass]="{
                  'bg-zinc-800 text-zinc-400': status === 'DRAFT',
                  'bg-amber-500/10 text-amber-400': status === 'IN_REVIEW',
                  'bg-emerald-500/10 text-emerald-400': status === 'PUBLISHED',
                  'bg-rose-500/10 text-rose-400': status === 'REJECTED'
                }">
                <span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">
                  {{ status === 'DRAFT' ? 'edit_note' : status === 'IN_REVIEW' ? 'hourglass_top' : status === 'PUBLISHED' ? 'check_circle' : 'block' }}
                </span>
                {{ status === 'DRAFT' ? 'Borrador' : status === 'IN_REVIEW' ? 'En Revisión' : status === 'PUBLISHED' ? 'Publicado' : 'Rechazado' }}
              </span>
            </div>
          }
        </div>
        @if (courseStatus() === 'DRAFT' || courseStatus() === 'REJECTED') {
          <button class="add-section-btn" (click)="addSection()">
            <span class="material-symbols-outlined text-[18px]">add</span>
            Nueva Sección
          </button>
        }
      </div>

      @if (isReadonly()) {
        <div class="mb-6 px-5 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
          <span class="material-symbols-outlined text-amber-400">info</span>
          <span class="text-sm text-amber-300">
            @if (courseStatus() === 'IN_REVIEW') { Este curso está en revisión. No puedes modificar su contenido hasta que un administrador lo apruebe. }
            @else if (courseStatus() === 'PUBLISHED') { Este curso está publicado. Para modificarlo, crea una nueva versión. }
            @else if (courseStatus() === 'REJECTED') { Este curso fue rechazado. Puedes editarlo y enviarlo a revisión nuevamente. }
          </span>
        </div>
      }

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="flex items-center justify-center py-24">
          <div class="w-10 h-10 border-2 border-zinc-700 border-t-cyan-500 rounded-full animate-spin"></div>
        </div>
      }

      <!-- Empty State -->
      @if (!isLoading() && sections().length === 0) {
        <div class="border-2 border-dashed border-zinc-800 rounded-xl p-16 text-center">
          <span class="material-symbols-outlined text-6xl text-zinc-700 mb-4 block">account_tree</span>
          <h3 class="text-xl font-semibold text-zinc-300 mb-2">Aún no hay secciones</h3>
          <p class="text-zinc-500 mb-6">Organiza tu curso en módulos. Cada sección puede contener varias lecciones.</p>
          <button class="add-section-btn" (click)="addSection()">
            <span class="material-symbols-outlined text-[18px]">add</span>
            Crear primera sección
          </button>
        </div>
      }

      <!-- Sections Tree -->
      @if (!isLoading() && sections().length > 0) {
        <div class="space-y-4">
          @for (section of sections(); track section.id; let i = $index) {
            <div class="section-card">
              <!-- Section Header -->
              <div class="section-header" (click)="toggleSection(i)">
                <div class="flex items-center gap-3 flex-1">
                  <span class="material-symbols-outlined text-zinc-500 transition-transform" [class.rotate-90]="!collapsedSections()[i]">
                    chevron_right
                  </span>
                  <span class="material-symbols-outlined text-cyan-400">folder</span>
                  <div>
                    <span class="font-semibold text-zinc-100">{{ section.title }}</span>
                    <span class="text-xs text-zinc-500 ml-3">{{ section.lessons?.length || 0 }} lecciones</span>
                  </div>
                </div>
                <div class="flex items-center gap-2" (click)="$event.stopPropagation()">
                  @if (!isReadonly()) {
                    <button class="icon-btn-ghost" (click)="editSection(section)" title="Editar sección">
                      <span class="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button class="icon-btn-ghost text-rose-400 hover:bg-rose-500/10" (click)="confirmDeleteSection(section)" title="Eliminar sección">
                      <span class="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  }
                </div>
              </div>

              <!-- Lessons List (collapsible) -->
              @if (!collapsedSections()[i]) {
                <div class="lessons-list">
                  @if (section.lessons && section.lessons.length > 0) {
                    @for (lesson of section.lessons; track lesson.id) {
                      <div class="lesson-item">
                        <div class="flex items-center gap-3 flex-1">
                          <span class="material-symbols-outlined text-zinc-600 text-[20px]" [class.text-emerald-400]="lesson.is_free" [class.text-zinc-600]="!lesson.is_free">
                            {{ lesson.video_url ? 'play_circle' : 'article' }}
                          </span>
                          <span class="text-sm text-zinc-300">{{ lesson.title }}</span>
                          @if (lesson.is_free) {
                            <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Preview</span>
                          }
                          <span class="text-xs text-zinc-600">{{ lesson.duration_minutes }} min</span>
                        </div>
                        <div class="flex items-center gap-1">
                          @if (!isReadonly()) {
                            <button class="icon-btn-ghost text-xs" (click)="editLesson(lesson)" title="Editar lección">
                              <span class="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button class="icon-btn-ghost text-rose-400 hover:bg-rose-500/10" (click)="confirmDeleteLesson(lesson)" title="Eliminar lección">
                              <span class="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          }
                        </div>
                      </div>
                    }
                  }

                  @if (!isReadonly()) {
                    <button class="add-lesson-btn" (click)="addLesson(section.id)">
                      <span class="material-symbols-outlined text-[16px]">add</span>
                      Añadir Lección
                    </button>
                  }
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Inline Editor for New/Edit Section -->
      @if (showSectionForm()) {
        <div class="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-50 flex items-center justify-center" (click)="cancelSectionForm()">
          <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl" (click)="$event.stopPropagation()">
            <h3 class="text-lg font-bold text-zinc-100 mb-4">{{ editingSection() ? 'Editar Sección' : 'Nueva Sección' }}</h3>
            <input
              [(ngModel)]="sectionFormTitle"
              placeholder="Título de la sección (ej: Módulo 1: Introducción)"
              class="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-4 py-3 outline-none focus:border-cyan-500 transition-colors mb-4 placeholder-zinc-500"
              (keyup.enter)="saveSection()"
            />
            <div class="flex justify-end gap-3">
              <button class="px-4 py-2 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors" (click)="cancelSectionForm()">Cancelar</button>
              <button class="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors" (click)="saveSection()">
                {{ editingSection() ? 'Guardar' : 'Crear' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Lesson Editor Modal -->
      @if (editingLesson() || newLessonSectionId()) {
        <app-lesson-editor
          [lesson]="editingLesson()"
          (save)="onLessonSave($event)"
          (close)="onLessonEditorClose()"
        ></app-lesson-editor>
      }

      <!-- Delete Confirmation -->
      @if (deleteTarget()) {
        <div class="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-50 flex items-center justify-center" (click)="cancelDelete()">
          <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl" (click)="$event.stopPropagation()">
            <span class="material-symbols-outlined text-rose-400 text-4xl block mb-4">warning</span>
            <h3 class="text-lg font-bold text-zinc-100 mb-2">¿Eliminar {{ deleteTarget()!.type }}?</h3>
            <p class="text-zinc-400 text-sm mb-6">Esta acción no se puede deshacer. {{ deleteTarget()!.type === 'sección' ? 'Todas sus lecciones también serán eliminadas.' : '' }}</p>
            <div class="flex justify-end gap-3">
              <button class="px-4 py-2 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors" (click)="cancelDelete()">Cancelar</button>
              <button class="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium transition-colors" (click)="confirmDelete()">Eliminar</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; padding: 24px; max-width: 1000px; margin: 0 auto; }
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .add-section-btn {
      @apply flex items-center gap-1.5 px-5 py-2.5 rounded-xl border-none font-semibold text-sm text-white cursor-pointer transition-all;
      background: linear-gradient(135deg, theme('colors.cyan.500'), theme('colors.cyan.600'));
    }
    .add-section-btn:hover { @apply -translate-y-0.5; box-shadow: 0 4px 15px rgba(6,182,212,0.3); }

    .section-card { @apply bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden transition-colors; }
    .section-card:hover { @apply border-zinc-700; }

    .section-header { @apply flex items-center gap-2 px-[18px] py-3.5 cursor-pointer select-none transition-colors; }
    .section-header:hover { background: rgba(255,255,255,0.02); }
    .rotate-90 { transform: rotate(90deg); }

    .lessons-list { @apply border-t pt-2 pb-2 pr-3 pl-12; border-color: theme('colors.zinc.800'); }

    .lesson-item { @apply flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors; }
    .lesson-item:hover { background: rgba(255,255,255,0.03); }

    .add-lesson-btn {
      @apply flex items-center justify-center gap-1 w-full px-3 py-1.5 mt-1 rounded-lg border border-dashed text-zinc-400 text-xs font-medium bg-transparent cursor-pointer transition-all;
      border-color: theme('colors.zinc.700');
    }
    .add-lesson-btn:hover { @apply border-cyan-500 text-cyan-500; background: rgba(6,182,212,0.05); }

    .icon-btn-ghost {
      @apply flex items-center justify-center w-8 h-8 rounded-lg bg-transparent border-none text-zinc-400 cursor-pointer transition-colors;
    }
    .icon-btn-ghost:hover { background: rgba(255,255,255,0.05); @apply text-zinc-50; }
  `]
})
export class InstructorCurriculumComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private curriculumService = inject(CurriculumService);
  private courseService = inject(CourseService);
  private destroyRef = inject(DestroyRef);

  courseId = signal<number>(0);
  sections = signal<CourseSection[]>([]);
  courseStatus = signal<string | null>(null);
  isReadonly = computed(() => {
    const status = this.courseStatus();
    return status === 'IN_REVIEW' || status === 'PUBLISHED';
  });
  isLoading = signal(true);
  collapsedSections = signal<boolean[]>([]);

  // Section form state
  showSectionForm = signal(false);
  editingSection = signal<CourseSection | null>(null);
  sectionFormTitle = '';
  sectionFormId: number | null = null;

  // Lesson editing state
  editingLesson = signal<Lesson | null>(null);
  newLessonSectionId = signal<number | null>(null);

  // Delete confirmation
  deleteTarget = signal<{ type: 'sección' | 'lección'; id: number } | null>(null);

  ngOnInit() {
    const id = Number(
      this.route.snapshot.paramMap.get('id') ??
      this.route.snapshot.paramMap.get('courseId') ??
      this.route.parent?.snapshot.paramMap.get('courseId')
    );
    if (id) {
      this.courseId.set(id);
      this.loadCurriculum();
      this.loadCourseStatus();
    }
  }

  loadCourseStatus() {
    this.courseService.getCourse(this.courseId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.data) {
            this.courseStatus.set(res.data.status);
          }
        }
      });
  }

  loadCurriculum() {
    this.isLoading.set(true);
    this.curriculumService.getCurriculum(this.courseId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const sectionsData = res.data?.sections || [];
          this.sections.set(sectionsData);
          this.collapsedSections.set(sectionsData.map(() => false));
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
  }

  toggleSection(index: number) {
    const current = [...this.collapsedSections()];
    current[index] = !current[index];
    this.collapsedSections.set(current);
  }

  addSection() {
    this.editingSection.set(null);
    this.sectionFormTitle = '';
    this.showSectionForm.set(true);
  }

  editSection(section: CourseSection) {
    this.editingSection.set(section);
    this.sectionFormTitle = section.title;
    this.showSectionForm.set(true);
  }

  saveSection() {
    if (!this.sectionFormTitle.trim()) return;

    const editing = this.editingSection();
    if (editing) {
      this.curriculumService.updateSection(editing.id, { title: this.sectionFormTitle })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.loadCurriculum();
          this.cancelSectionForm();
        });
    } else {
      this.curriculumService.createSection(this.courseId(), { title: this.sectionFormTitle })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.loadCurriculum();
          this.cancelSectionForm();
        });
    }
  }

  cancelSectionForm() {
    this.showSectionForm.set(false);
    this.editingSection.set(null);
    this.sectionFormTitle = '';
  }

  addLesson(sectionId: number) {
    this.newLessonSectionId.set(sectionId);
    this.editingLesson.set(null);
  }

  editLesson(lesson: Lesson) {
    this.editingLesson.set(lesson);
    this.newLessonSectionId.set(null);
  }

  onLessonSave(data: { lesson: Lesson | null; title: string; video_url: string; duration_minutes: number; is_free: boolean }) {
    const editing = this.editingLesson();
    const sectionId = this.newLessonSectionId();

    if (editing) {
      this.curriculumService.updateLesson(editing.id, {
        title: data.title,
        video_url: data.video_url || undefined,
        duration_minutes: data.duration_minutes,
        is_free: data.is_free,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadCurriculum();
        this.onLessonEditorClose();
      });
    } else if (sectionId) {
      this.curriculumService.createLesson(sectionId, {
        title: data.title,
        video_url: data.video_url || undefined,
        duration_minutes: data.duration_minutes,
        is_free: data.is_free,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadCurriculum();
        this.onLessonEditorClose();
      });
    }
  }

  onLessonEditorClose() {
    this.editingLesson.set(null);
    this.newLessonSectionId.set(null);
  }

  confirmDeleteSection(section: CourseSection) {
    this.deleteTarget.set({ type: 'sección', id: section.id });
  }

  confirmDeleteLesson(lesson: Lesson) {
    this.deleteTarget.set({ type: 'lección', id: lesson.id });
  }

  cancelDelete() {
    this.deleteTarget.set(null);
  }

  confirmDelete() {
    const target = this.deleteTarget();
    if (!target) return;

    if (target.type === 'sección') {
      this.curriculumService.deleteSection(target.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.loadCurriculum());
    } else {
      this.curriculumService.deleteLesson(target.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.loadCurriculum());
    }
    this.deleteTarget.set(null);
  }
}
