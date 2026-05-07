<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Course;
use App\Models\Certificate;
use App\Models\CourseEnrollment;
use Illuminate\Database\Seeder;
use Carbon\Carbon;
use Illuminate\Support\Str;

class CertificateSeeder extends Seeder
{
    public function run(): void
    {
        // Obtener inscripciones completadas (100%)
        $completedEnrollments = CourseEnrollment::where('progress', 100)
            ->whereNotNull('completed_at')
            ->with(['user', 'course'])
            ->get();

        $certCount = 0;

        foreach ($completedEnrollments as $enrollment) {
            // Verificar si ya existe certificado
            $exists = Certificate::where('user_id', $enrollment->user_id)
                ->where('course_id', $enrollment->course_id)
                ->exists();

            if ($exists) continue;

            $certificateCode = 'KL-' . strtoupper(Str::random(8));
            
            Certificate::create([
                'user_id' => $enrollment->user_id,
                'course_id' => $enrollment->course_id,
                'certificate_code' => $certificateCode,
                'issued_at' => $enrollment->completed_at,
                'created_at' => $enrollment->completed_at,
                'updated_at' => $enrollment->completed_at,
            ]);

            $certCount++;
        }

        $this->command->info("Certificados creados: {$certCount}");
        
        // Mostrar lista de certificados por estudiante
        $studentsWithCerts = Certificate::with('user', 'course')
            ->get()
            ->groupBy('user.email')
            ->map(fn($certs) => $certs->map(fn($c) => $c->course->title));

        if ($studentsWithCerts->isNotEmpty()) {
            $this->command->info("Certificados por estudiante:");
            foreach ($studentsWithCerts as $email => $courses) {
                $this->command->info("  - {$email}: " . implode(', ', $courses->toArray()));
            }
        }
    }
}