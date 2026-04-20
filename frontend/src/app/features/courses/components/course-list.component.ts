import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { CourseService, CourseFilters } from '../../../core/services/course.service';
import { Course } from '../../../core/models';

@Component({
  selector: 'app-course-list',
  standalone: true,
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
    MatIconModule,
  ],
  template: `
    <div class="courses-container">
      <h1>Catálogo de Cursos</h1>

      @if (errorMessage()) {
        <div class="error-alert">
          <mat-icon>error</mat-icon>
          <span>{{ errorMessage() }}</span>
        </div>
      }

      <div class="filters">
        <mat-form-field appearance="outline">
          <mat-label>Buscar</mat-label>
          <input
            matInput
            [(ngModel)]="search"
            placeholder="Buscar cursos..."
            (keyup.enter)="loadCourses()"
          />
          <button mat-icon-button matSuffix (click)="loadCourses()">
            <mat-icon>search</mat-icon>
          </button>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Precio mínimo</mat-label>
          <input
            matInput
            type="number"
            [(ngModel)]="minPrice"
            placeholder="0"
            (change)="loadCourses()"
          />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Precio máximo</mat-label>
          <input
            matInput
            type="number"
            [(ngModel)]="maxPrice"
            placeholder="500"
            (change)="loadCourses()"
          />
        </mat-form-field>

        <button mat-raised-button color="primary" (click)="loadCourses()">
          <mat-icon>search</mat-icon>
          Buscar
        </button>
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
            <mat-card class="course-card" [routerLink]="['/courses', course.id]">
              <div class="card-header">
                <mat-chip [class]="course.status">
                  {{ course.status === 'published' ? 'Publicado' : 'Borrador' }}
                </mat-chip>
              </div>
              <mat-card-content>
                <h3>{{ course.title }}</h3>
                <p class="description">{{ course.description }}</p>
                <div class="course-info">
                  <span class="price">Bs. {{ course.price }}</span>
                  @if (course.instructor) {
                    <span class="instructor">{{ course.instructor.name }}</span>
                  }
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
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      h1 {
        margin-bottom: 24px;
        color: #333;
      }
      .error-alert {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 16px;
        background-color: #ffebee;
        color: #c62828;
        border-radius: 8px;
        margin-bottom: 16px;
      }
      .filters {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 24px;
      }
      .filters mat-form-field {
        flex: 1;
        min-width: 150px;
      }
      .loading,
      .no-courses {
        display: flex;
        justify-content: center;
        padding: 60px;
      }
      .courses-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 24px;
        margin-bottom: 24px;
      }
      .course-card {
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .course-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      }
      .card-header {
        padding: 16px 16px 0;
      }
      mat-card-content {
        padding: 16px;
      }
      mat-chip.published {
        background-color: #4caf50 !important;
        color: white !important;
      }
      mat-chip.draft {
        background-color: #ff9800 !important;
        color: white !important;
      }
      h3 {
        margin: 8px 0;
        font-size: 18px;
        color: #333;
      }
      .description {
        color: #666;
        font-size: 14px;
        margin-bottom: 12px;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .course-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #666;
        font-size: 14px;
      }
      .price {
        font-weight: bold;
        color: #1976d2;
        font-size: 18px;
      }
      .instructor {
        font-size: 12px;
        color: #999;
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
  minPrice: number | undefined;
  maxPrice: number | undefined;

  loading = false;
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.errorMessage.set(null);

    const filters: CourseFilters = {
      page: this.currentPage(),
      per_page: this.pageSize,
      search: this.search || undefined,
      min_price: this.minPrice,
      max_price: this.maxPrice,
    };

    this.courseService.getCourses(filters).subscribe({
      next: (response) => {
        if (response.success) {
          this.courses.set(response.data);
          this.totalItems.set(response.meta.total);
        } else {
          this.errorMessage.set(response.message || 'Error al cargar cursos');
          this.courses.set([]);
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage.set('Error de conexión con el servidor');
        this.loading = false;
        console.error('Error loading courses:', err);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize = event.pageSize;
    this.loadCourses();
  }
}
          </mat-select>
        </mat-form-field>

        <button mat-raised-button color="primary" (click)="loadCourses()">Buscar</button>
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
            <mat-card class="course-card" [routerLink]="['/courses', course.id]">
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
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      h1 {
        margin-bottom: 24px;
        color: #333;
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
      }
      .courses-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 24px;
        margin-bottom: 24px;
      }
      .course-card {
        cursor: pointer;
        transition:
          transform 0.2s,
          box-shadow 0.2s;
      }
      .course-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      }
      .course-card img {
        height: 180px;
        object-fit: cover;
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
        color: #333;
      }
      .description {
        color: #666;
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
        color: #666;
        font-size: 14px;
      }
      .price {
        font-weight: bold;
        color: #1976d2;
        font-size: 18px;
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
