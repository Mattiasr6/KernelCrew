<?php

namespace App\Observers;

use App\Models\Course;
use App\Models\CourseEnrollment;

class CourseObserver
{
    public function deleted(Course $course): void
    {
        $enrollments = CourseEnrollment::where('course_id', $course->id)->get();

        foreach ($enrollments as $enrollment) {
            if ($course->price_in_credits > 0) {
                $enrollment->user->increment('credits_balance', $course->price_in_credits);
            }
            $enrollment->delete();
        }
    }
}
