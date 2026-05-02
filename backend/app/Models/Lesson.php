<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Lesson extends Model
{
    protected $fillable = [
        'course_section_id', 'title', 'content',
        'video_url', 'duration_minutes', 'order', 'is_free'
    ];

    protected $casts = [
        'is_free' => 'boolean',
        'duration_minutes' => 'integer',
        'order' => 'integer',
    ];

    public function section(): BelongsTo
    {
        return $this->belongsTo(CourseSection::class, 'course_section_id');
    }
}
