import { Component, OnInit, inject, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, ActivatedRoute } from '@angular/router';
import { CourseEditorService } from './services/course-editor.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-course-editor-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="h-[calc(100vh-70px)] flex flex-col md:flex-row overflow-hidden">
      <!-- SIDEBAR (desktop) -->
      <aside class="hidden md:flex md:w-64 md:shrink-0 md:flex-col bg-zinc-900 border-r border-zinc-800">
        <!-- header -->
        <div class="p-5 border-b border-zinc-800">
          @if (course(); as c) {
            <h2 class="text-sm font-semibold text-zinc-100 truncate" [title]="c.title">
              {{ c.title }}
            </h2>
            <p class="text-xs text-zinc-500 mt-1">Editor de Curso</p>
          } @else {
            <div class="animate-pulse space-y-2">
              <div class="h-4 bg-zinc-800 rounded w-3/4"></div>
              <div class="h-3 bg-zinc-800 rounded w-1/2"></div>
            </div>
          }
        </div>

        <!-- tabs -->
        <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
          @for (tab of tabs; track tab.path) {
            <a [routerLink]="['/instructor/courses', courseId, tab.path]"
               routerLinkActive="tab-active"
               [routerLinkActiveOptions]="{ exact: tab.exact ?? false }"
               class="tab-link">
              <span class="material-symbols-outlined text-[20px]">{{ tab.icon }}</span>
              <span>{{ tab.label }}</span>
            </a>
          }
        </nav>

        <!-- footer -->
        <div class="p-4 border-t border-zinc-800">
          <a routerLink="/instructor/courses" class="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            <span class="material-symbols-outlined text-[16px]">arrow_back</span>
            Volver a cursos
          </a>
        </div>
      </aside>

      <!-- MAIN CONTENT -->
      <div class="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0">
        <!-- Status Banner -->
        @if (course(); as c) {
          <div class="status-banner" [class]="statusBannerClass(c.status)">
            <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">
              {{ statusIcon(c.status) }}
            </span>
            <span class="text-sm font-medium">{{ statusLabel(c.status) }}</span>
            @if (c.status === 'REJECTED' && c.rejection_reason) {
              <span class="text-xs opacity-80 ml-2 truncate max-w-[160px] sm:max-w-none">{{ c.rejection_reason }}</span>
            }
          </div>
        }

        <!-- Router Outlet -->
        <div class="flex-1 overflow-y-auto p-4 md:p-6">
          <router-outlet></router-outlet>
        </div>
      </div>

      <!-- BOTTOM TAB BAR (mobile only) -->
      @if (courseId) {
        <nav class="block md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 z-40 flex justify-around items-center py-2"
             style="padding-bottom: calc(0.5rem + env(safe-area-inset-bottom))">
          @for (tab of tabs; track tab.path) {
            <a [routerLink]="['/instructor/courses', courseId, tab.path]"
               routerLinkActive="text-cyan-400"
               [routerLinkActiveOptions]="{ exact: tab.exact ?? false }"
               class="flex flex-col items-center gap-0.5 text-zinc-500 no-underline transition-colors">
              <span class="material-symbols-outlined text-[20px]">{{ tab.icon }}</span>
              <span class="text-[10px] font-medium">{{ tab.label }}</span>
            </a>
          }
        </nav>
      }
    </div>
  `,
  styles: [`
    .tab-link {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 10px;
      color: #a1a1aa;
      font-size: 0.875rem;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.15s ease;
    }
    .tab-link:hover {
      color: #fafafa;
      background: rgba(255, 255, 255, 0.04);
    }
    .tab-active {
      color: #06b6d4;
      background: rgba(6, 182, 212, 0.1);
    }
    .status-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-bottom: 1px solid #27272a;
    }
    .status-draft {
      background: #18181b;
      color: #a1a1aa;
    }
    .status-in-review {
      background: rgba(245, 158, 11, 0.08);
      color: #f59e0b;
    }
    .status-published {
      background: rgba(16, 185, 129, 0.08);
      color: #10b981;
    }
    .status-rejected {
      background: rgba(244, 63, 94, 0.08);
      color: #f43f5e;
    }
  `],
})
export class CourseEditorLayoutComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private editorService = inject(CourseEditorService);
  private destroyRef = inject(DestroyRef);

  courseId!: number;
  course = this.editorService.currentCourse;

  canEdit = computed(() => {
    const status = this.course()?.status;
    return status === 'DRAFT' || status === 'REJECTED';
  });

  tabs = [
    { path: 'basic', label: 'Información', icon: 'info', exact: true },
    { path: 'curriculum', label: 'Currículo', icon: 'menu_book', isExternal: false },
    { path: 'pricing', label: 'Precio', icon: 'database', exact: true },
    { path: 'settings', label: 'Configuración', icon: 'settings', exact: true },
  ];

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));
    if (this.courseId) {
      this.editorService.fetchCourse(this.courseId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    }
  }

  isTabActive(path: string): boolean {
    return window.location.pathname.includes(`/instructor/courses/${this.courseId}/${path}`);
  }

  statusBannerClass(status: string): string {
    switch (status) {
      case 'IN_REVIEW': return 'status-in-review';
      case 'PUBLISHED': return 'status-published';
      case 'REJECTED': return 'status-rejected';
      default: return 'status-draft';
    }
  }

  statusIcon(status: string): string {
    switch (status) {
      case 'IN_REVIEW': return 'hourglass_top';
      case 'PUBLISHED': return 'check_circle';
      case 'REJECTED': return 'block';
      default: return 'edit_note';
    }
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'IN_REVIEW': return 'En Revisión';
      case 'PUBLISHED': return 'Publicado';
      case 'REJECTED': return 'Rechazado';
      default: return 'Borrador';
    }
  }
}
