<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Course extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title', 'description', 'syllabus', 'duration_hours',
        'level', 'category', 'requirements', 'instructor_name',
        'instructor_id', 'is_published',
    ];

    protected $casts = [
        'duration_hours' => 'integer',
        'is_published' => 'boolean',
    ];

    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function enrollments(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'course_enrollments')
            ->withPivot('enrollment_date', 'progress', 'completed_at')
            ->withTimestamps();
    }
}
