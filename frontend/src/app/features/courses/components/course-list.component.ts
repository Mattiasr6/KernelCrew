import { Component, inject, OnInit, signal, Provider, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent, MatPaginatorIntl } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { Course, Category } from '../../../core/models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

class SpanishPaginatorIntl extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Ítems por página';
  override nextPageLabel = 'Siguiente página';
  override previousPageLabel = 'Página anterior';
  override firstPageLabel = 'Primera página';
  override lastPageLabel = 'Última página';

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) return `0 de ${length}`;
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = Math.min(startIndex + pageSize, length);
    return `${startIndex + 1} – ${endIndex} de ${length}`;
  };
}

@Component({
  selector: 'app-course-list',
  standalone: true,
  providers: [{ provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl } as Provider],
  imports: [
    CommonModule, RouterLink, FormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatPaginatorModule,
    MatProgressSpinnerModule, MatChipsModule, MatIconModule, MatTooltipModule,
  ],
  template: `
    <div class="min-h-screen bg-zinc-950 px-4 py-8">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl mb-8">Catálogo de Cursos</h1>

        <div class="flex gap-4 flex-wrap mb-8">
          <mat-form-field appearance="outline" class="flex-1 min-w-[200px]">
            <mat-label>Buscar</mat-label>
            <input matInput [(ngModel)]="search" placeholder="Buscar cursos..." (input)="onSearch()" />
            <mat-icon matSuffix class="text-zinc-500">search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="min-w-[150px]">
            <mat-label>Nivel</mat-label>
            <mat-select [(ngModel)]="level" (selectionChange)="onSearch()">
              <mat-option value="">Todos</mat-option>
              <mat-option value="beginner">Principiante</mat-option>
              <mat-option value="intermediate">Intermedio</mat-option>
              <mat-option value="advanced">Avanzado</mat-option>
            </mat-select>
          </mat-form-field>

<mat-form-field appearance="outline" class="min-w-[150px]">
            <mat-label>Categoría</mat-label>
            <mat-select [(ngModel)]="category" (selectionChange)="onSearch()">
              <mat-option value="">Todas</mat-option>
              @for (cat of categories(); track cat.id) {
                <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <button mat-flat-button class="search-btn h-14" (click)="loadCourses()">Actualizar</button>
        </div>

        @if (loading) {
          <div class="flex justify-center py-20">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        } @else if (courses().length === 0) {
          <div class="border-2 border-dashed border-zinc-800 rounded-xl p-12 text-center">
            <span class="material-symbols-outlined text-6xl text-zinc-600 mb-4">school</span>
            <p class="text-zinc-400 text-lg">No se encontraron cursos</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            @for (course of courses(); track course.id) {
              <div class="course-card" [routerLink]="['/courses', course.id]">
                <div class="relative">
                  <img
                    [src]="course.thumbnail || 'https://placehold.co/600x400/18181b/06b6d4?text=Course'"
                    [alt]="course.title"
                    class="w-full h-48 object-cover"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent"></div>
                </div>
                
                <div class="p-5">
                  <div class="flex flex-wrap gap-2 mb-3">
                    <span class="badge" [class]="'badge-' + course.level">{{ course.level }}</span>
                    @if (authService.isAuthenticated() && authService.isStudent() && course.level) {
                      <span class="badge" [class]="getAccessClass(course.level)">
                        <mat-icon class="text-xs">{{ getAccessIcon(course.level) }}</mat-icon>
                        {{ getAccessLabel(course.level) }}
                      </span>
                    }
                  </div>
                  
                  <div class="flex items-center gap-1 mb-3">
                    <span class="material-symbols-outlined text-amber-400 text-lg" style="font-variation-settings: 'FILL' 1;">star</span>
                    <span class="text-zinc-50 text-sm font-bold">{{ course.average_rating || '4.5' }}</span>
                    <span class="text-zinc-500 text-xs">({{ course.reviews_count || 0 }})</span>
                  </div>
                  
                  <h3 class="text-lg font-medium text-zinc-100 mb-2 line-clamp-2">{{ course.title }}</h3>
                  <p class="text-sm text-zinc-400 line-clamp-2 mb-4">{{ course.short_description || course.description }}</p>
                  
                  <div class="flex justify-between items-center pt-3 border-t border-zinc-800">
                    <span class="text-xs font-medium uppercase tracking-wider text-zinc-500">{{ course.duration_hours || course.duration }} horas</span>
                    <span class="text-lg font-bold text-cyan-400">Bs. {{ course.price_in_bob || (course.price / 100 * 6.96 | number:'1.2-2') }}</span>
                  </div>
                </div>
              </div>
            }
          </div>

          <mat-paginator
            [length]="totalItems()"
            [pageSize]="pageSize"
            [pageIndex]="currentPage() - 1"
            [pageSizeOptions]="[10, 20, 50]"
            (page)="onPageChange($event)"
            class="bg-zinc-900 rounded-lg mt-4"
          >
          </mat-paginator>
        }
      </div>
    </div>
  `,
  styles: [`
    .search-btn {
      background: linear-gradient(135deg, #06b6d4, #8b5cf6) !important;
      color: white !important;
      font-weight: 500;
    }
    
    .course-card {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease-in-out;
      cursor: pointer;
    }
    .course-card:hover {
      transform: translateY(-4px);
      border-color: #06b6d4;
      box-shadow: 0 0 20px rgba(6, 182, 212, 0.2);
    }
    
    .badge {
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .badge-beginner { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
    .badge-intermediate { background: rgba(6, 182, 212, 0.15); color: #06b6d4; border: 1px solid rgba(6, 182, 212, 0.2); }
    .badge-advanced { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; border: 1px solid rgba(139, 92, 246, 0.2); }
    
    .access-granted { background: rgba(16, 185, 129, 0.15) !important; color: #10b981 !important; border: 1px solid rgba(16, 185, 129, 0.2) !important; display: flex; align-items: center; gap: 2px; }
    .access-denied { background: rgba(244, 63, 94, 0.15) !important; color: #f43f5e !important; border: 1px solid rgba(244, 63, 94, 0.2) !important; display: flex; align-items: center; gap: 2px; }
    
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    ::ng-deep .mat-mdc-form-field-outline {
      color: #27272a !important;
    }
    ::ng-deep .mat-mdc-text-field-wrapper {
      background-color: #09090b !important;
    }
    ::ng-deep .mat-mdc-form-field-focus-overlay {
      background-color: transparent !important;
    }
    ::ng-deep .mat-mdc-select-panel {
      background-color: #27272a !important;
      border: 1px solid #3f3f46 !important;
    }
    ::ng-deep .mat-mdc-option {
      color: #e4e4e7 !important;
    }
    ::ng-deep .mat-mdc-option:hover {
      background-color: #3f3f46 !important;
    }
    
    ::ng-deep .mat-mdc-paginator {
      background-color: transparent !important;
      color: #a1a1aa !important;
    }
  `],
})
export class CourseListComponent implements OnInit {
  private courseService = inject(CourseService);
  authService = inject(AuthService);
  private subscriptionService = inject(SubscriptionService);
  private enrollmentService = inject(EnrollmentService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  courses = signal<Course[]>([]);
  totalItems = signal(0);
  currentPage = signal(1);
  pageSize = 10;

  search = '';
  level = '';
  category = '';
  loading = false;
  categories = signal<Category[]>([]);
  courseAccessMap = signal<{ [courseId: number]: boolean }>({});

  userPlanName = '';
  userHasActiveSubscription = false;

  ngOnInit(): void {
    this.loadUserPlan();
    this.loadCategories();
    setTimeout(() => this.loadCourses(), 150);
  }

  loadCategories(): void {
    this.courseService.getCategories().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.categories.set(Array.isArray(res.data) ? res.data : res.data.data || []);
        }
      },
      error: () => {}
    });
  }

  loadUserPlan(): void {
    if (this.authService.isAuthenticated() && this.authService.isStudent()) {
      this.subscriptionService.getActive().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (response: any) => {
          if (response.success && response.data?.subscription) {
            this.userPlanName = response.data.subscription.plan?.name || '';
            this.userHasActiveSubscription = true;
          }
        },
        error: () => {},
      });
    }
  }

  checkCourseAccess(courseId: number): void {
    this.enrollmentService.checkCourseAccess(courseId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => {
        if (res.success) {
          const map = this.courseAccessMap();
          map[courseId] = res.data.has_access;
          this.courseAccessMap.set({...map});
        }
      },
      error: () => {}
    });
  }

  hasAccess(courseId: number): boolean {
    return this.courseAccessMap()[courseId] ?? true;
  }

  canEnroll(courseId: number): boolean {
    if (!this.userHasActiveSubscription) return false;
    return this.hasAccess(courseId);
  }

  getAccessIcon(level: string): string {
    if (!this.userPlanName) return 'lock_open';
    const plan = this.userPlanName.toLowerCase();
    const courseLevel = level.toLowerCase();

    if (plan === 'premium' || plan === 'enterprise') return 'check_circle';
    if (plan === 'pro' || plan === 'professional') {
      return ['beginner', 'intermediate'].includes(courseLevel) ? 'check_circle' : 'lock';
    }
    if (plan === 'basic' || plan === 'básico') {
      return courseLevel === 'beginner' ? 'check_circle' : 'lock';
    }
    return 'lock_open';
  }

  getAccessClass(level: string): string {
    const icon = this.getAccessIcon(level);
    return icon === 'check_circle' ? 'access-granted' : 'access-denied';
  }

  getAccessMessage(level: string): string {
    if (!this.userPlanName) return 'Inicia sesión para verificar acceso';
    const plan = this.userPlanName.toLowerCase();
    const courseLevel = level.toLowerCase();

    if (plan === 'premium' || plan === 'enterprise') return 'Tienes acceso con tu plan Premium';
    if (plan === 'pro' || plan === 'professional') {
      return ['beginner', 'intermediate'].includes(courseLevel)
        ? 'Tienes acceso con tu plan Pro'
        : `Tu plan Pro no incluye cursos ${level}`;
    }
    if (plan === 'basic' || plan === 'básico') {
      return courseLevel === 'beginner'
        ? 'Tienes acceso con tu plan Basic'
        : `Tu plan Basic solo incluye cursos beginner`;
    }
    return 'Verifica tu plan';
  }

  getAccessLabel(level: string): string {
    const icon = this.getAccessIcon(level);
    return icon === 'check_circle' ? 'Acceso' : 'Bloqueado';
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.courseService
      .getCourses({
        page: this.currentPage(),
        per_page: this.pageSize,
        ...(this.level ? { level: this.level } : {}),
        ...(this.category ? { category_id: this.category } : {}),
        ...(this.search ? { search: this.search } : {}),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          if (response.data && response.data.courses) {
            this.courses.set(response.data.courses);
          } else if (Array.isArray(response.data)) {
            this.courses.set(response.data);
          } else {
            this.courses.set([]);
          }
          this.totalItems.set(response.meta?.total || 0);
          this.loading = false;
        },
        error: () => {
          this.courses.set([]);
          this.loading = false;
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize = event.pageSize;
    this.loadCourses();
  }
}