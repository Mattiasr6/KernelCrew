import { Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { ApiService } from '../../core/services/api.service';
import { Course, CourseSection } from '../../core/models';

@Component({
  selector: 'app-admin-course-preview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto py-8 px-4">
      <a routerLink="/admin/courses" class="text-zinc-400 hover:text-zinc-200 text-sm flex items-center gap-1 mb-6 transition-colors">
        <span class="material-symbols-outlined text-[16px]">arrow_back</span>
        Volver a cursos
      </a>

      @if (isLoading()) {
        <div class="flex items-center justify-center py-24">
          <div class="w-10 h-10 border-2 border-zinc-700 border-t-cyan-500 rounded-full animate-spin"></div>
        </div>
      } @else if (course(); as c) {
        <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:p-8">
          <div class="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 class="text-2xl font-bold text-zinc-50">{{ c.title }}</h1>
              <p class="text-sm text-zinc-500 mt-1">
                por {{ c.instructor?.name || '—' }} &bull;
                {{ c.level === 'beginner' ? 'Inicial' : c.level === 'intermediate' ? 'Intermedio' : 'Avanzado' }}
              </p>
            </div>
            <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap"
              [ngClass]="{
                'bg-zinc-800 text-zinc-400': c.status === 'DRAFT',
                'bg-amber-500/10 text-amber-400': c.status === 'IN_REVIEW',
                'bg-emerald-500/10 text-emerald-400': c.status === 'PUBLISHED',
                'bg-rose-500/10 text-rose-400': c.status === 'REJECTED'
              }">
              {{ c.status === 'DRAFT' ? 'Borrador' : c.status === 'IN_REVIEW' ? 'En Revisión' : c.status === 'PUBLISHED' ? 'Publicado' : 'Rechazado' }}
            </span>
          </div>

          @if (c.short_description) {
            <p class="text-zinc-300 mb-6">{{ c.short_description }}</p>
          }

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div class="bg-zinc-800/50 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-cyan-400">{{ $any(c).sections_count || 0 }}</div>
              <div class="text-xs text-zinc-500 mt-1">Secciones</div>
            </div>
            <div class="bg-zinc-800/50 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-violet-400">{{ $any(c).lessons_count || 0 }}</div>
              <div class="text-xs text-zinc-500 mt-1">Lecciones</div>
            </div>
            <div class="bg-zinc-800/50 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-emerald-400">{{ c.duration_hours || '—' }}</div>
              <div class="text-xs text-zinc-500 mt-1">Horas</div>
            </div>
            <div class="bg-zinc-800/50 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-amber-400">{{ c.price_in_credits || 0 }}</div>
              <div class="text-xs text-zinc-500 mt-1">Créditos</div>
            </div>
          </div>

          @if (c.description) {
            <section class="mb-8">
              <h2 class="text-lg font-bold text-zinc-100 mb-3">Descripción</h2>
              <p class="text-zinc-400 leading-relaxed text-justify">{{ c.description }}</p>
            </section>
          }

          @if (curriculum().length > 0) {
            <section>
              <h2 class="text-lg font-bold text-zinc-100 mb-3">Temario</h2>
              <div class="space-y-2">
                @for (section of curriculum(); track section.id) {
                  <div class="border border-zinc-800 rounded-lg overflow-hidden">
                    <div class="flex items-center gap-3 px-4 py-3 bg-zinc-800/30">
                      <span class="material-symbols-outlined text-cyan-400 text-[18px]">folder</span>
                      <span class="font-medium text-zinc-200 text-sm">{{ section.title }}</span>
                      <span class="text-xs text-zinc-600 ml-auto">{{ section.lessons?.length || 0 }} lecciones</span>
                    </div>
                    @if (section.lessons && section.lessons.length > 0) {
                      <div class="border-t border-zinc-800">
                        @for (lesson of section.lessons; track lesson.id) {
                          <div class="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800/20 transition-colors">
                            <span class="material-symbols-outlined text-zinc-600 text-[16px]" [class.text-emerald-400]="lesson.is_free">
                              {{ lesson.video_url ? 'play_circle' : 'article' }}
                            </span>
                            <span class="text-sm text-zinc-300 flex-1">{{ lesson.title }}</span>
                            @if (lesson.is_free) {
                              <span class="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Preview</span>
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
          }

          @if (c.status === 'REJECTED' && $any(c).rejection_reason) {
            <section class="mt-8 bg-rose-500/10 border border-rose-500/20 rounded-lg p-4">
              <h3 class="text-sm font-bold text-rose-400 mb-1">Motivo del rechazo</h3>
              <p class="text-sm text-rose-300">{{ $any(c).rejection_reason }}</p>
            </section>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class AdminCoursePreviewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private destroyRef = inject(DestroyRef);

  course = signal<Course | null>(null);
  curriculum = signal<(CourseSection & { lessons?: any[] })[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    const courseId = this.route.snapshot.paramMap.get('courseId') || this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.loadCourse(+courseId);
    }
  }

  loadCourse(id: number) {
    this.isLoading.set(true);
    this.api.get<{ success: boolean; data: any }>(`admin/courses/${id}/preview`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.data) {
            this.course.set(res.data);
            this.curriculum.set(res.data.curriculum || []);
          }
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }
}
