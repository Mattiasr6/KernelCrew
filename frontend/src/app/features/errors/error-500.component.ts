import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-error-500',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="error-page">
      <div class="ambient ambient-amber"></div>
      <div class="ambient ambient-rose"></div>

      <div class="error-card">
        <div class="icon-container icon-500">
          <span class="material-symbols-outlined" style="font-size: 48px; font-variation-settings: 'FILL' 1;">report</span>
        </div>

        <div class="error-code">
          <span class="code-char c1">5</span>
          <span class="code-char c2">0</span>
          <span class="code-char c3">0</span>
        </div>

        <h1 class="error-title">Error del Servidor</h1>
        <p class="error-message">
          Algo salió mal en nuestros servidores.<br>
          Ya estamos trabajando en resolverlo. Intenta de nuevo en unos minutos.
        </p>

        <div class="actions">
          <a routerLink="/" class="btn-primary">
            <span class="material-symbols-outlined" style="font-size: 18px;">home</span>
            Volver al Inicio
          </a>
          <button class="btn-secondary" (click)="goBack()">
            <span class="material-symbols-outlined" style="font-size: 18px;">refresh</span>
            Intentar de Nuevo
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .error-page {
      min-height: 100vh;
      background: #09090b;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      position: relative;
      overflow: hidden;
    }
    .ambient {
      position: fixed;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      pointer-events: none;
      filter: blur(120px);
    }
    .ambient-amber {
      top: -100px;
      right: -100px;
      background: radial-gradient(circle, rgba(245, 158, 11, 0.1), transparent 70%);
    }
    .ambient-rose {
      bottom: -100px;
      left: -100px;
      background: radial-gradient(circle, rgba(244, 63, 94, 0.08), transparent 70%);
    }
    .error-card {
      position: relative;
      z-index: 1;
      max-width: 480px;
      width: 100%;
      text-align: center;
      animation: fadeUp 0.6s ease-out;
    }
    .icon-container {
      width: 88px;
      height: 88px;
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 40px;
    }
    .icon-500 {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.2);
      color: #f59e0b;
      box-shadow: 0 0 30px rgba(245, 158, 11, 0.15);
    }
    .error-code {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-bottom: 24px;
    }
    .code-char {
      font-size: 6rem;
      font-weight: 900;
      line-height: 1;
      letter-spacing: -0.04em;
      background: linear-gradient(135deg, #f59e0b, #fbbf24);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      filter: drop-shadow(0 0 30px rgba(245, 158, 11, 0.3));
    }
    .c1 { animation: drift 3s ease-in-out infinite; }
    .c2 { animation: drift 3s ease-in-out 0.15s infinite; }
    .c3 { animation: drift 3s ease-in-out 0.3s infinite; }
    @keyframes drift {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
    .error-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: #fafafa;
      margin-bottom: 12px;
      letter-spacing: -0.02em;
    }
    .error-message {
      color: #a1a1aa;
      font-size: 0.9rem;
      line-height: 1.7;
      margin-bottom: 40px;
    }
    .actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
      align-items: center;
    }
    @media (min-width: 400px) {
      .actions { flex-direction: row; justify-content: center; }
    }
    .btn-primary, .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 28px;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 600;
      transition: all 0.2s ease;
      cursor: pointer;
      text-decoration: none;
      font-family: inherit;
    }
    .btn-primary {
      background: linear-gradient(135deg, #06b6d4, #0891b2);
      color: #fff;
      border: none;
      box-shadow: 0 0 20px rgba(6, 182, 212, 0.25);
    }
    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 0 30px rgba(6, 182, 212, 0.4);
    }
    .btn-secondary {
      background: transparent;
      color: #a1a1aa;
      border: 1px solid #3f3f46;
    }
    .btn-secondary:hover {
      color: #fafafa;
      border-color: #52525b;
      background: rgba(255,255,255,0.03);
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class Error500Component {
  private location = inject(Location);
  goBack() { this.location.back(); }
}
