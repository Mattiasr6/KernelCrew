<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Services\CertificateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CertificateController extends Controller
{
    protected $certificateService;

    public function __construct(CertificateService $certificateService)
    {
        $this->certificateService = $certificateService;
    }

    /**
     * Listar certificados del usuario autenticado.
     */
    public function index()
    {
        $certificates = request()->user()->certificates()->with('course')->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $certificates
        ]);
    }

    /**
     * Verificación pública de un certificado por UUID.
     */
    public function verify(string $uuid): JsonResponse
    {
        $certificate = Certificate::where('certificate_code', $uuid)->first();

        if (!$certificate) {
            return response()->json([
                'success' => false,
                'message' => 'Certificado no encontrado.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'student_name' => $certificate->user->name,
                'course_name' => $certificate->course->title,
                'issued_at' => $certificate->issued_at->toISOString(),
                'certificate_code' => $certificate->certificate_code,
            ],
        ]);
    }

    /**
     * Descargar certificado por UUID.
     */
    public function download(string $uuid)
    {
        $certificate = Certificate::where('certificate_code', $uuid)->firstOrFail();
        $user = request()->user();

        if ($user->id !== $certificate->user_id && (int) $user->role_id !== UserRole::Admin->value) {
            return response()->json(['message' => 'Acceso no autorizado a este certificado.'], 403);
        }

        $pdf = $this->certificateService->generateForUser($certificate->user, $certificate->course);

        return $pdf->download("Certificado_{$certificate->certificate_code}.pdf");
    }
}
