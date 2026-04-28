import { Component, inject, input, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ReviewService, ReviewResponse } from '../../../core/services/review.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { CourseReview } from '../../../core/models';

@Component({
  selector: 'app-course-reviews',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="reviews-section mt-12 space-y-8 animate-fade-in">
      <div class="flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <h3 class="text-2xl font-bold text-white">Reseñas de Estudiantes</h3>
          <p class="text-slate-400 text-sm mt-1">
            Promedio basado en {{ reviewData()?.total_reviews || 0 }} calificaciones.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-4xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.3)]">
            {{ reviewData()?.average_rating || 0 }}
          </span>
          <div class="flex text-yellow-400">
             <span class="material-symbols-outlined text-[32px]" style="font-variation-settings: 'FILL' 1;">star</span>
          </div>
        </div>
      </div>

      <!-- Formulario de Reseña (Solo si el usuario está inscrito) -->
      @if (showForm()) {
        <div class="glass-card p-6 border-emerald-500/20 bg-emerald-500/5">
          <h4 class="text-white font-bold mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-emerald-400">rate_review</span>
            Deja tu calificación
          </h4>
          
          <form [formGroup]="reviewForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Selector de Estrellas -->
            <div class="flex gap-2">
              @for (star of [1,2,3,4,5]; track star) {
                <button 
                  type="button" 
                  (click)="setRating(star)"
                  class="star-btn transition-transform active:scale-90"
                  [class.active]="star <= currentRating()">
                  <span class="material-symbols-outlined text-[36px]" 
                        [style.font-variation-settings]="'\'FILL\' ' + (star <= currentRating() ? 1 : 0)">
                    star
                  </span>
                </button>
              }
            </div>

            <textarea 
              formControlName="comment"
              rows="3"
              class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-all resize-none shadow-inner"
              placeholder="Escribe tu opinión sobre el curso (opcional)..."
            ></textarea>

            <button 
              type="submit"
              [disabled]="reviewForm.invalid || isSubmitting()"
              class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              @if (isSubmitting()) {
                <span class="animate-spin text-lg">⏳</span>
              }
              Publicar Comentario
            </button>
          </form>
        </div>
      }

      <!-- Listado de Reseñas -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        @for (review of reviewData()?.reviews; track review.id) {
          <div class="glass-card p-6 hover:border-white/20 transition-all group">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 flex items-center justify-center text-white font-bold">
                  {{ review.user?.name?.charAt(0) }}
                </div>
                <div>
                  <p class="text-white font-semibold text-sm">{{ review.user?.name }}</p>
                  <p class="text-slate-500 text-xs">{{ review.created_at | date:'dd MMM, yyyy' }}</p>
                </div>
              </div>
              <div class="flex text-yellow-400 gap-0.5 scale-75 origin-right">
                @for (s of [1,2,3,4,5]; track s) {
                  <span class="material-symbols-outlined text-sm" 
                        [style.font-variation-settings]="'\'FILL\' ' + (s <= review.rating ? 1 : 0)">
                    star
                  </span>
                }
              </div>
            </div>
            <p class="text-slate-300 text-sm leading-relaxed">{{ review.comment || 'Sin comentario.' }}</p>
          </div>
        } @empty {
          <div class="col-span-full py-10 text-center text-slate-500">
            Aún no hay reseñas. ¡Sé el primero en calificar!
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .star-btn { color: #475569; }
    .star-btn.active { color: #facc15; filter: drop-shadow(0 0 8px rgba(250, 204, 21, 0.4)); }
  `]
})
export class CourseReviewsComponent implements OnInit {
  courseId = input.required<number>();
  enrolled = input<boolean>(false);

  private reviewService = inject(ReviewService);
  private notification = inject(NotificationService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  reviewData = signal<ReviewResponse | null>(null);
  currentRating = signal(0);
  isSubmitting = signal(false);
  showForm = signal(false);

  reviewForm: FormGroup = this.fb.group({
    rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.maxLength(1000)]]
  });

  ngOnInit() {
    this.loadReviews();
    this.showForm.set(this.enrolled());
  }

  loadReviews() {
    this.reviewService.getReviews(this.courseId()).subscribe({
      next: (res) => this.reviewData.set(res.data)
    });
  }

  setRating(rating: number) {
    this.currentRating.set(rating);
    this.reviewForm.patchValue({ rating });
  }

  onSubmit() {
    if (this.reviewForm.invalid) return;

    this.isSubmitting.set(true);
    this.reviewService.submitReview(this.courseId(), this.reviewForm.value).subscribe({
      next: (res) => {
        this.notification.success('¡Gracias por tu opinión!');
        this.isSubmitting.set(false);
        this.showForm.set(false);
        this.loadReviews();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.notification.error(err.error?.message || 'Error al enviar la reseña');
      }
    });
  }
}
