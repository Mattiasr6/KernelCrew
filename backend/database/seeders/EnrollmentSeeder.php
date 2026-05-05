<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\CourseEnrollment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EnrollmentSeeder extends Seeder
{
    public function run(): void
    {
        $mattias = User::where('email', 'mattias@kernellearn.com')->first();
        $ana = User::where('email', 'ana@kernellearn.com')->first();
        $courses = Course::with('sections.lessons')->get();

        if ($courses->isEmpty()) {
            $this->command->warn('No hay cursos. Ejecuta CourseSeeder y CurriculumSeeder primero.');
            return;
        }

        $dotNetCourse = $courses->first(fn($c) => stripos($c->title, '.NET') !== false);
        $linuxCourse = $courses->first(fn($c) => stripos($c->title, 'Linux') !== false);

        $enrollmentCount = 0;

        // === Mattias inscrito en .NET 8 (progreso 45%) ===
        if ($mattias && $dotNetCourse) {
            $enrollment = CourseEnrollment::create([
                'user_id' => $mattias->id,
                'course_id' => $dotNetCourse->id,
                'enrollment_date' => Carbon::now()->subDays(14),
                'progress' => 45,
            ]);
            $enrollmentCount++;

            // Marcar primeras 2 lecciones como completadas en lesson_user
            $lessons = $dotNetCourse->sections
                ->flatMap(fn($s) => $s->lessons)
                ->sortBy(fn($l) => $l->section->order . '.' . $l->order)
                ->take(3);

            foreach ($lessons as $lesson) {
                DB::table('lesson_user')->updateOrInsert(
                    ['user_id' => $mattias->id, 'lesson_id' => $lesson->id],
                    ['completed_at' => Carbon::now()->subDays(rand(2, 10)), 'updated_at' => now()]
                );
            }

            // Actualizar last_lesson_id al último completado
            $lastLesson = $lessons->last();
            if ($lastLesson) {
                $enrollment->update(['last_lesson_id' => $lastLesson->id]);
            }

            $this->command->info("Mattias inscrito en .NET 8 con " . $lessons->count() . " lecciones completadas.");
        }

        // === Ana inscrita en Linux (progreso 0%) ===
        if ($ana && $linuxCourse) {
            CourseEnrollment::create([
                'user_id' => $ana->id,
                'course_id' => $linuxCourse->id,
                'enrollment_date' => Carbon::now()->subDays(3),
                'progress' => 0,
            ]);
            $enrollmentCount++;

            $this->command->info("Ana inscrita en Linux Server Admin.");
        }

        $this->command->info("Total inscripciones: {$enrollmentCount}");
    }
}
