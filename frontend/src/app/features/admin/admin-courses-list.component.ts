import { Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { Course } from '../../core/models';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-courses-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule, RouterLink],
  template: `
    <div class="max-w-container-max mx-auto space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl font-bold text-on-surface">Todos los Cursos</h2>
          <p class="text-on-surface-variant mt-1">Administra y modera todos los cursos de la plataforma.</p>
        </div>
      </div>

      @if (isLoading()) {
        <div class="flex items-center justify-center py-24">
          <div class="w-10 h-10 border-2 border-zinc-700 border-t-cyan-500 rounded-full animate-spin"></div>
        </div>
      } @else if (courses().length === 0) {
        <div class="border-2 border-dashed border-zinc-800 rounded-xl p-8 md:p-16 text-center">
          <span class="material-symbols-outlined text-6xl text-zinc-700 mb-4 block">school</span>
          <h3 class="text-xl font-semibold text-zinc-300 mb-2">No hay cursos</h3>
          <p class="text-zinc-500">Aún no se ha creado ningún curso.</p>
        </div>
      } @else {
        <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-zinc-800 bg-zinc-900/50">
                  <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">ID</th>
                  <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">Título</th>
                  <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">Instructor</th>
                  <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">Estado</th>
                  <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">Lecciones</th>
                  <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">Estudiantes</th>
                  <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">Créditos</th>
                  <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-800">
                @for (course of courses(); track course.id) {
                  <tr class="hover:bg-zinc-800/30 transition-colors">
                    <td class="px-6 py-4 text-zinc-400 text-sm" data-label="ID">{{ course.id }}</td>
                    <td class="px-6 py-4" data-label="Título">
                      <a [routerLink]="['/admin/courses', course.id, 'preview']" class="text-zinc-200 font-medium hover:text-cyan-400 transition-colors">
                        {{ course.title }}
                      </a>
                    </td>
                    <td class="px-6 py-4 text-zinc-400 text-sm" data-label="Instructor">{{ course.instructor?.name || '—' }}</td> 
                    <td class="px-6 py-4" data-label="Estado">
                      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        [ngClass]="{
                          'bg-zinc-800 text-zinc-400': course.status === 'DRAFT',
                          'bg-amber-500/10 text-amber-400': course.status === 'IN_REVIEW',
                          'bg-emerald-500/10 text-emerald-400': course.status === 'PUBLISHED',
                          'bg-rose-500/10 text-rose-400': course.status === 'REJECTED'
                        }">
                        {{ course.status === 'DRAFT' ? 'Borrador' : course.status === 'IN_REVIEW' ? 'Revisión' : course.status === 'PUBLISHED' ? 'Publicado' : 'Rechazado' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-zinc-400 text-sm" data-label="Lecciones">{{ course.sections_count || 0 }}</td>
                    <td class="px-6 py-4 text-zinc-400 text-sm" data-label="Estudiantes">{{ course.students_count || 0 }}</td>
                    <td class="px-6 py-4 text-amber-400 text-sm" data-label="Créditos">{{ course.price_in_credits || 0 }}</td>
                    <td class="px-6 py-4 text-right" data-label="Acciones">
                      <div class="flex items-center justify-end gap-2">
                        <a [routerLink]="['/admin/courses', course.id, 'preview']"
                          class="bg-zinc-800/50 text-zinc-300 border border-zinc-700 hover:bg-zinc-700/50 rounded-full px-3 py-1 flex items-center gap-1 text-xs transition-colors no-underline"
                          title="Vista previa admin">
                          <span class="material-symbols-outlined text-[14px]">visibility</span>
                          Ver
                        </a>
                        @if (course.status === 'IN_REVIEW') {
                          <button
                            (click)="approve(course)"
                            class="bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 rounded-full px-3 py-1 flex items-center gap-1 text-xs transition-colors"
                          >
                            <span class="material-symbols-outlined text-[14px]">check</span>
                            Aprobar
                          </button>
                          @if (rejectingId() !== course.id) {
                            <button
                              (click)="startReject(course.id)"
                              class="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-full px-3 py-1 flex items-center gap-1 text-xs transition-colors"
                            >
                              <span class="material-symbols-outlined text-[14px]">close</span>
                              Rechazar
                            </button>
                          }
                        }
                        </div>
                        @if (rejectingId() === course.id) {
                          <div class="mt-2 bg-zinc-800/50 border border-red-500/20 rounded-lg p-3">
                            <textarea
                              [(ngModel)]="rejectReason"
                              placeholder="Motivo del rechazo..."
                              class="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg p-2 text-xs outline-none focus:border-red-500 resize-none"
                              rows="2"
                              maxlength="500"
                            ></textarea>
                            <div class="flex items-center justify-between mt-2">
                              <span class="text-[10px] text-zinc-600">{{ rejectReason().length }}/500</span>
                              <div class="flex gap-2">
                                <button
                                  (click)="cancelReject()"
                                  class="text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
                                >Cancelar</button>
                                <button
                                  (click)="confirmReject(course)"
                                  [disabled]="!rejectReason().trim()"
                                  class="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-full px-3 py-1 text-[11px] font-medium transition-colors disabled:opacity-50"
                                >Confirmar</button>
                              </div>
                            </div>
                          </div>
                        }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* Responsive table → cards on mobile */
    @media (max-width: 767px) {
      table,
      thead,
      tbody,
      th,
      td,
      tr {
        display: block;
      }
      thead { display: none; }
      tr {
        padding: 16px;
        margin-bottom: 12px;
        background: #18181b;
        border: 1px solid #27272a;
        border-radius: 12px;
      }
      td {
        padding: 6px 0 !important;
        text-align: left !important;
        border: none !important;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      td::before {
        content: attr(data-label);
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: #71717a;
        min-width: 80px;
        flex-shrink: 0;
      }
      td[data-label="Acciones"] {
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 8px;
        padding-top: 8px !important;
        border-top: 1px solid #27272a !important;
      }
      td[data-label="Título"] {
        font-weight: 600;
        font-size: 1rem;
      }
    }
  `]
})
export class AdminCoursesListComponent implements OnInit {
  private adminService = inject(AdminService);
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  courses = signal<(Course & { sections_count?: number; students_count?: number })[]>([]);
  isLoading = signal(true);
  rejectingId = signal<number | null>(null);
  rejectReason = signal('');

