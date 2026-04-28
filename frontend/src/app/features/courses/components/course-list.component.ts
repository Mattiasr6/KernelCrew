import { Component, inject, OnInit, signal, Provider } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent, MatPaginatorIntl } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../core/models';

class SpanishPaginatorIntl extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Ver:';
  override nextPageLabel = 'Sig.';
  override previousPageLabel = 'Ant.';
  override getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) return `0 de ${length}`;
    return `${page + 1} de ${Math.ceil(length / pageSize)}`;
  };
}

@Component({
  selector: 'app-course-list',
  standalone: true,
  providers: [{ provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl }],
  imports: [
    CommonModule, RouterLink, FormsModule, MatSelectModule, 
    MatPaginatorModule, MatProgressSpinnerModule, MatIconModule,
  ],
  template: `
    <div class="min-h-screen bg-[#050510] text-white p-4 md:p-10">
      
      <div class="text-center mb-16 animate-fade-in-down">
        <h1 class="text-5xl md:text-7xl font-black uppercase italic tracking-tighter bg-gradient-to-b from-white via-cyan-300 to-cyan-600 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,217,255,0.6)]">
          Catálogo
        </h1>
        <div class="h-1 w-24 bg-cyan-500 mx-auto rounded-full shadow-[0_0_10px_#00d9ff] mt-2 mb-2"></div>
        <p class="text-cyan-400/40 font-mono text-[10px] tracking-[0.4em]">DATABASE_ACCESS_GRANTED</p>
      </div>

      <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 p-6 mb-12 bg-[#0a0a1f]/60 backdrop-blur-xl border border-cyan-500/20 rounded-xl shadow-2xl">
        <div class="flex flex-col gap-1">
          <span class="text-[9px] font-bold text-cyan-500 uppercase ml-1">Search</span>
          <input [(ngModel)]="search" (input)="onSearch()" placeholder="Buscar..." class="bg-black/40 border border-cyan-500/30 rounded p-2.5 text-sm outline-none focus:border-cyan-400 transition-all text-white placeholder:text-cyan-900" />
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-[9px] font-bold text-cyan-500 uppercase ml-1">Level</span>
          <mat-select [(ngModel)]="level" (selectionChange)="onSearch()" class="custom-neon-select bg-black/40 border border-cyan-500/30 rounded p-1.5 text-sm">
            <mat-option value="">Todos</mat-option>
            <mat-option value="beginner">Principiante</mat-option>
            <mat-option value="intermediate">Intermedio</mat-option>
            <mat-option value="advanced">Avanzado</mat-option>
          </mat-select>
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-[9px] font-bold text-cyan-500 uppercase ml-1">Category</span>
          <mat-select [(ngModel)]="category" (selectionChange)="onSearch()" class="custom-neon-select bg-black/40 border border-cyan-500/30 rounded p-1.5 text-sm">
            <mat-option value="">Todas</mat-option>
            @for (cat of categories; track cat) { <mat-option [value]="cat">{{ cat }}</mat-option> }
          </mat-select>
        </div>

        <button (click)="loadCourses()" class="h-[42px] self-end bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded text-xs tracking-widest transition-all uppercase shadow-[0_0_15px_rgba(0,217,255,0.3)] active:scale-95">
          Actualizar
        </button>
      </div>

      @if (loading) {
        <div class="flex flex-col items-center py-40 gap-4">
          <mat-spinner diameter="50" class="custom-spinner"></mat-spinner>
          <span class="text-cyan-400 font-mono text-xs animate-pulse">SYNCHRONIZING...</span>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
          @for (course of courses(); track course.id) {
            <div [routerLink]="['/courses', course.id]" class="group flex flex-col bg-[#131325] border border-white/5 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(0,0,0,0.7)] hover:-translate-y-2">
              
              <div class="relative h-48 overflow-hidden">
                <img [src]="course.thumbnail || 'https://placehold.co/600x400/0a0a1f/00d9ff?text=CodeCore'" 
                     class="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                
                <div class="absolute top-4 left-4">
                  <span class="text-[10px] px-3 py-1 rounded-lg border border-white/20 bg-black/40 backdrop-blur-md text-white font-medium tracking-tight">
                    {{ course.level }}
                  </span>
                </div>
              </div>

              <div class="p-6 flex flex-col flex-grow">
                <h3 class="text-lg font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                  {{ course.title }}
                </h3>
                
                <p class="text-gray-500 text-xs mb-8">
                  {{ course.short_description || 'CodeCore Academy' }}
                </p>

                <div class="mt-auto flex justify-between items-center">
                  <span class="text-gray-400 text-xs font-medium">
                    {{ course.duration_hours || course.duration }} horas
                  </span>
                  <span class="text-cyan-400 font-bold text-sm">
                    Bs. {{ course.price }}
                  </span>
                </div>
              </div>
            </div>
          }
        </div>

        <div class="max-w-4xl mx-auto paginator-container p-2 rounded-full border border-cyan-500/10 bg-[#0a0a1f]/80 backdrop-blur-md shadow-2xl">
          <mat-paginator
            [length]="totalItems()" 
            [pageSize]="pageSize"
            [pageIndex]="currentPage() - 1" 
            [pageSizeOptions]="[8, 16, 32]"
            (page)="onPageChange($event)"
            class="neon-paginator">
          </mat-paginator>
        </div>
      }
    </div>
  `,
  styles: [`
    /* Animación */
    @keyframes fadeInDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-down { animation: fadeInDown 0.6s ease-out; }

    /* Estilo Neón para Selects */
    :host ::ng-deep .custom-neon-select .mat-mdc-select-value { color: #00d9ff !important; font-weight: bold; }
    ::ng-deep .mat-mdc-select-panel { background: #0a0a1f !important; border: 1px solid #00d9ff !important; }
    ::ng-deep .mat-mdc-option { color: #9ca3af !important; font-size: 13px !important; }
    ::ng-deep .mat-mdc-option:hover { background: rgba(0, 217, 255, 0.1) !important; color: #00d9ff !important; }

    /* Paginación Neón */
    :host ::ng-deep .neon-paginator {
      background: transparent !important;
      color: #00d9ff !important;
      display: flex;
      justify-content: center;
    }

    :host ::ng-deep .mat-mdc-paginator-navigation-next, 
    :host ::ng-deep .mat-mdc-paginator-navigation-previous {
      color: #00d9ff !important;
      transition: all 0.3s;
    }

    :host ::ng-deep .mat-mdc-paginator-navigation-next:hover, 
    :host ::ng-deep .mat-mdc-paginator-navigation-previous:hover {
      background: rgba(0, 217, 255, 0.1) !important;
    }

    /* Spinner */
    ::ng-deep .custom-spinner circle { stroke: #00d9ff !important; }
  `]
})
export class CourseListComponent implements OnInit {
  private courseService = inject(CourseService);
  courses = signal<Course[]>([]);
  totalItems = signal(0);
  currentPage = signal(1);
  pageSize = 8; 
  search = '';
  level = '';
  category = '';
  loading = false;
  categories = ['Desarrollo Web', 'Móvil', 'Data Science', 'DevOps', 'Diseño', 'Negocios'];

  ngOnInit(): void { this.loadCourses(); }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.courseService.getCourses({
      page: this.currentPage(),
      per_page: this.pageSize,
      level: this.level || undefined,
      category: this.category || undefined,
      search: this.search || undefined,
    }).subscribe({
      next: (res: any) => {
        this.courses.set(res.data.courses || res.data);
        this.totalItems.set(res.meta.total || 0);
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize = event.pageSize;
    this.loadCourses();
  }
}