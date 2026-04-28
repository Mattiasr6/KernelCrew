<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Course;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class AdminDashboardController extends Controller
{
    /**
     * Obtener estadísticas globales de negocio (Epic 6)
     */
    public function stats(): JsonResponse
    {
        // Total de usuarios
        $totalUsers = User::count();

        // Estudiantes activos (con suscripción activa)
        $activeStudents = User::whereHas('subscriptions', function($q) {
            $q->where('status', 'active');
        })->count();

        // Ingresos totales
        $totalRevenue = Payment::where('status', 'completed')->sum('amount');

        // Total cursos
        $totalCourses = Course::count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_users' => (int) $totalUsers,
                'active_students' => (int) $activeStudents,
                'inactive_students' => (int) ($totalUsers - $activeStudents),
                'total_revenue' => (float) $totalRevenue,
                'total_courses' => (int) $totalCourses,
                'retention_rate' => $totalUsers > 0 ? round(($activeStudents / $totalUsers) * 100, 2) : 0
            ]
        ], 200);
    }

    public function index(): JsonResponse
    {
        return $this->stats();
    }
}