  ngOnInit() {
    this.loadCourses();
  }

  loadCourses() {
    this.isLoading.set(true);
    this.adminService.getAllCourses()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.courses.set(res.data?.data || res.data || []);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  approve(course: Course) {
    if (!confirm(`¿Aprobar y publicar "${course.title}"?`)) return;
    this.adminService.approveCourse(course.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.snackBar.open(res.message ?? 'Curso aprobado', 'Cerrar', { duration: 3000 });
          this.loadCourses();
        },
        error: (err) => {
          this.snackBar.open(err?.error?.message || 'Error al aprobar', 'Cerrar', { duration: 4000 });
        },
      });
  }

  startReject(courseId: number) {
    this.rejectingId.set(courseId);
    this.rejectReason.set('');
  }

  cancelReject() {
    this.rejectingId.set(null);
    this.rejectReason.set('');
  }

  confirmReject(course: Course) {
    const reason = this.rejectReason().trim();
    if (!reason) return;
    this.adminService.rejectCourse(course.id, reason)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.rejectingId.set(null);
          this.rejectReason.set('');
          this.snackBar.open(res.message ?? 'Curso rechazado', 'Cerrar', { duration: 3000 });
          this.loadCourses();
        },
        error: (err) => {
          this.snackBar.open(err?.error?.message || 'Error al rechazar', 'Cerrar', { duration: 4000 });
        },
      });
  }
}
