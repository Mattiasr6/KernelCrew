<?php

use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register'])
        ->middleware('throttle:5,1');
    
    Route::post('/auth/login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1');

    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])
        ->middleware('throttle:5,1');
    
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

    Route::get('/courses', [CourseController::class, 'index']);
    Route::get('/courses/{id}', [CourseController::class, 'show']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
        
        Route::post('/courses', [CourseController::class, 'store'])
            ->middleware('role:instructor|admin');
        
        Route::put('/courses/{id}', [CourseController::class, 'update'])
            ->middleware('role:instructor|admin');
        
        Route::delete('/courses/{id}', [CourseController::class, 'destroy'])
            ->middleware('role:instructor|admin');
        
        Route::patch('/courses/{id}/restore', [CourseController::class, 'restore'])
            ->middleware('role:admin');

        Route::middleware('role:admin')->group(function () {
            Route::get('/admin/users', [AdminUserController::class, 'index']);
            Route::delete('/admin/users/{id}', [AdminUserController::class, 'destroy']);
            Route::patch('/admin/users/{id}/restore', [AdminUserController::class, 'restore']);
            Route::patch('/admin/users/{id}/toggle-status', [AdminUserController::class, 'toggleStatus']);
        });
    });
});