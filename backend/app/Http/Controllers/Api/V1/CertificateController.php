<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Services\CertificateService;
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
        $certificates = auth()->user()->certificates()->with('course')->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $certificates
        ]);
    }

    /**
     * Descargar certificado por UUID.
     */
    public function download(string $uuid)
    {
        $certificate = Certificate::where('certificate_code', $uuid)->firstOrFail();

        // Validar que el usuario sea el dueño o sea Admin (role_id = 1)
        if (auth()->id() !== $certificate->user_id && auth()->user()->role_id !== 1) {
            return response()->json(['message' => 'Acceso no autorizado a este certificado.'], 403);
        }

        $pdf = $this->certificateService->generateForUser($certificate->user, $certificate->course);

        return $pdf->download("Certificado_{$certificate->certificate_code}.pdf");
    }
}
