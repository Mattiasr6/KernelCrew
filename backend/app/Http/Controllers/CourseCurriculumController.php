<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseSection;
use App\Models\Lesson;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseCurriculumController extends Controller
{
    public function index(int $courseId): JsonResponse
    {
        $course = Course::with(['sections' => function ($q) {
            $q->orderBy('order')->with(['lessons' => function ($q) {
                $q->orderBy('order');
            }]);
        }])->findOrFail($courseId);

        // Público: cualquiera puede ver el temario de un curso publicado
        // Solo el instructor/admin puede verlo si está en draft
        $user = request()->user();
        $isOwner = $user && $course->instructor_id === $user->id;
        $isAdmin = $user && $user->isAdmin();

        if ($course->status !== 'published') {
            if (!$isOwner && !$isAdmin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Curso no encontrado',
                    'data' => null,
                ], 404);
            }
        }

        $sections = $course->sections->map(function ($section) use ($isOwner, $isAdmin) {
            $lessons = $section->lessons->map(function ($lesson) use ($isOwner, $isAdmin) {
                if ($isOwner || $isAdmin) {
                    return $lesson;
                }
                // Público: solo metadata, sin contenido ni video
                return $lesson->makeHidden(['content', 'video_url']);
            });

            return [
                'id' => $section->id,
                'course_id' => $section->course_id,
                'title' => $section->title,
                'order' => $section->order,
                'status' => $section->status,
                'lessons' => $lessons,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'sections' => $sections,
            ],
        ]);
    }

    public function show(int $lessonId): JsonResponse
    {
        $lesson = Lesson::with('section.course')->findOrFail($lessonId);
        $course = $lesson->section->course;
        $user = request()->user();

        // Público: lecciones gratuitas siempre accesibles
        if ($lesson->is_free && $course->status === 'published') {
            return response()->json(['success' => true, 'data' => $lesson]);
        }

        // Requiere autenticación para lecciones no gratuitas
        if (!$user) {
            return response()->json([
                'success' => false, 'message' => 'Debes iniciar sesión', 'data' => null,
            ], 401);
        }

        // Propietario o admin siempre accede
        if ($user->id === $course->instructor_id || $user->isAdmin()) {
            return response()->json(['success' => true, 'data' => $lesson]);
        }

        // Estudiantes: requieren inscripción activa
        $enrolled = \App\Models\CourseEnrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->exists();

        if (!$enrolled) {
            return response()->json([
                'success' => false, 'message' => 'Debes estar inscrito en el curso', 'data' => null,
            ], 403);
        }

        return response()->json(['success' => true, 'data' => $lesson]);
    }

    public function storeSection(Request $request, int $courseId): JsonResponse
    {
        $course = Course::findOrFail($courseId);
        $this->authorizeAccess($course);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'order' => 'integer|min:0',
        ]);

        $section = $course->sections()->create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Sección creada exitosamente',
            'data' => $section,
        ], 201);
    }

    public function updateSection(Request $request, int $sectionId): JsonResponse
    {
        $section = CourseSection::findOrFail($sectionId);
        $this->authorizeAccess($section->course);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'order' => 'sometimes|integer|min:0',
            'status' => 'sometimes|in:draft,published',
        ]);

        $section->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Sección actualizada',
            'data' => $section,
        ]);
    }

    public function destroySection(int $sectionId): JsonResponse
    {
        $section = CourseSection::findOrFail($sectionId);
        $this->authorizeAccess($section->course);

        $section->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sección eliminada',
            'data' => null,
        ]);
    }

    public function storeLesson(Request $request, int $sectionId): JsonResponse
    {
        $section = CourseSection::findOrFail($sectionId);
        $this->authorizeAccess($section->course);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'video_url' => 'nullable|url|max:500',
            'duration_minutes' => 'integer|min:0',
            'order' => 'integer|min:0',
            'is_free' => 'boolean',
        ]);

        $lesson = $section->lessons()->create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Lección creada exitosamente',
            'data' => $lesson,
        ], 201);
    }

    public function updateLesson(Request $request, int $lessonId): JsonResponse
    {
        $lesson = Lesson::findOrFail($lessonId);
        $this->authorizeAccess($lesson->section->course);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'nullable|string',
            'video_url' => 'nullable|url|max:500',
            'duration_minutes' => 'sometimes|integer|min:0',
            'order' => 'sometimes|integer|min:0',
            'is_free' => 'sometimes|boolean',
        ]);

        $lesson->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Lección actualizada',
            'data' => $lesson,
        ]);
    }

    public function destroyLesson(int $lessonId): JsonResponse
    {
        $lesson = Lesson::findOrFail($lessonId);
        $this->authorizeAccess($lesson->section->course);

        $lesson->delete();

        return response()->json([
            'success' => true,
            'message' => 'Lección eliminada',
            'data' => null,
        ]);
    }

    public function reorderSections(Request $request, int $courseId): JsonResponse
    {
        $course = Course::findOrFail($courseId);
        $this->authorizeAccess($course);

        $request->validate([
            'sections' => 'required|array',
            'sections.*.id' => 'required|integer|exists:course_sections,id',
            'sections.*.order' => 'required|integer|min:0',
        ]);

        foreach ($request->sections as $item) {
            CourseSection::where('id', $item['id'])
                ->where('course_id', $courseId)
                ->update(['order' => $item['order']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Secciones reordenadas',
        ]);
    }

    public function reorderLessons(Request $request): JsonResponse
    {
        $request->validate([
            'lessons' => 'required|array',
            'lessons.*.id' => 'required|integer|exists:lessons,id',
            'lessons.*.order' => 'required|integer|min:0',
        ]);

        foreach ($request->lessons as $item) {
            Lesson::where('id', $item['id'])->update(['order' => $item['order']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Lecciones reordenadas',
        ]);
    }

    private function authorizeAccess(Course $course): void
    {
        $user = request()->user();
        if (!$user || (!$user->isAdmin() && $course->instructor_id !== $user->id)) {
            abort(403, 'No tienes permiso para modificar este curso');
        }
    }
}
