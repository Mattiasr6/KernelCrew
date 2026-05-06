import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfettiService {

  /**
   * Dispara confeti desde ambos bordes de la pantalla hacia el centro
   * usando exclusivamente la paleta de DESIGN.md
   */
  fireSuccessConfetti(): void {
    const colors = ['#8b5cf6', '#7c3aed', '#22d3ee', '#06b6d4', '#f4f4f5'];

    const defaults = {
      spread: 60,
      ticks: 80,
      gravity: 0.6,
      decay: 0.94,
      startVelocity: 30,
      colors,
    };

    const shoot = () => {
      // Desde la esquina inferior izquierda
      Promise.all([
        import('canvas-confetti').then((confetti) => {
          confetti.default({
            ...defaults,
            particleCount: 40,
            angle: 60,
            origin: { x: 0, y: 0.8 },
          });
        }),
        // Desde la esquina inferior derecha
        import('canvas-confetti').then((confetti) => {
          confetti.default({
            ...defaults,
            particleCount: 40,
            angle: 120,
            origin: { x: 1, y: 0.8 },
          });
        }),
      ]);
    };

    shoot();
    // Segunda ráfaga más suave 300ms después
    setTimeout(() => {
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          ...defaults,
          particleCount: 25,
          angle: 90,
          spread: 100,
          origin: { x: 0.5, y: 0.6 },
          startVelocity: 20,
        });
      });
    }, 300);
  }
}
