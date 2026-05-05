import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../core/services/admin.service';
import { Course } from '../../core/models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-admin-moderation',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="animate-fade-in">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-zinc-50">Moderación de Cursos</h1>
          <p class="text-zinc-400 mt-1">Revisa y aprueba los cursos enviados por instructores.</p>
        </div>
      </div>

      @if (isLoading()) {
        <div class="flex items-center justify-center py-24">
          <div class="w-10 h-10 border-2 border-zinc-700 border-t-cyan-500 rounded-full animate-spin"></div>
        </div>
      } @else if (courses().length === 0) {
        <div class="border-2 border-dashed border-zinc-800 rounded-xl p-8 md:p-16 text-center">
          <span class="material-symbols-outlined text-6xl text-zinc-700 mb-4 block">fact_check</span>
          <h3 class="text-xl font-semibold text-zinc-300 mb-2">No hay cursos pendientes</h3>
          <p class="text-zinc-500">Todos los cursos han sido revisados.</p>
        </div>
      } @else {
        <div class="space-y-4">
          @for (course of courses(); track course.id) {
            <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-lg font-bold text-zinc-100">{{ course.title }}</h3>
                    <span class="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">Pendiente</span>
                  </div>
                  <p class="text-sm text-zinc-400 line-clamp-2 mb-3">{{ course.description }}</p>
                  <div class="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                    <span class="flex items-center gap-1">
                      <span class="material-symbols-outlined text-[14px]">person</span>
                      {{ course.instructor?.name || 'Instructor' }}
                    </span>
                    <span class="flex items-center gap-1">
                      <span class="material-symbols-outlined text-[14px]">schedule</span>
                      {{ course.created_at | date:'shortDate' }}
                    </span>
                    <span class="flex items-center gap-1">
                      <span class="material-symbols-outlined text-[14px]">school</span>
                      {{ course.level === 'beginner' ? 'Inicial' : course.level === 'intermediate' ? 'Intermedio' : course.level === 'advanced' ? 'Avanzado' : course.level }}
                    </span>
                    @if (course.category) {
                      <span class="flex items-center gap-1">
                        <span class="material-symbols-outlined text-[14px]">category</span>
                        {{ $any(course.category).name ?? course.category }}
                      </span>
                    }
                    @if (course.price_in_credits) {
                      <span class="flex items-center gap-1 text-amber-400">
                        <span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">database</span>
                        {{ course.price_in_credits }}
                      </span>
                    }
                  </div>
                </div>
                <div class="flex flex-row flex-wrap gap-2 shrink-0 mt-4 md:mt-0">
                  <button mat-flat-button class="approve-btn"
                    (click)="approve(course)"
                    [disabled]="actioningId() === course.id">
                    <span class="material-symbols-outlined text-[16px]">check</span>
                    Aprobar
                  </button>
                  @if (rejectingId() !== course.id) {
                    <button mat-stroked-button class="reject-btn"
                      (click)="startReject(course.id)"
                      [disabled]="actioningId() === course.id">
                      <span class="material-symbols-outlined text-[16px]">close</span>
                      Rechazar
                    </button>
                  } @else {
                    <div class="reject-inline">
                      <textarea
                        [(ngModel)]="rejectReason"
                        placeholder="Motivo del rechazo (máx. 500 caracteres)..."
                        class="reject-textarea"
                        rows="3"
                        maxlength="500"
                      ></textarea>
                      <div class="flex items-center justify-between mt-2">
                        <span class="text-[10px] text-zinc-600">{{ rejectReason().length }}/500</span>
                        <div class="flex gap-2">
                          <button class="cancel-reject-btn" (click)="cancelReject()">
                            Cancelar
                          </button>
                          <button mat-flat-button class="confirm-reject-btn"
                            (click)="confirmReject(course)"
                            [disabled]="!rejectReason().trim() || actioningId() === course.id">
                            Confirmar Rechazo
                          </button>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; max-width: 1024px; margin: 0 auto; padding: 1rem; }
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .approve-btn {
      background: rgba(16, 185, 129, 0.15) !important;
      color: #10b981 !important;
      border: 1px solid rgba(16, 185, 129, 0.25) !important;
      border-radius: 10px !important;
      font-weight: 600 !important;
      font-size: 0.85rem !important;
      padding: 8px 16px !important;
      box-shadow: 0 0 12px rgba(16, 185, 129, 0.1) !important;
      transition: all 0.2s ease !important;
    }
    .approve-btn:hover:not(:disabled) {
      background: #10b981 !important;
      color: #fff !important;
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.3) !important;
    }
    .reject-btn {
      color: #f43f5e !important;
      border-color: rgba(244, 63, 94, 0.3) !important;
      border-radius: 10px !important;
      font-weight: 600 !important;
      font-size: 0.85rem !important;
      padding: 8px 16px !important;
      transition: all 0.2s ease !important;
    }
    .reject-btn:hover:not(:disabled) {
      background: rgba(244, 63, 94, 0.1) !important;
      border-color: #f43f5e !important;
    }
    .reject-inline {
      background: #18181b;
      border: 1px solid rgba(244, 63, 94, 0.25);
      border-radius: 12px;
      padding: 12px;
      min-width: 260px;
    }
    @media (max-width: 767px) {
      .reject-inline { min-width: unset; width: 100%; }
    }
    .reject-textarea {
      width: 100%;
      background: rgba(244, 63, 94, 0.05);
      border: 1px solid rgba(244, 63, 94, 0.2);
      border-radius: 8px;
      padding: 10px 12px;
      color: #fafafa;
      font-size: 0.8rem;
      resize: vertical;
      outline: none;
      font-family: inherit;
      box-sizing: border-box;
    }
    .reject-textarea:focus {
      border-color: #f43f5e;
      box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.1);
    }
    .reject-textarea::placeholder {
      color: #52525b;
    }
    .confirm-reject-btn {
      background: #f43f5e !important;
      color: #fff !important;
      border-radius: 8px !important;
      font-size: 0.8rem !important;
      font-weight: 600 !important;
      padding: 6px 14px !important;
    }
    .confirm-reject-btn:disabled {
      opacity: 0.5;
    }
    .cancel-reject-btn {
      color: #a1a1aa;
      font-size: 0.8rem;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 6px 10px;
      border-radius: 8px;
      transition: all 0.15s ease;
    }
    .cancel-reject-btn:hover {
      color: #fafafa;
      background: rgba(255, 255, 255, 0.05);
    }
  `],
})
export class AdminModerationComponent implements OnInit {
  private adminService = inject(AdminService);
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  courses = signal<Course[]>([]);
  isLoading = signal(true);
  actioningId = signal<number | null>(null);
  rejectingId = signal<number | null>(null);
  rejectReason = signal('');

  ngOnInit() {
    this.loadPending();
  }

  loadPending() {
    this.isLoading.set(true);
    this.adminService.getPendingCourses()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.courses.set(Array.isArray(res.data) ? res.data : []);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  approve(course: Course) {
    if (this.actioningId()) return;
    this.actioningId.set(course.id);

    this.adminService.approveCourse(course.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.actioningId.set(null);
          this.snackBar.open(res.message ?? 'Curso aprobado', 'Cerrar', { duration: 3000 });
          this.removeFromList(course.id);
        },
        error: (err) => {
          this.actioningId.set(null);
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
    if (!reason || this.actioningId()) return;

    this.actioningId.set(course.id);
    this.adminService.rejectCourse(course.id, reason)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.actioningId.set(null);
          this.rejectingId.set(null);
          this.rejectReason.set('');
          this.snackBar.open(res.message ?? 'Curso rechazado', 'Cerrar', { duration: 3000 });
          this.removeFromList(course.id);
        },
        error: (err) => {
          this.actioningId.set(null);
          this.snackBar.open(err?.error?.message || 'Error al rechazar', 'Cerrar', { duration: 4000 });
        },
      });
  }

  private removeFromList(courseId: number) {
    this.courses.update((list) => list.filter((c) => c.id !== courseId));
  }
}
