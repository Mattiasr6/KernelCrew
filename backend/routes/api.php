<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Api\V1\Auth\SocialAuthController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\Instructor\InstructorDashboardController;
use App\Http\Controllers\InstructorApplicationController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    
    // Autenticación Tradicional
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register'])
            ->middleware('throttle:5,1');
        
        Route::post('/login', [AuthController::class, 'login'])
            ->middleware('throttle:5,1');

        Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])
            ->middleware('throttle:5,1');
        
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);

        // OAuth 2.0 (Socialite)
        Route::get('{provider}/redirect', [SocialAuthController::class, 'redirect']);
        Route::get('{provider}/callback', [SocialAuthController::class, 'callback']);
    });

    // Rutas Públicas de Cursos
    Route::get('/courses', [CourseController::class, 'index']);
    Route::get('/courses/{id}', [CourseController::class, 'show']);

    // Rutas Protegidas
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
        
        // Postulación de Estudiantes (Rol 3)
        Route::post('/instructor-applications', [InstructorApplicationController::class, 'store']);

        // Panel de Instructor (Solo role_id = 2)
        Route::middleware('checkRole:2')->prefix('instructor')->group(function () {
            Route::get('/dashboard', [InstructorDashboardController::class, 'index']);
            Route::post('/courses', [CourseController::class, 'store'])->can('create', App\Models\Course::class);
            Route::put('/courses/{id}', [CourseController::class, 'update'])->can('update', 'course');
            Route::delete('/courses/{id}', [CourseController::class, 'destroy'])->can('delete', 'course');
        });

        // Panel de Admin (Solo role_id = 1)
        Route::middleware('checkRole:1')->prefix('admin')->group(function () {
            Route::get('/dashboard', [AdminDashboardController::class, 'index']);

            // Gestión de Postulaciones (Admin)
            Route::get('/instructor-applications', [InstructorApplicationController::class, 'index']);
            Route::patch('/instructor-applications/{id}/approve', [InstructorApplicationController::class, 'approve']);
            Route::patch('/instructor-applications/{id}/reject', [InstructorApplicationController::class, 'reject']);

            Route::get('/users', [AdminUserController::class, 'index']);
            Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);
            Route::patch('/users/{id}/restore', [AdminUserController::class, 'restore']);
            Route::patch('/users/{id}/toggle-status', [AdminUserController::class, 'toggleStatus']);

            Route::patch('/courses/{id}/restore', [CourseController::class, 'restore'])->can('restore', 'course');

            // Admin también puede hacer CRUD de cualquier curso
            Route::post('/courses', [CourseController::class, 'store'])->can('create', App\Models\Course::class);
            Route::put('/courses/{id}', [CourseController::class, 'update'])->can('update', 'course');
            Route::delete('/courses/{id}', [CourseController::class, 'destroy'])->can('delete', 'course');
        });    });
});
