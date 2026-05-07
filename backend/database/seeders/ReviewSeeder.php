<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Course;
use App\Models\CourseReview;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $students = User::where('role_id', 3)->get();
        $dotNet = Course::where('title', 'like', '%.NET%')->first();
        $linux = Course::where('title', 'like', '%Linux%')->first();
        $publishedCourses = array_filter([$dotNet, $linux]);

        if (empty($publishedCourses)) {
            $this->command->warn('No hay cursos publicados. Ejecuta CourseSeeder primero.');
            return;
        }

        $comments = [
            5 => [
                "Excelente curso. La forma en que explica Clean Architecture cambió completamente mi manera de estructurar proyectos.",
                "El mejor contenido técnico que he tomado. El instructor domina el tema y los ejemplos son muy prácticos.",
                "Increíble la profundidad del contenido. Salí armando sistemas enterprise desde cero.",
                "Aprendí más en este curso que en 2 años de universidad. Altamente recomendado.",
                "La sección de CQRS y MediatR es oro puro. Valió cada crédito invertido.",
                "Curso obligatorio para cualquier desarrollador .NET que quiera crecer profesionalmente.",
                "Muy completo y bien estructurado. Los ejercicios prácticos son el diferenciador.",
            ],
            4 => [
                "Muy buen contenido, bien explicado. Solo le faltaría más laboratorios prácticos en la parte de testing.",
                "Excelente para nivel intermedio-avanzado. Mejoró significativamente mis habilidades de arquitectura.",
                "Buena profundidad técnica. El proyecto final fue muy útil para aplicar lo aprendido.",
                "Bien organizado, cada módulo construye sobre el anterior. El ritmo es adecuado.",
                "Gran curso. Me gustaría ver más ejemplos de integración con bases de datos NoSQL.",
            ],
            3 => [
                "Contenido correcto pero la calidad del audio podría mejorar en algunas lecciones.",
                "Buen curso en general. Algunas secciones de Linux se sintieron muy densas y rápidas.",
                "Okay para principiantes. Necesita más ejemplos visuales de la configuración de servidores.",
            ],
        ];

        $reviewCount = 0;
        $totalRating = 0;

        $courseReviews = [
            '.NET' => [
                ['rating' => 5, 'comment_key' => 0, 'days' => 60],
                ['rating' => 5, 'comment_key' => 1, 'days' => 45],
                ['rating' => 5, 'comment_key' => 2, 'days' => 30],
                ['rating' => 5, 'comment_key' => 4, 'days' => 15],
                ['rating' => 4, 'comment_key' => 0, 'days' => 90],
                ['rating' => 4, 'comment_key' => 1, 'days' => 70],
                ['rating' => 4, 'comment_key' => 3, 'days' => 10],
                ['rating' => 3, 'comment_key' => 0, 'days' => 120],
            ],
            'Linux' => [
                ['rating' => 5, 'comment_key' => 0, 'days' => 55],
                ['rating' => 5, 'comment_key' => 5, 'days' => 40],
                ['rating' => 5, 'comment_key' => 6, 'days' => 25],
                ['rating' => 4, 'comment_key' => 3, 'days' => 85],
                ['rating' => 4, 'comment_key' => 4, 'days' => 50],
                ['rating' => 4, 'comment_key' => 2, 'days' => 20],
                ['rating' => 3, 'comment_key' => 1, 'days' => 100],
            ],
        ];

        foreach ($publishedCourses as $course) {
            $key = stripos($course->title, '.NET') !== false ? '.NET' : 'Linux';
            $plan = $courseReviews[$key] ?? [];

            foreach ($plan as $reviewData) {
                $student = $students->random();

                $exists = CourseReview::where('user_id', $student->id)
                    ->where('course_id', $course->id)
                    ->exists();
                if ($exists) continue;

                $rating = $reviewData['rating'];
                $comment = $comments[$rating][$reviewData['comment_key'] % count($comments[$rating])];

                $createdAt = Carbon::now()->subDays($reviewData['days']);

                CourseReview::create([
                    'user_id' => $student->id,
                    'course_id' => $course->id,
                    'rating' => $rating,
                    'comment' => $comment,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);

                $reviewCount++;
                $totalRating += $rating;
            }
        }

        $avgRating = $reviewCount > 0 ? round($totalRating / $reviewCount, 1) : 0;

        $this->command->info("Reseñas: {$reviewCount} totales, rating promedio {$avgRating}★");
    }
}
