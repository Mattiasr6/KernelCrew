<?php

namespace App\Services;

use App\Models\User;
use App\Models\Course;
use App\Models\Certificate;
use Barryvdh\DomPDF\Facade\Pdf;

class CertificateService
{
    /**
     * Generar o recuperar certificado para un usuario y curso específico.
     */
    public function generateForUser(User $user, Course $course)
    {
        $certificate = Certificate::firstOrCreate(
            ['user_id' => $user->id, 'course_id' => $course->id]
        );

        $data = [
            'user_name' => $user->name,
            'course_title' => $course->title,
            'issued_at' => $certificate->issued_at->format('d/m/Y'),
            'certificate_code' => $certificate->certificate_code,
        ];

        return Pdf::loadView('certificates.template', $data);
    }
}
