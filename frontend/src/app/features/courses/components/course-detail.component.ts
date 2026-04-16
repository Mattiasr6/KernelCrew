import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../core/models';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="course-detail-container">
      @if (loading) {
        <div class="loading">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (course()) {
        <div class="breadcrumb"><a routerLink="/courses">Cursos</a> / {{ course()!.title }}</div>

        <div class="course-header">
          <div class="header-content">
            <mat-chip-set>
              <mat-chip [class]="course()!.level">{{ course()!.level }}</mat-chip>
              <mat-chip>{{ course()!.category }}</mat-chip>
            </mat-chip-set>
            <h1>{{ course()!.title }}</h1>
            <p class="short-description">{{ course()!.short_description }}</p>

            <div class="meta-info">
              <span><mat-icon>schedule</mat-icon> {{ course()!.duration }} horas</span>
              <span
                ><mat-icon>person</mat-icon> {{ course()!.instructor_name || 'Instructor' }}</span
              >
              <span class="price">\${{ course()!.price }}</span>
            </div>

            @if (!enrolled) {
              <button mat-raised-button color="primary" (click)="enroll()">Inscribirse</button>
            } @else {
              <button mat-raised-button color="accent" disabled>Ya estás inscrito</button>
            }
          </div>
          <div class="header-image">
            <img
              [src]="course()!.thumbnail || 'https://placehold.co/600x400?text=Course'"
              [alt]="course()!.title"
            />
          </div>
        </div>

        <mat-divider></mat-divider>

        <div class="course-content">
          <section>
            <h2>Descripción</h2>
            <p>{{ course()!.description }}</p>
          </section>

          <section>
            <h2>Requisitos</h2>
            <ul>
              <li>Conocimientos básicos de programación</li>
              <li>Computadora con acceso a internet</li>
            </ul>
          </section>

          <section>
            <h2>Lo que aprenderás</h2>
            <ul>
              <li>Comprender los fundamentos del área</li>
              <li>Desarrollar proyectos prácticos</li>
              <li>Mejores prácticas y patrones de diseño</li>
            </ul>
          </section>
        </div>
      } @else {
        <div class="not-found">
          <h2>Curso no encontrado</h2>
          <a routerLink="/courses" mat-raised-button color="primary">Volver al catálogo</a>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .course-detail-container {
        max-width: 1000px;
        margin: 0 auto;
        padding: 20px;
      }
      .breadcrumb {
        margin-bottom: 20px;
        a {
          color: #1976d2;
          text-decoration: none;
        }
      }
      .loading,
      .not-found {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px;
        gap: 20px;
      }
      .course-header {
        display: grid;
        grid-template-columns: 1fr 400px;
        gap: 40px;
        margin-bottom: 40px;
      }
      @media (max-width: 768px) {
        .course-header {
          grid-template-columns: 1fr;
        }
      }
      .header-content {
        mat-chip-set {
          margin-bottom: 16px;
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
        h1 {
          font-size: 32px;
          margin: 16px 0;
          color: #333;
        }
        .short-description {
          font-size: 18px;
          color: #666;
          margin-bottom: 20px;
        }
        .meta-info {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 24px;
          align-items: center;
          span {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #666;
          }
          .price {
            font-size: 28px;
            font-weight: bold;
            color: #1976d2;
          }
        }
      }
      .header-image img {
        width: 100%;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      }
      .course-content {
        padding: 20px 0;
        section {
          margin-bottom: 32px;
          h2 {
            margin-bottom: 16px;
            color: #333;
          }
          p,
          ul li {
            color: #666;
            line-height: 1.6;
          }
          ul {
            padding-left: 20px;
            li {
              margin-bottom: 8px;
            }
          }
        }
      }
    `,
  ],
})
export class CourseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courseService = inject(CourseService);
  private snackBar = inject(MatSnackBar);

  course = signal<Course | null>(null);
  loading = true;
  enrolled = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCourse(+id);
    }
  }

  loadCourse(id: number): void {
    this.courseService.getCourse(id).subscribe({
      next: (response) => {
        this.course.set(response);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  enroll(): void {
    this.snackBar.open('Redirigiendo a pago...', 'Cerrar', { duration: 3000 });
    this.router.navigate(['/checkout'], { queryParams: { courseId: this.course()?.id } });
  }
}
