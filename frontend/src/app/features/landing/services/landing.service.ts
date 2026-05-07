import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

export interface FeaturedCourse {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  level: string;
  category: { id: number; name: string; slug: string } | null;
  instructor: { id: number; name: string; avatar_url: string | null };
  students_count: number;
  rating_avg: number;
  price_in_credits: number;
}

@Injectable({ providedIn: 'root' })
export class LandingService {
  private api = inject(ApiService);

  featuredCourses = signal<FeaturedCourse[]>([]);

  fetchFeaturedCourses(): void {
    this.api.get<{ success: boolean; data: FeaturedCourse[] }>('courses/featured').subscribe({
      next: (res) => {
        if (res.success) {
          this.featuredCourses.set(res.data);
        }
      },
    });
  }
}
