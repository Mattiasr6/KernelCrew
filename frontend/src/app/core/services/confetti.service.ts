import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfettiService {

  /**
   * Dispara confeti desde ambos bordes de la pantalla hacia el centro
   * usando exclusivamente la paleta de DESIGN.md (violeta/cyan/blanco).
   * Implementación 100% nativa — sin dependencias externas.
   */
  fireSuccessConfetti(): void {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d')!;
    const colors = ['#8b5cf6', '#7c3aed', '#22d3ee', '#06b6d4', '#f4f4f5'];
    const particles: Particle[] = [];
    const particleCount = 120;

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      rotation: number;
      rotationSpeed: number;
      life: number;

      constructor(x: number, y: number, angle: number, spread: number, speed: number) {
        this.x = x;
        this.y = y;
        const rad = (angle + (Math.random() - 0.5) * spread) * (Math.PI / 180);
        this.vx = Math.cos(rad) * speed;
        this.vy = Math.sin(rad) * speed;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.size = Math.random() * 8 + 4;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 10;
        this.life = 1;
      }

      update() {
        this.vy += 0.06;
        this.vx *= 0.99;
        this.vy *= 0.99;
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        this.life -= 0.012;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
        ctx.restore();
      }
    }

    // Ráfaga desde la izquierda
    for (let i = 0; i < particleCount / 2; i++) {
      particles.push(new Particle(0, canvas.height * 0.8, 60, 40, Math.random() * 14 + 8));
    }

    // Ráfaga desde la derecha
    for (let i = 0; i < particleCount / 2; i++) {
      const x = canvas.width / 2;
      particles.push(new Particle(x * 2, canvas.height * 0.8, 120, 40, Math.random() * 14 + 8));
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = false;
      for (const p of particles) {
        p.update();
        if (p.life > 0) {
          p.draw(ctx);
          alive = true;
        }
      }

      if (alive) {
        requestAnimationFrame(animate);
      } else {
        document.body.removeChild(canvas);
      }
    }

    animate();
  }
}
