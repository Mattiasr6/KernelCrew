import { Component, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CourseEditorService } from '../services/course-editor.service';
import { ApiService } from '../../../../core/services/api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-course-editor-settings',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="max-w-2xl">
      <h2 class="text-2xl font-bold tracking-tight text-zinc-50 mb-2">Configuración</h2>
      <p class="text-sm text-zinc-400 mb-8">Gestiona el estado y ciclo de vida de tu curso.</p>

      <!-- Status Card -->
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
        <h3 class="text-sm font-semibold text-zinc-300 mb-3">Estado del Curso</h3>
        <div class="flex items-center gap-3 mb-4">
          <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
            [ngClass]="{
              'bg-zinc-800 text-zinc-400': status() === 'DRAFT',
              'bg-amber-500/10 text-amber-400': status() === 'IN_REVIEW',
              'bg-emerald-500/10 text-emerald-400': status() === 'PUBLISHED',
              'bg-rose-500/10 text-rose-400': status() === 'REJECTED'
            }">
            <span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">
              {{ status() === 'DRAFT' ? 'edit_note' : status() === 'IN_REVIEW' ? 'hourglass_top' : status() === 'PUBLISHED' ? 'check_circle' : 'block' }}
            </span>
            {{ status() === 'DRAFT' ? 'Borrador' : status() === 'IN_REVIEW' ? 'En Revisión' : status() === 'PUBLISHED' ? 'Publicado' : 'Rechazado' }}
          </span>
        </div>

        @if (status() === 'DRAFT' || status() === 'REJECTED') {
          <p class="text-sm text-zinc-400 mb-4">
            {{ status() === 'REJECTED' ? 'Corrige los problemas indicados y vuelve a enviar.' : 'Cuando esté listo, envíalo a revisión para que un administrador lo apruebe.' }}
          </p>
          <button mat-flat-button class="review-btn" (click)="requestReview()" [disabled]="submitting()">
            @if (submitting()) {
              <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span>
            }
            {{ status() === 'REJECTED' ? 'Reenviar a Revisión' : 'Enviar a Revisión' }}
          </button>
        } @else if (status() === 'IN_REVIEW') {
          <p class="text-sm text-amber-400">
            Tu curso está siendo revisado por el equipo de KernelLearn. Recibirás una notificación cuando sea aprobado o rechazado.
          </p>
        } @else if (status() === 'PUBLISHED') {
          <p class="text-sm text-emerald-400">
            Tu curso está publicado y disponible para estudiantes.
          </p>
        }
      </div>

      <!-- Danger Zone -->
      <div class="border border-rose-500/20 bg-rose-500/5 rounded-xl p-6">
        <h3 class="text-sm font-semibold text-rose-400 mb-2 flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">warning</span>
          Zona de Peligro
        </h3>
        <p class="text-xs text-zinc-400 mb-4">
          Eliminar el curso es irreversible. Se reembolsarán los créditos a los estudiantes inscritos.
        </p>
        <div class="flex items-center gap-3">
          @if (!confirmDelete()) {
            <button mat-stroked-button class="delete-btn" (click)="confirmDelete.set(true)">
              <span class="material-symbols-outlined text-[16px] mr-1">delete</span>
              Eliminar Curso
            </button>
          } @else {
            <span class="text-xs text-rose-400 font-medium">¿Estás seguro?</span>
            <button mat-flat-button class="confirm-delete-btn" (click)="deleteCourse()" [disabled]="submitting()">
              Sí, eliminar
            </button>
            <button mat-button class="text-zinc-400 text-xs" (click)="confirmDelete.set(false)">
              Cancelar
            </button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .review-btn {
      background: linear-gradient(135deg, #06b6d4, #0891b2) !important;
      color: #fff !important;
      border-radius: 10px !important;
      font-weight: 600 !important;
      box-shadow: 0 0 15px rgba(6, 182, 212, 0.2) !important;
    }
    .delete-btn {
      color: #f43f5e !important;
      border-color: rgba(244, 63, 94, 0.3) !important;
      border-radius: 10px !important;
      font-weight: 500 !important;
    }
    .delete-btn:hover {
      background: rgba(244, 63, 94, 0.08) !important;
    }
    .confirm-delete-btn {
      background: #f43f5e !important;
      color: #fff !important;
      border-radius: 10px !important;
      font-weight: 600 !important;
    }
  `],
})
export class CourseEditorSettingsComponent {
  private editorService = inject(CourseEditorService);
  private api = inject(ApiService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  course = this.editorService.currentCourse;
  submitting = signal(false);
  confirmDelete = signal(false);

  status = () => this.course()?.status ?? 'DRAFT';

  requestReview(): void {
    const courseId = this.course()?.id;
    if (!courseId) return;

    this.submitting.set(true);
    this.api
      .patch<{ success: boolean; message: string }>(`instructor/courses/${courseId}/request-review`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.submitting.set(false);
          this.snackBar.open(res.message ?? 'Curso enviado a revisión.', 'Cerrar', { duration: 3000 });
          this.editorService.fetchCourse(courseId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe();
        },
        error: (err) => {
          this.submitting.set(false);
          this.snackBar.open(err?.error?.message || 'Error al enviar', 'Cerrar', { duration: 4000 });
        },
      });
  }

  deleteCourse(): void {
    const courseId = this.course()?.id;
    if (!courseId) return;

    this.submitting.set(true);
    this.api
      .delete<{ success: boolean; message: string }>(`instructor/courses/${courseId}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.snackBar.open(res.message ?? 'Curso eliminado.', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/instructor/courses']);
        },
        error: (err) => {
          this.submitting.set(false);
          this.snackBar.open(err?.error?.message || 'Error al eliminar', 'Cerrar', { duration: 4000 });
        },
      });
  }
}
