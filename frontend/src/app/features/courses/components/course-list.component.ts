import { Component, inject, OnInit, signal, Provider } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent, MatPaginatorIntl } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { CourseService } from '../../../core/services/course.service';
import { Course, CoursesResponse } from '../../../core/models';

class SpanishPaginatorIntl extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Ítems por página';
  override nextPageLabel = 'Siguiente página';
  override previousPageLabel = 'Página anterior';
  override firstPageLabel = 'Primera página';
  override lastPageLabel = 'Última página';

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize < length ? startIndex + pageSize : length;
    return `${startIndex + 1} – ${endIndex} de ${length}`;
  };
}

@Component({
  selector: 'app-course-list',
  standalone: true,
  providers: [
    { provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl } as Provider,
  ],
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  template: `
    <div class="courses-container">
      <h1>Catálogo de Cursos</h1>

      <div class="filters">
        <mat-form-field appearance="outline">
          <mat-label>Buscar</mat-label>
          <input
            matInput
            [(ngModel)]="search"
            placeholder="Buscar cursos..."
            (input)="onSearch()"
          />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Nivel</mat-label>
          <mat-select [(ngModel)]="level" (selectionChange)="onSearch()">
            <mat-option value="">Todos</mat-option>
            <mat-option value="beginner">Principiante</mat-option>
            <mat-option value="intermediate">Intermedio</mat-option>
            <mat-option value="advanced">Avanzado</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Categoría</mat-label>
          <mat-select [(ngModel)]="category" (selectionChange)="onSearch()">
            <mat-option value="">Todas</mat-option>
            @for (cat of categories; track cat) {
              <mat-option [value]="cat">{{ cat }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <button mat-raised-button class="search-btn" (click)="loadCourses()">Buscar</button>
      </div>

      @if (loading) {
        <div class="loading">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (courses().length === 0) {
        <div class="no-courses">
          <p>No se encontraron cursos</p>
        </div>
      } @else {
        <div class="courses-grid">
          @for (course of courses(); track course.id) {
            <mat-card class="glass-card course-card" [routerLink]="['/courses', course.id]">
              <img
                mat-card-image
                [src]="course.thumbnail || 'https://placehold.co/600x400?text=Course'"
                [alt]="course.title"
              />
              <mat-card-content>
                <mat-chip-set>
                  <mat-chip [class]="course.level">{{ course.level }}</mat-chip>
                </mat-chip-set>
                <h3>{{ course.title }}</h3>
                <p class="description">{{ course.short_description || course.description }}</p>
                <div class="course-info">
                  <span>{{ course.duration_hours || course.duration }} horas</span>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>

        <mat-paginator
          [length]="totalItems()"
          [pageSize]="pageSize"
          [pageIndex]="currentPage() - 1"
          [pageSizeOptions]="[10, 20, 50]"
          (page)="onPageChange($event)"
        >
        </mat-paginator>
      }
    </div>
  `,
  styles: [
    `
      .courses-container {
        background: var(--bg-primary);
        min-height: 100vh;
        padding: 32px;
        max-width: 1200px;
        margin: 0 auto;
      }
      h1 {
        margin-bottom: 24px;
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-size: 2rem;
      }
      .filters {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 24px;
      }
      .filters mat-form-field {
        flex: 1;
        min-width: 200px;
      }
      .loading,
      .no-courses {
        display: flex;
        justify-content: center;
        padding: 60px;
        color: var(--text-secondary);
      }
      .courses-grid {
        display: grid;
        gap: 24px;
        grid-template-columns: repeat(1, 1fr);
        margin-bottom: 24px;
      }
      @media (min-width: 769px) and (max-width: 1024px) {
        .courses-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (min-width: 1025px) {
        .courses-grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }
      .glass-card {
        background: var(--glass-bg) !important;
        border: 1px solid var(--glass-border) !important;
        border-radius: 16px !important;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
        transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        backdrop-filter: blur(10px);
        cursor: pointer;
      }
      .glass-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 32px rgba(108, 99, 255, 0.2);
        border-color: var(--accent-primary) !important;
      }
      .course-card img {
        height: 180px;
        object-fit: cover;
        border-radius: 16px 16px 0 0;
      }
      mat-card-content {
        padding: 16px;
      }
      mat-chip-set {
        margin-bottom: 8px;
      }
      mat-chip.beginner {
        background-color: #4caf50 !important;
        color: white !important;
      }
      mat-chip.intermediate {
        background-color: #ff9800 !important;
        color: white !important;
      }
      mat-chip.advanced {
        background-color: #f44336 !important;
        color: white !important;
      }
      h3 {
        margin: 8px 0;
        font-size: 18px;
        color: var(--text-primary) !important;
      }
      .description {
        color: var(--text-secondary);
        font-size: 14px;
        margin-bottom: 12px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .course-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: var(--text-secondary);
        font-size: 14px;
      }
      .price {
        font-weight: bold;
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-size: 18px;
      }
      mat-paginator {
        background: var(--bg-surface) !important;
        border-radius: 8px;
        margin-top: 16px;
      }
      .search-btn {
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)) !important;
        color: white !important;
        height: 56px;
      }

      .search-btn:hover {
        box-shadow: 0 4px 16px rgba(108, 99, 255, 0.4);
      }
    `,
  ],
})
export class CourseListComponent implements OnInit {
  private courseService = inject(CourseService);

  courses = signal<Course[]>([]);
  totalItems = signal(0);
  currentPage = signal(1);
  pageSize = 10;

  search = '';
  level = '';
  category = '';

  loading = false;

  categories = ['Desarrollo Web', 'Móvil', 'Data Science', 'DevOps', 'Diseño', 'Negocios'];

  ngOnInit(): void {
    setTimeout(() => this.loadCourses(), 100);
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
        level: this.level || undefined,
        category: this.category || undefined,
        search: this.search || undefined,
      })
      .subscribe({
        next: (response) => {
          this.courses.set(response.data.courses);
          this.totalItems.set(response.data.meta.total);
          this.loading = false;
        },
        error: () => {
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
