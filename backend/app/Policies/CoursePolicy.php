<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\CourseStatus;
use App\Enums\UserRole;
use App\Models\Course;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class CoursePolicy
{
    public function create(User $user): bool
    {
        return in_array((int) $user->role_id, [
            UserRole::Admin->value,
            UserRole::Instructor->value,
        ]);
    }

    public function update(User $user, Course $course): bool
    {
        if ($course->status !== CourseStatus::DRAFT) {
            return false;
        }
        return (int) $user->role_id === UserRole::Admin->value
            || (int) $user->id === (int) $course->instructor_id;
    }

    public function delete(User $user, Course $course): bool
    {
        if ($course->status !== CourseStatus::DRAFT) {
            return false;
        }
        return (int) $user->role_id === UserRole::Admin->value
            || (int) $user->id === (int) $course->instructor_id;
    }

    public function restore(User $user, Course $course): bool
    {
        return (int) $user->role_id === UserRole::Admin->value;
    }

    public function submitForReview(User $user, Course $course): bool
    {
        if ((int) $user->id !== (int) $course->instructor_id) {
            return false;
        }
        return $course->status === CourseStatus::DRAFT
            || $course->status === CourseStatus::REJECTED;
    }

    public function approve(User $user, Course $course): bool
    {
        return (int) $user->role_id === UserRole::Admin->value
            && $course->status === CourseStatus::IN_REVIEW;
    }

    public function reject(User $user, Course $course): bool
    {
        return (int) $user->role_id === UserRole::Admin->value
            && $course->status === CourseStatus::IN_REVIEW;
    }

    public function modify(User $user, Course $course): bool
    {
        if ($course->status !== CourseStatus::DRAFT) {
            return false;
        }
        return (int) $user->role_id === UserRole::Admin->value
            || (int) $user->id === (int) $course->instructor_id;
    }
}
