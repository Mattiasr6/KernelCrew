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
        $courses = Course::where('status', 'published')->get();

        if ($courses->isEmpty()) {
            $this->command->warn('No hay cursos. Ejecuta CourseSeeder primero.');
            return;
        }

        $comments = [
            5 => [
                "Excelente curso. El instructor explica muy bien los conceptos complejos. La sección de arquitectura limpia cambió completamente mi forma de programar.",
                "Sin duda el mejor curso de .NET que he tomado. Muy prácticos los ejemplos y el proyecto final es realista.",
                " contenido muy actualizado. Aprendí cosas que no encontré en otros recursos.",
                "El profesor domina el tema. Resolvió todas mis dudas rápidamente en el foro.",
                "Curso obligatoria para cualquier desarrollador .NET. Calidad de producción excelente.",
            ],
            4 => [
                "Muy buen contenido, bien estructurado. Solo le faltaría más ejercicios prácticos.",
                "El curso está muy completo. Aprendí mucho aunque me gustaría más contenido sobre testing.",
                "Buena explicación teórica pero deberían agregar más laboratorios.",
                "Excelente para nivel intermedio. Mejoró mis habilidades.",
                "Bien organizado, cada módulo building sobre el anterior. Recommended.",
            ],
            3 => [
                "Contenido correcto pero la edición del video podría mejorar.",
                "Buen curso en general. Algunas secciones se sentían muy cortas.",
                "Okay para principiante. Necesita más ejemplos prácticos.",
                "El ritmo es un poco lento en algunas partes, pero el contenido es válido.",
                "Decente, no está mal pero esperaba más después de las reseñas positivas.",
            ],
            2 => [
                "El contenido está desactualizado en algunas partes.",
                "Esperaba más profundidad en los temas avanzados.",
                "El audio de algunas clases no es muy claro.",
            ],
            1 => [
                "No recommend este curso. Muy básico para el precio.",
                "El instructor no responde las preguntas del foro.",
            ],
        ];

        // Reseñas específicas para cursos con mejor rating
        $featuredReviews = [
            'Mastering .NET 8' => [
                ['rating' => 5, 'comment' => 'El mejor investimento que hice. De null a architect en 45 horas.'],
                ['rating' => 5, 'comment' => 'El instructor es un crack. Explica hasta el más mínimo detalle.'],
                ['rating' => 5, 'comment' => 'Contenido enterprise-class. langsung applied di proyek real.'],
                ['rating' => 4, 'comment' => 'Excelente pero podría tener más labs prácticos.'],
                ['rating' => 5, 'comment' => 'Desde que tome este curso mi employer meconsidero para lead position'],
            ],
            'Hacking Ético' => [
                ['rating' => 5, 'comment' => 'Muy completo. Las técnicas de hardening son exactly what I needed.'],
                ['rating' => 5, 'comment' => 'Excelente para certificación CEH. Práctica real, no solo teoría.'],
                ['rating' => 4, 'comment' => 'Buen contenido, algunas tools podrían actualizarse.'],
                ['rating' => 5, 'comment' => 'Me preparó perfectamente para mi primer pentest profesional.'],
            ],
            'Docker y Kubernetes' => [
                ['rating' => 5, 'comment' => 'Ahora despliego con confianza. Del localhost a production en minutos.'],
                ['rating' => 4, 'comment' => 'Muy completo pero K8s podría ser más profundo.'],
                ['rating' => 5, 'comment' => 'El mejor recurso en español para DevOps.'],
            ],
            'Agentes de IA con Ollama' => [
                ['rating' => 4, 'comment' => 'Excelente introducción a IA local. Todo funcionando en mi laptop.'],
                ['rating' => 5, 'comment' => 'Finalmente entiendo cómo funcionan los agentes. Muy práctico.'],
                ['rating' => 4, 'comment' => 'Buen contenido, algo básico para mi nivel pero valioso.'],
            ],
            '.NET MAUI' => [
                ['rating' => 5, 'comment' => 'Publicaron mi primera app en stores después de este curso.'],
                ['rating' => 4, 'comment' => 'Bien estructurado, solo alcune partes desactualizadas.'],
            ],
            'PostgreSQL' => [
                ['rating' => 5, 'comment' => 'Las window functions changed my life. Excelente contenido.'],
                ['rating' => 5, 'comment' => 'Ahora mis queries son 10x más rápidas.'],
            ],
        ];

        $reviewCount = 0;
        $totalRating = 0;

        // Reseñas destacadas
        foreach ($featuredReviews as $titlePart => $reviews) {
            $course = $courses->filter(fn($c) => stripos($c->title, $titlePart) !== false)->first();
            if (!$course) continue;

            foreach ($reviews as $reviewData) {
                $student = $students->random();
                
                // Verificar si ya hay review
                $exists = CourseReview::where('user_id', $student->id)
                    ->where('course_id', $course->id)
                    ->exists();
                if ($exists) continue;

                $createdAt = Carbon::now()
                    ->subDays(rand(1, 120))
                    ->subHours(rand(0, 23));

                CourseReview::create([
                    'user_id' => $student->id,
                    'course_id' => $course->id,
                    'rating' => $reviewData['rating'],
                    'comment' => $reviewData['comment'],
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);

                $reviewCount++;
                $totalRating += $reviewData['rating'];
            }
        }

        // Reseñas aleatorias adicionales
        foreach ($courses as $course) {
            $existingReviews = CourseReview::where('course_id', $course->id)->count();
            $targetReviews = rand(3, 8);
            
            for ($i = $existingReviews; $i < $targetReviews; $i++) {
                $student = $students->random();
                
                $exists = CourseReview::where('user_id', $student->id)
                    ->where('course_id', $course->id)
                    ->exists();
                if ($exists) continue;

                $rating = $this->weightedRandomRating();
                $comment = $comments[$rating][array_rand($comments[$rating])];
                
                $createdAt = Carbon::now()
                    ->subDays(rand(1, 150))
                    ->subHours(rand(0, 23));

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

        $avgRating = $reviewCount > 0 ? round($totalRating / $reviewCount, 2) : 0;

        $this->command->info("Reseñas creadas:");
        $this->command->info("- Total reseñas: {$reviewCount}");
        $this->command->info("- Rating promedio: {$avgRating}");
    }

    private function weightedRandomRating(): int
    {
        $weights = [5 => 40, 4 => 35, 3 => 15, 2 => 7, 1 => 3];
        $rand = rand(1, 100);
        $cumulative = 0;
        
        foreach ($weights as $rating => $weight) {
            $cumulative += $weight;
            if ($rand <= $cumulative) {
                return $rating;
            }
        }
        
        return 4;
    }
}