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
        $students = User::where('role_id', 3)->get()->keyBy('email');
        $dotNet = Course::where('title', 'like', '%.NET%')->first();
        $linux = Course::where('title', 'like', '%Linux%')->first();

        if (!$dotNet || !$linux) {
            $this->command->warn('Cursos no encontrados. Ejecuta CourseSeeder primero.');
            return;
        }

        $publishedCourses = [$dotNet, $linux];
        $allCourses = Course::all();

        // Enrollment data: email, course key, progress, days ago enrolled
        $enrollments = [
            // .NET 8 students
            ['email' => 'mattias@kernellearn.com',       'course' => '.NET', 'progress' => 85,  'days' => 90],
            ['email' => 'ana@kernellearn.com',            'course' => '.NET', 'progress' => 100, 'days' => 75],
            ['email' => 'maria@kernellearn.com',          'course' => '.NET', 'progress' => 100, 'days' => 60],
            ['email' => 'sofia@kernellearn.com',          'course' => '.NET', 'progress' => 20,  'days' => 30],
            ['email' => 'valentina@kernellearn.com',      'course' => '.NET', 'progress' => 50,  'days' => 45],
            ['email' => 'isabella@kernellearn.com',       'course' => '.NET', 'progress' => 35,  'days' => 15],
            ['email' => 'diego@kernellearn.com',          'course' => '.NET', 'progress' => 10,  'days' => 7],
            ['email' => 'carlos@kernellearn.com',         'course' => '.NET', 'progress' => 0,   'days' => 2],
            // Linux students
            ['email' => 'mattias@kernellearn.com',       'course' => 'Linux', 'progress' => 30,  'days' => 40],
            ['email' => 'ana@kernellearn.com',            'course' => 'Linux', 'progress' => 60,  'days' => 55],
            ['email' => 'carlos@kernellearn.com',         'course' => 'Linux', 'progress' => 15,  'days' => 20],
            ['email' => 'maria@kernellearn.com',          'course' => 'Linux', 'progress' => 45,  'days' => 35],
            ['email' => 'jorge@kernellearn.com',          'course' => 'Linux', 'progress' => 90,  'days' => 80],
            ['email' => 'diego@kernellearn.com',          'course' => 'Linux', 'progress' => 75,  'days' => 50],
            ['email' => 'fernando@kernellearn.com',       'course' => 'Linux', 'progress' => 10,  'days' => 12],
            ['email' => 'roberto.aguirre@kernellearn.com','course' => 'Linux', 'progress' => 100, 'days' => 65],
            ['email' => 'valentina@kernellearn.com',      'course' => 'Linux', 'progress' => 0,   'days' => 5],
            ['email' => 'sofia@kernellearn.com',          'course' => 'Linux', 'progress' => 5,   'days' => 3],
        ];

        $totalCount = 0;
        $completedCount = 0;

        foreach ($enrollments as $entry) {
            $student = $students->get($entry['email']);
            if (!$student) continue;

            $course = $entry['course'] === '.NET' ? $dotNet : $linux;

            $exists = CourseEnrollment::where('user_id', $student->id)
                ->where('course_id', $course->id)
                ->exists();
            if ($exists) continue;

            $enrollmentDate = Carbon::now()->subDays($entry['days']);

            $enrollment = CourseEnrollment::create([
                'user_id' => $student->id,
                'course_id' => $course->id,
                'enrollment_date' => $enrollmentDate,
                'progress' => $entry['progress'],
                'completed_at' => $entry['progress'] >= 100
                    ? $enrollmentDate->copy()->addDays(rand(5, 20))
                    : null,
            ]);

            // Mark lesson_user entries for progress simulation
            if ($entry['progress'] > 0) {
                $lessons = $course->sections
                    ->flatMap(fn($s) => $s->lessons)
                    ->sortBy(fn($l) => $l->section->order . '.' . $l->order)
                    ->values();

                $totalLessons = $lessons->count();
                $toComplete = (int) round(($entry['progress'] / 100) * $totalLessons);

                for ($i = 0; $i < $toComplete && $i < $totalLessons; $i++) {
                    $lesson = $lessons[$i];
                    DB::table('lesson_user')->updateOrInsert(
                        ['user_id' => $student->id, 'lesson_id' => $lesson->id],
                        ['completed_at' => $enrollmentDate->copy()->addDays(rand(1, $entry['days'] - 1)), 'updated_at' => now()]
                    );
                }

                if ($toComplete > 0) {
                    $enrollment->update(['last_lesson_id' => $lessons[min($toComplete - 1, $totalLessons - 1)]->id]);
                }
            }

            $totalCount++;
            if ($entry['progress'] >= 100) $completedCount++;
        }

        $this->command->info("Inscripciones: {$totalCount} totales, {$completedCount} completadas al 100%.");
    }
}
