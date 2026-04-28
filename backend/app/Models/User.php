<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'is_active',
        'role_id',
        'provider',
        'provider_id',
        'avatar',
        'enrollment_credits'
    ];

    public function instructorApplication(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(InstructorApplication::class, 'user_id');
    }

    public function reviewedApplications(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(InstructorApplication::class, 'reviewed_by');
    }

    public function courses(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Course::class, 'instructor_id');
    }

    /**
     * Scope para búsqueda blindada de usuarios (US-03)
     */
    public function scopeSearch($query, $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'ilike', "%{$term}%")
              ->orWhere('email', 'ilike', "%{$term}%");
        });
    }

    /**
     * Enviar notificación de restablecimiento de contraseña (CA-11)
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new \App\Notifications\ResetPasswordNotification($token));
    }

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function rol(): BelongsTo
    {
        return $this->belongsTo(Rol::class, 'role_id');
    }

    public function enrolledCourses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'course_enrollments')
            ->withPivot('enrollment_date', 'progress', 'completed_at')
            ->withTimestamps();
    }

    public function subscriptionPlans(): BelongsToMany
    {
        return $this->belongsToMany(SubscriptionPlan::class, 'user_subscriptions')
            ->withPivot('status', 'start_date', 'end_date', 'auto_renew')
            ->withTimestamps();
    }

    public function activeSubscription()
    {
        return $this->subscriptionPlans()->where('user_subscriptions.status', 'active');
    }

    public function isActive(): bool
    {
        return $this->is_active === true;
    }

    public function isAdmin(): bool
    {
        return $this->rol && $this->rol->nombre === 'admin';
    }

    public function isInstructor(): bool
    {
        return $this->rol && $this->rol->nombre === 'instructor';
    }

    public function isStudent(): bool
    {
        return $this->rol && $this->rol->nombre === 'student';
    }

    public function getRoleName(): string
    {
        return $this->rol?->nombre ?? 'student';
    }
}
