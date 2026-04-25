<?php

namespace App\Listeners;

use App\Events\CoursePublished;
use App\Models\User;
use App\Models\Activity;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AwardInstructorCredits
{
    /**
     * Handle the event.
     */
    public function handle(CoursePublished $event): void
    {
        $course = $event->course;
        $instructor = $course->instructor;

        if (!$instructor || $course->is_credit_counted) {
            return;
        }

        DB::transaction(function () use ($course, $instructor) {
            // PARCHE 1: Bloqueo de fila para evitar Race Condition
            $lockedInstructor = User::where('id', $instructor->id)->lockForUpdate()->first();

            // Marcamos el curso como contado (Evita farming)
            $course->update(['is_credit_counted' => true]);

            // PARCHE 2: Conteo histórico incluyendo SoftDeletes
            $totalCounted = $lockedInstructor->courses()
                ->withTrashed()
                ->where('is_credit_counted', true)
                ->count();

            // Registrar actividad de publicación
            Activity::create([
                'user_id' => $lockedInstructor->id,
                'type' => 'course_published',
                'subject_id' => $course->id,
                'subject_type' => get_class($course),
                'description' => "Has publicado el curso: {$course->title}",
            ]);

            // Lógica de gamificación: Cada 3 cursos, 1 crédito
            if ($totalCounted > 0 && $totalCounted % 3 === 0) {
                $lockedInstructor->increment('enrollment_credits');

                // Registrar actividad de crédito ganado
                Activity::create([
                    'user_id' => $lockedInstructor->id,
                    'type' => 'credit_earned',
                    'subject_id' => $lockedInstructor->id,
                    'subject_type' => get_class($lockedInstructor),
                    'description' => "¡Felicidades! Has ganado 1 crédito de inscripción por tus 3 cursos publicados.",
                ]);

                Log::info("Crédito otorgado al instructor {$lockedInstructor->email}. Hito alcanzado: {$totalCounted} cursos.");
            }
        });
    }
}
