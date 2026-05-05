import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { LandingService } from './services/landing.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <!-- HERO -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="max-w-7xl mx-auto px-4 md:px-6 py-16 sm:py-24 md:py-36 relative z-10 text-center">
        <div class="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
          <span class="material-symbols-outlined text-cyan-400 text-sm">bolt</span>
          <span class="text-xs font-medium text-cyan-400 uppercase tracking-wider">Plataforma basada en créditos</span>
        </div>
        <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter text-zinc-50 leading-[1.05] mb-6">
          Domina el Código.<br>
          <span class="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">Acumula Créditos.</span><br>
          Certifícate.
        </h1>
        <p class="max-w-2xl mx-auto text-base sm:text-lg text-zinc-400 leading-relaxed mb-10">
          Compra créditos, inscríbete en cursos técnicos y obtén certificados verificables
          que validan tu dominio real del kernel y el desarrollo de software.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a mat-flat-button routerLink="/courses" class="hero-btn-primary w-full sm:w-auto sm:min-w-[200px] inline-flex items-center justify-center gap-2">
            <span class="material-symbols-outlined">explore</span>
            Explorar Cursos
          </a>
          @if (isAuthenticated()) {
            <a mat-stroked-button routerLink="/my-courses" class="hero-btn-secondary w-full sm:w-auto sm:min-w-[200px] inline-flex items-center justify-center gap-2">
              <span class="material-symbols-outlined">school</span>
              Ir a mi Dashboard
            </a>
          } @else {
            <a mat-stroked-button routerLink="/register" class="hero-btn-secondary w-full sm:w-auto sm:min-w-[200px] inline-flex items-center justify-center gap-2">
              <span class="material-symbols-outlined">person_add</span>
              Unirse Ahora
            </a>
          }
        </div>
      </div>
    </section>

    <!-- VALUE PROPOSITION -->
    <section class="py-12 md:py-24 bg-zinc-900">
      <div class="max-w-7xl mx-auto px-4 md:px-6">
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-50 mb-4">
            ¿Por qué <span class="text-cyan-400">KernelLearn</span>?
          </h2>
          <p class="max-w-xl mx-auto text-base text-zinc-400">
            Un ecosistema diferente donde cada curso completado te acerca a tu próxima certificación.
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Card 1: Credits -->
          <div class="value-card">
            <div class="value-icon value-icon-amber">
              <span class="material-symbols-outlined text-3xl" style="font-variation-settings: 'FILL' 1;">database</span>
            </div>
            <h3 class="text-lg font-semibold text-zinc-100 mb-3">Economía por Créditos</h3>
            <p class="text-sm text-zinc-400 leading-relaxed">
              Compra paquetes de créditos una sola vez. Inscríbete en los cursos que quieras sin suscripciones mensuales. Tú decides cuándo y en qué invertir.
            </p>
          </div>
          <!-- Card 2: Certificates -->
          <div class="value-card">
            <div class="value-icon value-icon-cyan">
              <span class="material-symbols-outlined text-3xl" style="font-variation-settings: 'FILL' 1;">verified</span>
            </div>
            <h3 class="text-lg font-semibold text-zinc-100 mb-3">Certificados Verificables</h3>
            <p class="text-sm text-zinc-400 leading-relaxed">
              Al completar un curso, generas un certificado con código único verificable públicamente. Compártelo en LinkedIn o preséntalo en entrevistas técnicas.
            </p>
          </div>
          <!-- Card 3: Self-paced -->
          <div class="value-card">
            <div class="value-icon value-icon-emerald">
              <span class="material-symbols-outlined text-3xl" style="font-variation-settings: 'FILL' 1;">pace</span>
            </div>
            <h3 class="text-lg font-semibold text-zinc-100 mb-3">A tu Ritmo</h3>
            <p class="text-sm text-zinc-400 leading-relaxed">
              Sin fechas límite, sin presión. Avanza lección por lección a la velocidad que necesites. La plataforma guarda tu progreso automáticamente.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURED COURSES -->
    <section class="py-12 md:py-24 bg-zinc-950">
      <div class="max-w-7xl mx-auto px-4 md:px-6">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
          <div>
            <h2 class="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-50 mb-3">
              Cursos <span class="text-cyan-400">Destacados</span>
            </h2>
            <p class="text-base text-zinc-400">
              Los más populares entre nuestra comunidad de developers.
            </p>
          </div>
          <a routerLink="/courses" class="flex items-center gap-1 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors shrink-0">
            Ver catálogo completo
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
        </div>

        @if (featuredCourses().length === 0) {
          <div class="border-dashed border-2 border-zinc-800 rounded-xl p-8 md:p-16 text-center">
            <span class="material-symbols-outlined text-5xl text-zinc-700 block mb-4">school</span>
            <p class="text-zinc-500 text-lg">Pronto publicaremos nuestros primeros cursos.</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (course of featuredCourses(); track course.id) {
              <a [routerLink]="['/courses', course.id]" class="featured-card">
                <div class="relative">
                  <div class="card-thumbnail">
                    @if (course.thumbnail) {
                      <img [src]="course.thumbnail" [alt]="course.title" class="w-full h-full object-cover" />
                    } @else {
                      <div class="w-full h-full bg-zinc-800 flex items-center justify-center">
                        <span class="material-symbols-outlined text-5xl text-zinc-700">code_blocks</span>
                      </div>
                    }
                    <div class="absolute inset-0 bg-gradient-to-t from-zinc-900/90 to-transparent"></div>
                  </div>
                  <div class="absolute top-3 left-3">
                    <span class="level-badge" [class]="'level-' + course.level">
                      {{ course.level === 'beginner' ? 'Inicial' : course.level === 'intermediate' ? 'Intermedio' : 'Avanzado' }}
                    </span>
                  </div>
                  @if (course.category) {
                    <div class="absolute top-3 right-3">
                      <span class="bg-zinc-900/80 backdrop-blur-sm text-zinc-300 px-2.5 py-1 rounded-full text-[11px] font-medium border border-zinc-700">
                        {{ course.category.name }}
                      </span>
                    </div>
                  }
                </div>
                <div class="p-5 flex flex-col flex-1">
                  <div class="flex items-center gap-2 mb-3">
                    <div class="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                      @if (course.instructor?.avatar_url) {
                        <img [src]="course.instructor.avatar_url" class="w-full h-full object-cover" />
                      } @else {
                        <span class="text-[10px] font-bold text-cyan-400">{{ (course.instructor?.name || '?')[0] }}</span>
                      }
                    </div>
                    <span class="text-xs text-zinc-500 truncate">{{ course.instructor?.name }}</span>
                    <span class="text-zinc-700">·</span>
                    <div class="flex items-center gap-1">
                      <span class="material-symbols-outlined text-amber-400 text-[14px]" style="font-variation-settings: 'FILL' 1;">star</span>
                      <span class="text-xs font-bold text-zinc-300">{{ course.rating_avg | number:'1.1-1' }}</span>
                    </div>
                  </div>
                  <h3 class="text-lg font-semibold text-zinc-100 mb-2 line-clamp-2">{{ course.title }}</h3>
                  <p class="text-sm text-zinc-400 line-clamp-2 mb-4 flex-1">{{ course.description }}</p>
                  <div class="flex items-center justify-between pt-3 border-t border-zinc-800">
                    <span class="text-xs text-zinc-600">{{ course.students_count }} estudiantes</span>
                    @if (course.price_in_credits > 0) {
                      <span class="flex items-center gap-1 text-base font-bold text-amber-400">
                        <span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">database</span>
                        {{ course.price_in_credits }}
                      </span>
                    } @else {
                      <span class="text-sm font-semibold text-emerald-400">GRATIS</span>
                    }
                  </div>
                </div>
              </a>
            }
          </div>
        }
      </div>
    </section>

    <!-- FINAL CTA -->
    <section class="py-12 md:py-24 bg-zinc-900">
      <div class="max-w-3xl mx-auto px-4 md:px-6 text-center">
        <div class="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-6 sm:p-10 md:p-14">
          <span class="material-symbols-outlined text-5xl text-cyan-400 mb-4 block" style="font-variation-settings: 'FILL' 1;">rocket_launch</span>
          <h2 class="text-2xl sm:text-3xl font-bold text-zinc-50 mb-4">Empieza hoy, sin costo</h2>
          <p class="text-base text-zinc-400 mb-8 max-w-lg mx-auto">
            Crea tu cuenta, recibe créditos de bienvenida y comienza tu primer curso ahora mismo.
          </p>
          @if (isAuthenticated()) {
            <a mat-flat-button routerLink="/my-courses" class="hero-btn-primary min-w-[180px]">
              Ir a mi Dashboard
            </a>
          } @else {
            <a mat-flat-button routerLink="/register" class="hero-btn-primary min-w-[180px]">
              Crear Cuenta Gratis
            </a>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* === HERO === */
    .hero {
      position: relative;
      background: #09090b;
      overflow: hidden;
    }
    .hero-bg {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 80% 60% at 50% 0%, rgba(6, 182, 212, 0.08), transparent),
        radial-gradient(ellipse 40% 50% at 80% 80%, rgba(139, 92, 246, 0.06), transparent),
        radial-gradient(ellipse 40% 50% at 20% 80%, rgba(6, 182, 212, 0.04), transparent);
    }
    .hero-btn-primary {
      background: linear-gradient(135deg, #06b6d4, #0891b2) !important;
      color: #fff !important;
      border-radius: 10px !important;
      padding: 12px 28px !important;
      font-weight: 600 !important;
      font-size: 0.95rem !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 8px !important;
      box-shadow: 0 0 20px rgba(6, 182, 212, 0.25) !important;
      transition: all 0.2s ease-in-out !important;
    }
    .hero-btn-primary:hover {
      box-shadow: 0 0 30px rgba(6, 182, 212, 0.45) !important;
      transform: translateY(-1px);
    }
    .hero-btn-secondary {
      color: #a1a1aa !important;
      border: 1px solid #3f3f46 !important;
      border-radius: 10px !important;
      padding: 12px 28px !important;
      font-weight: 500 !important;
      font-size: 0.95rem !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 8px !important;
      transition: all 0.2s ease-in-out !important;
    }
    .hero-btn-secondary:hover {
      color: #fafafa !important;
      border-color: #06b6d4 !important;
      background: rgba(6, 182, 212, 0.05) !important;
    }

    /* === VALUE CARDS === */
    .value-card {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 16px;
      padding: 32px 28px;
      transition: all 0.3s ease;
    }
    .value-card:hover {
      border-color: #3f3f46;
      transform: translateY(-2px);
    }
    .value-icon {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }
    .value-icon-amber {
      background: rgba(245, 158, 11, 0.12);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.2);
    }
    .value-icon-cyan {
      background: rgba(6, 182, 212, 0.12);
      color: #06b6d4;
      border: 1px solid rgba(6, 182, 212, 0.2);
    }
    .value-icon-emerald {
      background: rgba(16, 185, 129, 0.12);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.2);
    }

    /* === FEATURED COURSE CARDS === */
    .featured-card {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 14px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
      cursor: pointer;
      text-decoration: none;
    }
    .featured-card:hover {
      transform: translateY(-4px);
      border-color: #06b6d4;
      box-shadow: 0 0 25px rgba(6, 182, 212, 0.18);
    }
    .card-thumbnail {
      width: 100%;
      height: 180px;
      overflow: hidden;
    }

    /* === LEVEL BADGES === */
    .level-badge {
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .level-beginner {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.25);
    }
    .level-intermediate {
      background: rgba(6, 182, 212, 0.15);
      color: #06b6d4;
      border: 1px solid rgba(6, 182, 212, 0.25);
    }
    .level-advanced {
      background: rgba(139, 92, 246, 0.15);
      color: #8b5cf6;
      border: 1px solid rgba(139, 92, 246, 0.25);
    }
  `],
})
export class LandingComponent implements OnInit {
  landingService = inject(LandingService);
  authService = inject(AuthService);

  featuredCourses = this.landingService.featuredCourses;
  isAuthenticated = this.authService.isAuthenticated;

  ngOnInit(): void {
    this.landingService.fetchFeaturedCourses();
  }
}
