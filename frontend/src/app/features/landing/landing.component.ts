import { Component, OnInit, AfterViewInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { LandingService } from './services/landing.service';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <!-- HERO -->
    <section class="hero" #heroSection>
      <canvas #particleCanvas class="particle-canvas"></canvas>
      <div class="hero-bg"></div>
      <div class="max-w-7xl mx-auto px-4 md:px-6 py-16 sm:py-24 md:py-36 relative z-10 text-center">
        <div class="hero-badge inline-flex items-center gap-2 mb-6 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
          <span class="material-symbols-outlined text-cyan-400 text-sm">bolt</span>
          <span class="text-xs font-medium text-cyan-400 uppercase tracking-wider">Plataforma basada en créditos</span>
        </div>
        <h1 class="hero-heading text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter text-zinc-50 leading-[1.05] mb-6">
          <span class="hero-line block">Domina el Código.</span>
          <span class="hero-line block bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">Acumula Créditos.</span>
          <span class="hero-line block">Certifícate.</span>
        </h1>
        <p class="hero-desc max-w-2xl mx-auto text-base sm:text-lg text-zinc-400 leading-relaxed mb-10">
          Compra créditos, inscríbete en cursos técnicos y obtén certificados verificables
          que validan tu dominio real del kernel y el desarrollo de software.
        </p>
        <div class="hero-actions flex flex-col sm:flex-row items-center justify-center gap-4">
          <a mat-flat-button routerLink="/courses" class="hero-btn-primary w-full sm:w-auto sm:min-w-[200px] inline-flex items-center justify-center gap-2">
            <span class="material-symbols-outlined" style="vertical-align:middle;line-height:1;font-size:1.2em">explore</span>
            Explorar Cursos
          </a>
          @if (isAuthenticated()) {
            <a mat-stroked-button routerLink="/my-courses" class="hero-btn-secondary w-full sm:w-auto sm:min-w-[200px] inline-flex items-center justify-center gap-2">
              <span class="material-symbols-outlined" style="vertical-align:middle;line-height:1;font-size:1.2em">school</span>
              Ir a mi Dashboard
            </a>
          } @else {
            <a mat-stroked-button routerLink="/register" class="hero-btn-secondary w-full sm:w-auto sm:min-w-[200px] inline-flex items-center justify-center gap-2">
              <span class="material-symbols-outlined" style="vertical-align:middle;line-height:1;font-size:1.2em">person_add</span>
              Unirse Ahora
            </a>
          }
        </div>
        <div class="scroll-indicator">
          <span class="scroll-text">Descubre más</span>
          <span class="scroll-arrow material-symbols-outlined">keyboard_double_arrow_down</span>
        </div>
      </div>
    </section>

    <!-- VALUE PROPOSITION -->
    <section class="py-12 md:py-24 bg-zinc-900" id="value-section">
      <div class="max-w-7xl mx-auto px-4 md:px-6">
        <div class="text-center mb-16">
          <div class="value-header">
            <h2 class="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-50 mb-4">
              ¿Por qué <span class="text-cyan-400">KernelLearn</span>?
            </h2>
            <p class="max-w-xl mx-auto text-base text-zinc-400">
              Un ecosistema diferente donde cada curso completado te acerca a tu próxima certificación.
            </p>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Card 1: Credits -->
          <div class="value-card stagger-card">
            <div class="value-icon value-icon-amber">
              <span class="material-symbols-outlined text-3xl" style="font-variation-settings: 'FILL' 1;">database</span>
            </div>
            <h3 class="text-lg font-semibold text-zinc-100 mb-3">Economía por Créditos</h3>
            <p class="text-sm text-zinc-400 leading-relaxed">
              Compra paquetes de créditos una sola vez. Inscríbete en los cursos que quieras sin suscripciones mensuales. Tú decides cuándo y en qué invertir.
            </p>
          </div>
          <!-- Card 2: Certificates -->
          <div class="value-card stagger-card">
            <div class="value-icon value-icon-cyan">
              <span class="material-symbols-outlined text-3xl" style="font-variation-settings: 'FILL' 1;">verified</span>
            </div>
            <h3 class="text-lg font-semibold text-zinc-100 mb-3">Certificados Verificables</h3>
            <p class="text-sm text-zinc-400 leading-relaxed">
              Al completar un curso, generas un certificado con código único verificable públicamente. Compártelo en LinkedIn o preséntalo en entrevistas técnicas.
            </p>
          </div>
          <!-- Card 3: Self-paced -->
          <div class="value-card stagger-card">
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
    <section class="py-12 md:py-24 bg-zinc-950" id="courses-section">
      <div class="max-w-7xl mx-auto px-4 md:px-6">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
          <div class="courses-header">
            <h2 class="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-50 mb-3">
              Cursos <span class="text-cyan-400">Destacados</span>
            </h2>
            <p class="text-base text-zinc-400">
              Los más populares entre nuestra comunidad de developers.
            </p>
          </div>
          <a routerLink="/courses" class="catalog-link flex items-center gap-1 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors shrink-0">
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
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 tilt-container">
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
                    @if (course.instructor; as instructor) {
                      <div class="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                        @if (instructor.avatar_url) {
                          <img [src]="instructor.avatar_url" class="w-full h-full object-cover" />
                        } @else {
                          <span class="text-[10px] font-bold text-cyan-400">{{ instructor.name[0] }}</span>
                        }
                      </div>
                      <span class="text-xs text-zinc-500 truncate">{{ instructor.name }}</span>
                      <span class="text-zinc-700">·</span>
                    }
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
    <section class="py-12 md:py-24 bg-zinc-900" id="cta-section">
      <div class="max-w-3xl mx-auto px-4 md:px-6 text-center">
        <div class="cta-card bg-zinc-800/50 border border-zinc-700 rounded-2xl p-6 sm:p-10 md:p-14">
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

    <!-- FOOTER -->
    <footer class="landing-footer">
      <div class="max-w-7xl mx-auto px-4 md:px-6">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="flex items-center gap-2 mb-3">
              <span class="material-symbols-outlined text-cyan-400">terminal</span>
              <span class="text-zinc-50 font-black text-lg tracking-tighter">Kernel<span class="text-cyan-400">Learn</span></span>
            </div>
            <p class="text-zinc-500 text-sm leading-relaxed max-w-xs">
              Plataforma educativa basada en créditos para developers. Aprende, acumula y certifícate.
            </p>
            <div class="footer-social">
              <a href="https://github.com/Mattiasr6/KernelCrew" target="_blank" rel="noopener" class="social-link" aria-label="GitHub">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
              </a>
              <a href="#" class="social-link" aria-label="Twitter">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" class="social-link" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
          <div class="footer-links">
            <h4 class="footer-links-title">Plataforma</h4>
            <a routerLink="/courses" class="footer-link">Catálogo de Cursos</a>
            <a routerLink="/subscriptions" class="footer-link">Planes</a>
            <a routerLink="/credits" class="footer-link">Créditos</a>
          </div>
          <div class="footer-links">
            <h4 class="footer-links-title">Recursos</h4>
            <a href="#" class="footer-link">Documentación</a>
            <a href="#" class="footer-link">API</a>
            <a href="#" class="footer-link">Blog</a>
          </div>
          <div class="footer-links">
            <h4 class="footer-links-title">Legal</h4>
            <a href="#" class="footer-link">Términos y Condiciones</a>
            <a href="#" class="footer-link">Política de Privacidad</a>
            <a href="#" class="footer-link">Contacto</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span class="text-zinc-600 text-xs">&copy; {{ currentYear }} KernelLearn. Todos los derechos reservados.</span>
          <span class="text-zinc-700 text-xs">Hecho con <span class="text-cyan-400">&#9829;</span> para la comunidad dev</span>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    /* === HERO === */
    .hero {
      position: relative;
      background: #09090b;
      overflow: hidden;
    }
    .particle-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
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
      animation: heroGlow 3s ease-in-out infinite;
    }
    .hero-btn-primary:hover {
      box-shadow: 0 0 30px rgba(6, 182, 212, 0.45) !important;
      transform: translateY(-1px);
    }
    @keyframes heroGlow {
      0%, 100% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.25); }
      50% { box-shadow: 0 0 30px rgba(6, 182, 212, 0.4), 0 0 60px rgba(139, 92, 246, 0.15); }
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
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .value-card:hover {
      transform: translateY(-4px) scale(1.01);
      border-color: #06b6d4;
      box-shadow: 0 0 0 1px rgba(6, 182, 212, 0.3), 0 0 25px rgba(6, 182, 212, 0.12);
    }
    .value-icon {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
    }
    .value-card:hover .value-icon {
      transform: scale(1.12);
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
    .tilt-container {
      perspective: 900px;
    }
    .featured-card {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 14px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: border-color 0.4s ease, box-shadow 0.4s ease;
      cursor: pointer;
      text-decoration: none;
      transform-style: preserve-3d;
      will-change: transform;
    }
    .featured-card:hover {
      border-color: #06b6d4;
      box-shadow: 0 0 25px rgba(6, 182, 212, 0.18);
    }
    .card-thumbnail {
      width: 100%;
      height: 180px;
      overflow: hidden;
    }

    /* Catalog link arrow hover */
    .catalog-link .material-symbols-outlined {
      transition: transform 0.2s ease;
    }
    .catalog-link:hover .material-symbols-outlined {
      transform: translateX(4px);
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
    /* === SCROLL INDICATOR === */
    .scroll-indicator {
      position: absolute;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      opacity: 0;
      animation: scrollFadeIn 0.8s ease-out 2s forwards;
    }
    @media (max-width: 640px) { .scroll-indicator { bottom: 20px; } }
    .scroll-text {
      font-size: 0.65rem;
      color: #52525b;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      font-weight: 600;
    }
    .scroll-arrow {
      font-size: 18px;
      color: #52525b;
      animation: scrollBounce 2s ease-in-out infinite;
    }
    @keyframes scrollFadeIn {
      to { opacity: 1; }
    }
    @keyframes scrollBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(6px); }
    }

    /* === FOOTER === */
    .landing-footer {
      background: #09090b;
      border-top: 1px solid #18181b;
      padding: 60px 0 0;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 40px;
      padding-bottom: 40px;
    }
    @media (min-width: 640px) {
      .footer-grid {
        grid-template-columns: 1.5fr 1fr 1fr 1fr;
      }
    }
    .footer-brand p {
      max-width: 300px;
    }
    .footer-social {
      display: flex;
      gap: 12px;
      margin-top: 20px;
    }
    .social-link {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #18181b;
      border: 1px solid #27272a;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #52525b;
      transition: all 0.2s ease;
      text-decoration: none;
    }
    .social-link:hover {
      color: #06b6d4;
      border-color: rgba(6, 182, 212, 0.3);
      background: rgba(6, 182, 212, 0.06);
    }
    .footer-links-title {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #a1a1aa;
      margin-bottom: 16px;
    }
    .footer-link {
      display: block;
      font-size: 0.85rem;
      color: #52525b;
      text-decoration: none;
      padding: 4px 0;
      transition: color 0.2s ease;
    }
    .footer-link:hover {
      color: #a1a1aa;
    }
    .footer-bottom {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 24px 0;
      border-top: 1px solid #18181b;
      text-align: center;
    }
    @media (min-width: 640px) {
      .footer-bottom {
        flex-direction: row;
        justify-content: space-between;
      }
    }
  `],
})
export class LandingComponent implements OnInit, AfterViewInit {
  landingService = inject(LandingService);
  authService = inject(AuthService);

  @ViewChild('particleCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  featuredCourses = this.landingService.featuredCourses;
  isAuthenticated = this.authService.isAuthenticated;
  currentYear = new Date().getFullYear();

  ngOnInit(): void {
    this.landingService.fetchFeaturedCourses();
  }

  ngAfterViewInit(): void {
    this.initParticles();
    this.animateHero();
    this.attachTiltEffect();
    this.attachMagneticEffect();
  }

  private initParticles(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const hero = canvas.parentElement!;
    const resize = () => {
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const count = Math.min(50, Math.floor((canvas.width * canvas.height) / 20000));
    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number; hue: string }[] = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 0.5,
        a: Math.random() * 0.4 + 0.1,
        hue: Math.random() > 0.5 ? '6, 182, 212' : '139, 92, 246',
      });
    }

    let frame = 0;
    const maxFrames = 300;

    const draw = () => {
      if (frame > maxFrames) return;
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.hue}, ${p.a})`;
        ctx.fill();
      }

      // connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    };
    draw();
  }

  private animateHero(): void {
    gsap.set('.hero-badge, .hero-line, .hero-desc, .hero-actions > *', { opacity: 0, y: 20 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.7 } });

    tl.to('.hero-badge', { y: 0, opacity: 1, duration: 0.5 }, 0.2);
    tl.to('.hero-line', { y: 0, opacity: 1, stagger: 0.12 }, 0.35);
    tl.to('.hero-desc', { y: 0, opacity: 1 }, 0.75);
    tl.to('.hero-actions > *', { y: 0, opacity: 1, stagger: 0.1 }, 0.95);

    // ScrollTrigger: value cards
    gsap.fromTo('.value-header',
      { y: 30, opacity: 0 },
      { scrollTrigger: { trigger: '#value-section', start: 'top 80%' }, y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
    );
    gsap.fromTo('.stagger-card',
      { y: 40, opacity: 0 },
      { scrollTrigger: { trigger: '#value-section', start: 'top 70%' }, y: 0, opacity: 1, stagger: 0.12, duration: 0.6, ease: 'power2.out' }
    );

    // ScrollTrigger: featured courses
    gsap.fromTo('.courses-header',
      { y: 30, opacity: 0 },
      { scrollTrigger: { trigger: '#courses-section', start: 'top 80%' }, y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
    );
    gsap.fromTo('.featured-card',
      { y: 40, opacity: 0 },
      { scrollTrigger: { trigger: '#courses-section', start: 'top 70%' }, y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out' }
    );

    // ScrollTrigger: final CTA
    gsap.fromTo('#cta-section .cta-card',
      { scale: 0.92, opacity: 0 },
      { scrollTrigger: { trigger: '#cta-section', start: 'top 80%' }, scale: 1, opacity: 1, duration: 0.7, ease: 'power2.out' }
    );

    // Refresh ScrollTrigger to ensure elements in view animate immediately
    ScrollTrigger.refresh();

    // Hero parallax on scroll
    ScrollTrigger.create({
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => {
        const hero = document.querySelector('.hero') as HTMLElement;
        const bg = hero?.querySelector('.hero-bg') as HTMLElement;
        if (bg) bg.style.transform = `translateY(${self.progress * 40}px)`;
      },
    });
  }

  private attachTiltEffect(): void {
    const cards = document.querySelectorAll('.featured-card');
    cards.forEach(card => {
      const el = card as HTMLElement;
      let xTo: ((v: number) => void) | null = null;
      let yTo: ((v: number) => void) | null = null;
      try {
        xTo = gsap.quickTo(el, 'rotationY', { duration: 0.4, ease: 'power3' });
        yTo = gsap.quickTo(el, 'rotationX', { duration: 0.4, ease: 'power3' });
      } catch { return; }

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        if (xTo && yTo) { xTo(x * 8); yTo(-y * 8); }
      });

      el.addEventListener('mouseleave', () => {
        if (xTo && yTo) { xTo(0); yTo(0); }
      });
    });
  }

  private attachMagneticEffect(): void {
    const btns = document.querySelectorAll('.hero-btn-primary, .hero-btn-secondary');
    btns.forEach(btn => {
      const el = btn as HTMLElement;
      let xTo: ((v: number) => void) | null = null;
      let yTo: ((v: number) => void) | null = null;
      try {
        xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
        yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });
      } catch { return; }

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) - rect.width / 2;
        const y = (e.clientY - rect.top) - rect.height / 2;
        if (xTo && yTo) { xTo(x * 0.25); yTo(y * 0.25); }
      });

      el.addEventListener('mouseleave', () => {
        if (xTo && yTo) { xTo(0); yTo(0); }
      });
    });
  }
}
