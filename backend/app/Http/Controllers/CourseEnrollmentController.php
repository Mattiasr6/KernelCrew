<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\Lesson;
use App\Models\Certificate;
use App\Services\PlanLevelService;
use App\Enums\CourseStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CourseEnrollmentController extends Controller
{
    public function __construct(
        private readonly PlanLevelService $planLevelService,
    ) {}

    /**
     * Inscribir al usuario en un curso
     */
    public function enroll(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $course = Course::findOrFail($id);

        // 1. Validar si el usuario tiene una suscripción activa
        $activeSubscription = $user->subscriptions()->where('status', 'active')->first();
        if (!$activeSubscription) {
            return response()->json([
                'success' => false,
                'message' => 'Necesitas una suscripción activa para inscribirte en este curso.',
                'redirect_to' => '/subscriptions',
            ], 403);
        }

        // 2. Validar nivel del curso contra el plan
        if (!$this->planLevelService->canAccess($activeSubscription->plan->name, $course->level)) {
            return response()->json([
                'success' => false,
                'message' => "Tu plan {$activeSubscription->plan->name} no incluye acceso a cursos de nivel {$course->level}. Por favor, mejora tu suscripción.",
                'redirect_to' => '/subscriptions',
            ], 403);
        }

        // 3. Validar si ya está inscrito
        $exists = CourseEnrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Ya estás inscrito en este curso.',
            ], 422);
        }

        // 4. Crear inscripción
        $enrollment = CourseEnrollment::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'enrollment_date' => now(),
            'progress' => 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => '¡Inscripción exitosa! Bienvenido al curso.',
            'data' => $enrollment,
        ], 201);
    }

    /**
     * Inscribir al usuario en un curso usando créditos
     */
    public function enrollWithCredits(Request $request, Course $course): JsonResponse
    {
        $user = $request->user();

        // Validar que el curso esté publicado
        if ($course->status !== CourseStatus::PUBLISHED->value) {
            return response()->json([
                'success' => false,
                'message' => 'Este curso no está disponible.',
            ], 404);
        }

        // Validar que no esté ya inscrito
        $exists = CourseEnrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Ya estás inscrito en este curso.',
            ], 422);
        }

        // Validar saldo de créditos
        if ($user->credits_balance < $course->price_in_credits) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes suficientes créditos. Necesitas ' . $course->price_in_credits . ' créditos.',
                'redirect_to' => '/credits',
            ], 403);
        }

        // Ejecutar transacción: restar créditos + crear inscripción
        DB::transaction(function () use ($user, $course) {
            $user->decrement('credits_balance', $course->price_in_credits);

            CourseEnrollment::create([
                'user_id' => $user->id,
                'course_id' => $course->id,
                'enrollment_date' => now(),
                'progress' => 0,
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => '¡Inscripción exitosa! Se descontaron ' . $course->price_in_credits . ' créditos.',
        ], 201);
    }

    /**
     * Actualizar el progreso del curso
     */
    public function updateProgress(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'progress' => 'required|integer|min:0|max:100',
        ]);

        $user = $request->user();
        $enrollment = CourseEnrollment::where('user_id', $user->id)
            ->where('course_id', $id)
            ->firstOrFail();

        $enrollment->update([
            'progress' => $request->progress,
            'completed_at' => $request->progress === 100 ? now() : null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Progreso actualizado correctamente.',
            'data' => [
                'progress' => $enrollment->progress,
                'is_completed' => $enrollment->progress === 100,
            ],
        ]);
    }

    /**
     * Obtener el estado de inscripción de un curso para el usuario actual
     */
    public function status(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $enrollment = CourseEnrollment::where('user_id', $user->id)
            ->where('course_id', $id)
            ->first();

        return response()->json([
            'success' => true,
            'data' => $enrollment,
        ]);
    }

    /**
     * Marcar una lección como completada y recalcular progreso
     */
    public function completeLesson(Request $request, int $lessonId): JsonResponse
    {
        $user = $request->user();
        $lesson = Lesson::with('section.course')->findOrFail($lessonId);
        $course = $lesson->section->course;

        // Validar inscripción activa
        $enrollment = CourseEnrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        if (!$enrollment) {
            return response()->json([
                'success' => false,
                'message' => 'No estás inscrito en este curso.',
            ], 403);
        }

        // Upsert en lesson_user
        DB::table('lesson_user')->updateOrInsert(
            ['user_id' => $user->id, 'lesson_id' => $lesson->id],
            ['completed_at' => now(), 'updated_at' => now()]
        );

        // Calcular progreso
        $totalLessons = $course->sections()->withCount('lessons')->get()->sum('lessons_count');
        $completedLessons = DB::table('lesson_user')
            ->join('lessons', 'lessons.id', '=', 'lesson_user.lesson_id')
            ->join('course_sections', 'course_sections.id', '=', 'lessons.course_section_id')
            ->where('course_sections.course_id', $course->id)
            ->where('lesson_user.user_id', $user->id)
            ->count();

        $progressPct = $totalLessons > 0
            ? round(($completedLessons / $totalLessons) * 100, 2)
            : 0;

        // Actualizar enrollment
        $enrollment->update([
            'progress' => $progressPct,
            'last_lesson_id' => $lesson->id,
        ]);

        // Auto-generar certificado si llegó al 100%
        if ($progressPct >= 100) {
            Certificate::firstOrCreate(
                ['user_id' => $user->id, 'course_id' => $course->id],
                ['issued_at' => now()]
            );
            $enrollment->update(['completed_at' => now()]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Lección completada.',
            'data' => [
                'progress' => $progressPct,
                'completed_lesson_id' => $lesson->id,
                'certificate_ready' => $progressPct >= 100,
            ],
        ]);
    }

    /**
     * Obtener progreso detallado del curso para el usuario
     */
    public function myProgress(Request $request, int $courseId): JsonResponse
    {
        $user = $request->user();

        $enrollment = CourseEnrollment::where('user_id', $user->id)
            ->where('course_id', $courseId)
            ->first();

        if (!$enrollment) {
            return response()->json([
                'success' => false,
                'message' => 'No estás inscrito en este curso.',
            ], 403);
        }

        $completedLessonIds = DB::table('lesson_user')
            ->join('lessons', 'lessons.id', '=', 'lesson_user.lesson_id')
            ->join('course_sections', 'course_sections.id', '=', 'lessons.course_section_id')
            ->where('course_sections.course_id', $courseId)
            ->where('lesson_user.user_id', $user->id)
            ->pluck('lesson_user.lesson_id');

        return response()->json([
            'success' => true,
            'data' => [
                'progress' => $enrollment->progress,
                'completed_lesson_ids' => $completedLessonIds,
                'last_lesson_id' => $enrollment->last_lesson_id,
                'completed_at' => $enrollment->completed_at,
            ],
        ]);
    }
}
