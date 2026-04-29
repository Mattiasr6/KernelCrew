<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Course;
use App\Models\CourseEnrollment;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class EnrollmentSeeder extends Seeder
{
    public function run(): void
    {
        $students = User::where('role_id', 3)->get();
        $courses = Course::where('status', 'published')->get();

        if ($courses->isEmpty()) {
            $this->command->warn('No hay cursos publicados. Ejecuta CourseSeeder primero.');
            return;
        }

        // === Distribución de fechas en últimos 6 meses ===
        $sixMonthsAgo = Carbon::now()->subMonths(6);
        
        $enrollmentsData = [
            // Mattias - varios cursos
            ['student_email' => 'mattias@kernellearn.com', 'course_titles' => ['Mastering .NET 8', 'Hacking Ético', 'Docker y Kubernetes'], 'progress' => [100, 85, 45]],
            ['student_email' => 'mattias@kernellearn.com', 'course_titles' => ['Agentes de IA con Ollama'], 'progress' => [30]],

            // Ana - cursos completados y en progreso
            ['student_email' => 'ana@kernellearn.com', 'course_titles' => ['Mastering .NET 8', 'PostgreSQL'], 'progress' => [100, 100]],
            ['student_email' => 'ana@kernellearn.com', 'course_titles' => ['Docker y Kubernetes'], 'progress' => [65]],

            // Carlos - en progreso
            ['student_email' => 'carlos@kernellearn.com', 'course_titles' => ['Angular', 'Linux'], 'progress' => [15, 10]],

            // María - varios en progreso
            ['student_email' => 'maria@kernellearn.com', 'course_titles' => ['AWS', 'Git'], 'progress' => [55, 85]],

            // Jorge - avanzado
            ['student_email' => 'jorge@kernellearn.com', 'course_titles' => ['Hacking Ético'], 'progress' => [90]],

            // Sofia - principiante
            ['student_email' => 'sofia@kernellearn.com', 'course_titles' => ['React', 'Vue'], 'progress' => [25, 10]],

            // Diego - en progreso IA
            ['student_email' => 'diego@kernellearn.com', 'course_titles' => ['Python', 'Agentes de IA con Ollama'], 'progress' => [40, 75]],

            // Valentina - principiante
            ['student_email' => 'valentina@kernellearn.com', 'course_titles' => ['.NET MAUI'], 'progress' => [20]],

            // Fernando - avanzado DB
            ['student_email' => 'fernando@kernellearn.com', 'course_titles' => ['PostgreSQL', 'GraphQL'], 'progress' => [100, 70]],

            // Isabella - principiante
            ['student_email' => 'isabella@kernellearn.com', 'course_titles' => ['Python'], 'progress' => [15]],

            // Roberto - mixto
            ['student_email' => 'roberto.aguirre@kernellearn.com', 'course_titles' => ['Laravel Security', 'Seguridad APIs'], 'progress' => [50, 30]],
        ];

        $enrollmentCount = 0;
        $completedCount = 0;

        foreach ($enrollmentsData as $data) {
            $student = $students->where('email', $data['student_email'])->first();
            if (!$student) continue;

            foreach ($data['course_titles'] as $index => $titlePart) {
                $course = $courses->filter(fn($c) => stripos($c->title, $titlePart) !== false)->first();
                if (!$course) continue;

                // Verificar si ya está inscrito
                $exists = CourseEnrollment::where('user_id', $student->id)
                    ->where('course_id', $course->id)
                    ->exists();
                if ($exists) continue;

                $progress = $data['progress'][$index];
                
                // Fecha de inscripción aleatoria en últimos 6 meses
                $enrollmentDate = Carbon::now()
                    ->subDays(rand(1, 180))
                    ->subHours(rand(0, 23));

                $enrollment = CourseEnrollment::create([
                    'user_id' => $student->id,
                    'course_id' => $course->id,
                    'enrollment_date' => $enrollmentDate,
                    'progress' => $progress,
                    'completed_at' => $progress >= 100 ? $enrollmentDate->copy()->addDays(rand(3, 15)) : null,
                ]);

                $enrollmentCount++;
                if ($progress >= 100) {
                    $completedCount++;
                }
            }
        }

        // Inscripciones adicionales aleatorias para relleno
        foreach ($students as $student) {
            $existingEnrollments = CourseEnrollment::where('user_id', $student->id)->count();
            $targetEnrollments = rand(2, 5);
            
            if ($existingEnrollments >= $targetEnrollments) continue;

            $randomCourses = $courses->random(min(3, $courses->count()));
            foreach ($randomCourses as $course) {
                $exists = CourseEnrollment::where('user_id', $student->id)
                    ->where('course_id', $course->id)
                    ->exists();
                if ($exists) continue;

                CourseEnrollment::create([
                    'user_id' => $student->id,
                    'course_id' => $course->id,
                    'enrollment_date' => Carbon::now()->subDays(rand(1, 90))->subHours(rand(0, 23)),
                    'progress' => rand(5, 40),
                    'completed_at' => null,
                ]);
                $enrollmentCount++;
            }
        }

        $this->command->info("Inscripciones creadas:");
        $this->command->info("- Total inscripciones: {$enrollmentCount}");
        $this->command->info("- Cursos completados (100%): {$completedCount}");
    }
}