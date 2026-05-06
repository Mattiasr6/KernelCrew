import { Component, inject, OnInit, signal, computed, Provider, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CourseService } from '../../../core/services/course.service';
import { Course, Category } from '../../../core/models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatProgressSpinnerModule, MatIconModule,
  ],
  template: `
    <div class="min-h-screen bg-zinc-950 px-4 py-8">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl mb-2">Catálogo de Cursos</h1>
        <p class="text-zinc-400 text-sm mb-8">Explora nuestra biblioteca de cursos técnicos</p>

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
          @for (group of groupedCourses(); track group.name) {
            <section class="mb-10">
              <div class="flex items-center justify-between mb-5">
                <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-zinc-50">{{ group.name }}</h2>
                <span class="text-xs text-zinc-600">{{ group.courses.length }} curso{{ group.courses.length !== 1 ? 's' : '' }}</span>
              </div>

              <div class="flex overflow-x-auto gap-4 pb-4"
                   style="scroll-behavior: smooth; -webkit-overflow-scrolling: touch; scrollbar-width: none; -ms-overflow-style: none;">
                @for (course of group.courses; track course.id) {
                  <a class="course-card w-72 sm:w-80 flex-shrink-0 snap-start"
                     [routerLink]="['/courses', course.id]" tabindex="0">
                    <div class="relative">
                      <img
                        [src]="course.thumbnail || 'https://placehold.co/600x400/18181b/06b6d4?text=Course'"
                        [alt]="course.title"
                        class="w-full h-44 object-cover"
                      />
                      <div class="absolute inset-0 bg-gradient-to-t from-zinc-900/90 to-transparent"></div>
                      <div class="absolute top-3 left-3">
                        <span class="badge" [class]="'badge-' + course.level">
                          {{ course.level === 'beginner' ? 'Inicial' : course.level === 'intermediate' ? 'Intermedio' : 'Avanzado' }}
                        </span>
                      </div>
                    </div>

                    <div class="p-4 flex flex-col flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <span class="material-symbols-outlined text-amber-400 text-[16px]" style="font-variation-settings: 'FILL' 1;">star</span>
                        <span class="text-zinc-50 text-sm font-bold">{{ course.average_rating || '4.5' }}</span>
                        <span class="text-zinc-600 text-xs">({{ course.reviews_count || 0 }})</span>
                      </div>

                      <h3 class="text-base font-semibold text-zinc-100 mb-1.5 line-clamp-2 leading-snug">{{ course.title }}</h3>
                      <p class="text-xs text-zinc-500 line-clamp-2 mb-3 flex-1">{{ course.short_description || course.description }}</p>

                      <div class="flex items-center justify-between pt-3 border-t border-zinc-800">
                        <span class="text-xs text-zinc-600">{{ course.duration_hours || course.duration }} horas</span>
                        @if (course.price_in_credits && course.price_in_credits > 0) {
                          <span class="flex items-center gap-1 text-sm font-bold text-amber-400">
                            <span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">database</span>
                            {{ course.price_in_credits }}
                          </span>
                        } @else {
                          <span class="text-xs font-semibold text-emerald-400">GRATIS</span>
                        }
                      </div>
                    </div>
                  </a>
                }
              </div>
            </section>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .course-card {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 14px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
      text-decoration: none;
    }
    .course-card:hover {
      transform: translateY(-4px);
      border-color: #06b6d4;
      box-shadow: 0 0 25px rgba(6, 182, 212, 0.18);
    }
    
    .badge {
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .badge-beginner { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.25); }
    .badge-intermediate { background: rgba(6, 182, 212, 0.15); color: #06b6d4; border: 1px solid rgba(6, 182, 212, 0.25); }
    .badge-advanced { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; border: 1px solid rgba(139, 92, 246, 0.25); }
    
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class CourseListComponent implements OnInit {
  private courseService = inject(CourseService);
  private destroyRef = inject(DestroyRef);

  courses = signal<Course[]>([]);
  categories = signal<Category[]>([]);
  loading = false;

  groupedCourses = computed(() => {
    const all = this.courses();
    const groups = new Map<string, Course[]>();
    const uncategorized: Course[] = [];

    for (const course of all) {
      const cat = (course as any).category;
      const name = cat?.name || null;
      if (name) {
        if (!groups.has(name)) groups.set(name, []);
        groups.get(name)!.push(course);
      } else {
        uncategorized.push(course);
      }
    }

    const result: { name: string; courses: Course[] }[] = [];
    for (const [name, courses] of groups) {
      result.push({ name, courses });
    }
    if (uncategorized.length > 0) {
      result.push({ name: 'Otros', courses: uncategorized });
    }
    return result;
  });

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.courseService.getCourses({ per_page: 50 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          if (response.data && response.data.courses) {
            this.courses.set(response.data.courses);
          } else {
            this.courses.set([]);
          }
          this.loading = false;
        },
        error: () => {
          this.courses.set([]);
          this.loading = false;
        },
      });
  }
}