<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\Payment;
use App\Enums\CourseStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class AdminDashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $totalUsers = User::count();

        // Usuarios realmente activos/desactivados (is_active column)
        $activeUsers = User::where('is_active', true)->count();
        $inactiveUsers = $totalUsers - $activeUsers;

        // Usuarios con al menos 1 inscripción
        $enrolledStudents = CourseEnrollment::distinct('user_id')->count('user_id');

        // Cursos por estado
        $totalCourses = Course::count();
        $publishedCourses = Course::where('status', CourseStatus::PUBLISHED->value)->count();
        $pendingCourses = Course::where('status', CourseStatus::IN_REVIEW->value)->count();

        // Total de inscripciones (actividad real)
        $totalEnrollments = CourseEnrollment::count();

        // Ingresos totales de compras de créditos
        $totalRevenue = Payment::where('status', 'completed')
            ->whereNotNull('credit_package_id')
            ->sum('amount');

        $retentionRate = $totalUsers > 0
            ? round(($enrolledStudents / $totalUsers) * 100, 2)
            : 0;

        // Categorías con más inscripciones (para el gráfico)
        $categoryDistribution = \App\Models\CourseEnrollment::selectRaw('categories.name, count(*) as count')
            ->join('courses', 'course_enrollments.course_id', '=', 'courses.id')
            ->join('categories', 'courses.category_id', '=', 'categories.id')
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('count')
            ->get()
            ->map(fn($row) => ['name' => $row->name, 'count' => (int) $row->count]);

        return response()->json([
            'success' => true,
            'data' => [
                'total_users' => (int) $totalUsers,
                'active_users' => (int) $activeUsers,
                'inactive_users' => (int) $inactiveUsers,
                'enrolled_students' => (int) $enrolledStudents,
                'total_revenue' => (float) $totalRevenue,
                'total_courses' => (int) $totalCourses,
                'published_courses' => (int) $publishedCourses,
                'pending_courses' => (int) $pendingCourses,
                'total_enrollments' => (int) $totalEnrollments,
                'retention_rate' => $retentionRate,
                'category_distribution' => $categoryDistribution,
            ],
        ]);
    }

    public function index(): JsonResponse
    {
        return $this->stats();
    }
}
