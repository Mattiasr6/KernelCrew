import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { Course } from '../../core/models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-admin-moderation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-fade-in">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-zinc-50">Moderación de Cursos</h1>
          <p class="text-zinc-400 mt-1">Revisa y aprueba los cursos enviados por instructores.</p>
        </div>
      </div>

      @if (isLoading()) {
        <div class="flex items-center justify-center py-24">
          <div class="w-10 h-10 border-2 border-zinc-700 border-t-cyan-500 rounded-full animate-spin"></div>
        </div>
      } @else if (courses().length === 0) {
        <div class="border-2 border-dashed border-zinc-800 rounded-xl p-16 text-center">
          <span class="material-symbols-outlined text-6xl text-zinc-700 mb-4 block">fact_check</span>
          <h3 class="text-xl font-semibold text-zinc-300 mb-2">No hay cursos pendientes</h3>
          <p class="text-zinc-500">Todos los cursos han sido revisados.</p>
        </div>
      } @else {
        <div class="space-y-4">
          @for (course of courses(); track course.id) {
            <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-start justify-between gap-6">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-lg font-bold text-zinc-100">{{ course.title }}</h3>
                  <span class="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">Pendiente</span>
                </div>
                <p class="text-sm text-zinc-400 line-clamp-2 mb-3">{{ course.description }}</p>
                <div class="flex items-center gap-4 text-xs text-zinc-500">
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
                    {{ course.level }}
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <button class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors flex items-center gap-1.5" (click)="approve(course)">
                  <span class="material-symbols-outlined text-[16px]">check</span>
                  Aprobar
                </button>
                <button class="px-4 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white font-medium text-sm transition-colors flex items-center gap-1.5" (click)="reject(course)">
                  <span class="material-symbols-outlined text-[16px]">close</span>
                  Rechazar
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; padding: 24px; max-width: 1000px; margin: 0 auto; }
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AdminModerationComponent implements OnInit {
  private adminService = inject(AdminService);
  private destroyRef = inject(DestroyRef);

  courses = signal<Course[]>([]);
  isLoading = signal(true);

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
        error: () => this.isLoading.set(false)
      });
  }

  approve(course: Course) {
    this.adminService.approveCourse(course.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadPending());
  }

  reject(course: Course) {
    this.adminService.rejectCourse(course.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadPending());
  }
}
