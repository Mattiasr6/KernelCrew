import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'accessIndicator',
  standalone: true,
})
export class AccessIndicatorPipe implements PipeTransform {
  transform(level: string | undefined, planName: string | undefined): { icon: string; message: string; locked: boolean } {
    if (!level || !planName) {
      return { icon: 'lock_open', message: 'Acceso disponible', locked: false };
    }

    const plan = planName.toLowerCase();
    const courseLevel = level.toLowerCase();

    if (plan === 'premium' || plan === 'enterprise') {
      return { icon: 'check_circle', message: 'Tienes acceso', locked: false };
    }

    if (plan === 'pro' || plan === 'professional') {
      if (['beginner', 'intermediate'].includes(courseLevel)) {
        return { icon: 'check_circle', message: 'Tienes acceso', locked: false };
      }
      return { icon: 'lock', message: `Plan ${planName} no incluye nivel ${level}`, locked: true };
    }

    if (plan === 'basic' || plan === 'básico') {
      if (courseLevel === 'beginner') {
        return { icon: 'check_circle', message: 'Tienes acceso', locked: false };
      }
      return { icon: 'lock', message: `Plan ${planName} no incluye nivel ${level}`, locked: true };
    }

    return { icon: 'lock_open', message: 'Acceso disponible', locked: false };
  }
}