<?php

namespace App\Http\Controllers\Admin;

use App\Enums\CourseStatus;
use App\Events\CoursePublished;
use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\JsonResponse;

class AdminCourseController extends Controller
{
    public function pending(): JsonResponse
    {
        $courses = Course::with('instructor')
            ->where('status', CourseStatus::IN_REVIEW)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $courses,
        ]);
    }

    public function approve(int $id): JsonResponse
    {
        $course = Course::findOrFail($id);
        $this->authorize('approve', $course);

        $course->update(['status' => CourseStatus::PUBLISHED]);

        event(new CoursePublished($course));

        return response()->json([
            'success' => true,
            'message' => 'Curso aprobado y publicado.',
        ]);
    }

    public function reject(int $id): JsonResponse
    {
        $course = Course::findOrFail($id);
        $this->authorize('reject', $course);

        $course->update(['status' => CourseStatus::REJECTED]);

        return response()->json([
            'success' => true,
            'message' => 'Curso rechazado.',
        ]);
    }
}
