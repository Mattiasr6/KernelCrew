<?php

namespace App\Http\Controllers;

use App\Models\InstructorApplication;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

class InstructorApplicationController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/v1/instructor-applications",
     *     summary="Enviar postulación para ser docente",
     *     tags={"Postulaciones"},
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"experience_summary"},
     *             @OA\Property(property="experience_summary", type="string"),
     *             @OA\Property(property="portfolio_url", type="string", format="uri")
     *         )
     *     )
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'experience_summary' => 'required|string|min:50',
            'portfolio_url' => 'nullable|url',
        ]);

        $user = $request->user();

        if ($user->role_id !== 3) {
            return response()->json(['success' => false, 'message' => 'Solo los estudiantes pueden postularse'], 403);
        }

        if ($user->instructorApplication()->exists()) {
            return response()->json(['success' => false, 'message' => 'Ya tienes una postulación en curso'], 422);
        }

        $application = InstructorApplication::create([
            'user_id' => $user->id,
            'experience_summary' => $validated['experience_summary'],
            'portfolio_url' => $validated['portfolio_url'],
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Postulación enviada con éxito',
            'data' => $application
        ], 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/instructor-applications",
     *     summary="Listar postulaciones pendientes (Solo Admin)",
     *     tags={"Administración - Postulaciones"},
     *     security={{"sanctum": {}}}
     * )
     */
    public function index(): JsonResponse
    {
        $applications = InstructorApplication::with('user')
            ->where('status', 'pending')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $applications
        ]);
    }

    /**
     * @OA\Patch(
     *     path="/api/v1/admin/instructor-applications/{id}/approve",
     *     summary="Aprobar postulación (Solo Admin)",
     *     tags={"Administración - Postulaciones"}
     * )
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        return DB::transaction(function () use ($request, $id) {
            $application = InstructorApplication::findOrFail($id);
            
            if ($application->status !== 'pending') {
                return response()->json(['success' => false, 'message' => 'Esta postulación ya fue procesada'], 422);
            }

            $application->update([
                'status' => 'approved',
                'reviewed_by' => $request->user()->id,
            ]);

            // Cambio automático de ROL de 3 (Estudiante) a 2 (Docente)
            $user = $application->user;
            $user->update(['role_id' => 2]);

            return response()->json([
                'success' => true,
                'message' => "Postulación aprobada. {$user->name} ahora es Docente.",
                'data' => $application
            ]);
        });
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $application = InstructorApplication::findOrFail($id);
        $application->update([
            'status' => 'rejected',
            'reviewed_by' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Postulación rechazada',
            'data' => $application
        ]);
    }
}
