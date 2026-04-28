<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class CoursePolicy
{
    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Solo Admin (1) o Docente (2) pueden crear cursos
        return in_array((int) $user->role_id, [1, 2]);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Course $course): bool
    {
        // Admin puede todo, Docente solo sus propios cursos
        return (int) $user->role_id === 1 || (int) $user->id === (int) $course->instructor_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Course $course): bool
    {
        return (int) $user->role_id === 1 || (int) $user->id === (int) $course->instructor_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Course $course): bool
    {
        return (int) $user->role_id === 1;
    }
}
