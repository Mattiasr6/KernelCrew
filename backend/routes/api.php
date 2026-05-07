<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminPaymentController;
use App\Http\Controllers\Admin\AdminCourseController;
use App\Http\Controllers\Api\V1\Auth\SocialAuthController;
use App\Http\Controllers\Api\V1\CertificateController;
use App\Http\Controllers\Api\V1\CourseReviewController;
use App\Http\Controllers\Api\V1\KernelAIController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\CourseAccessController;
use App\Http\Controllers\CourseEnrollmentController;
use App\Http\Controllers\CourseCurriculumController;
use App\Http\Controllers\CreditPackageController;
use App\Http\Controllers\Instructor\InstructorDashboardController;
use App\Http\Controllers\InstructorApplicationController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\StripeController;
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
    Route::get('/courses/categories', [CourseController::class, 'categories']);
    Route::get('/courses/featured', [CourseController::class, 'featured']);
    Route::get('/courses/{id}', [CourseController::class, 'show']);
    Route::get('/courses/{id}/reviews', [CourseReviewController::class, 'index']);
    Route::get('/courses/{courseId}/curriculum', [CourseCurriculumController::class, 'index']);
    Route::get('/lessons/{lessonId}', [CourseCurriculumController::class, 'show']);

    Route::get('/certificates/{uuid}/verify', [CertificateController::class, 'verify']);
    
    // Planes de Suscripción (Público)
    Route::get('/subscriptions/plans', [SubscriptionController::class, 'index']);

    // Paquetes de Créditos (Público)
    Route::get('/credit-packages', [CreditPackageController::class, 'index']);

    // Webhook de Stripe (Público)
    Route::post('/webhooks/stripe', [StripeController::class, 'handleWebhook']);

    // Rutas Protegidas
    Route::middleware('api.auth')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        
        // Checkout de Suscripción (Stripe Real Sandbox)
        Route::post('/checkout/session', [StripeController::class, 'createSession']);

        // Compra de Créditos vía Stripe
        Route::post('/stripe/credits/checkout', [StripeController::class, 'buyCredits']);

        // Inscripción con Créditos
        Route::post('/courses/{course}/enroll-credits', [CourseEnrollmentController::class, 'enrollWithCredits'])->middleware('throttle:3,1');

        // Inscripciones y Progreso
        Route::post('/courses/{id}/enroll', [CourseEnrollmentController::class, 'enroll']);
        Route::patch('/courses/{id}/progress', [CourseEnrollmentController::class, 'updateProgress']);
        Route::get('/courses/{id}/enrollment-status', [CourseEnrollmentController::class, 'status']);
        Route::post('/courses/{id}/reviews', [CourseReviewController::class, 'store']);
        
        // Control de Acceso
        Route::get('/courses/accessible', [CourseAccessController::class, 'getAccessibleCourses']);
        Route::get('/courses/{id}/access-check', [CourseAccessController::class, 'checkAccess']);
        Route::get('/my-courses', [CourseAccessController::class, 'getMyCourses']);
        Route::post('/courses/{id}/complete', [CourseAccessController::class, 'markComplete']);
        
        // Progreso detallado y lecciones (requiere autenticación)
        Route::post('/lessons/{id}/complete', [CourseEnrollmentController::class, 'completeLesson'])->middleware('throttle:5,1');
        Route::get('/courses/{id}/my-progress', [CourseEnrollmentController::class, 'myProgress']);
        Route::get('/student/my-courses', [CourseEnrollmentController::class, 'myCourses']);
        
        // Checkout de Suscripción (Legacy / Mock)
        Route::post('/subscriptions/checkout', [SubscriptionController::class, 'checkout']);
        
        // Suscripciones del Usuario
        Route::get('/subscriptions/active', [SubscriptionController::class, 'getActive']);
        Route::get('/subscriptions/history', [SubscriptionController::class, 'getHistory']);

        // Historial de Pagos del usuario autenticado (para créditos)
        Route::get('/payments', [\App\Http\Controllers\PaymentController::class, 'myPayments']);
        Route::patch('/subscriptions/{id}/auto-renew', [SubscriptionController::class, 'updateAutoRenew']);
        
        // Certificados
        Route::get('/certificates', [CertificateController::class, 'index']);
        Route::get('/certificates/{uuid}/download', [CertificateController::class, 'download']);
        
        // KernelAI (Asistente LLM)
        Route::post('/ai/chat', [KernelAIController::class, 'chat']);

        // Postulación de Estudiantes (Rol 3)
        Route::post('/instructor-applications', [InstructorApplicationController::class, 'store']);

        // Panel de Instructor (Solo role_id = 2)
        Route::middleware(['api.auth', 'checkRole:2'])->prefix('instructor')->group(function () {
            Route::get('/dashboard', [InstructorDashboardController::class, 'index']);
            Route::get('/students', [InstructorDashboardController::class, 'students']);
            Route::get('/courses', [CourseController::class, 'getInstructorCourses']);
            Route::post('/courses', [CourseController::class, 'store']);
            Route::get('/courses/{id}', [CourseController::class, 'showForEditor']);
            Route::put('/courses/{id}', [CourseController::class, 'update']);
            Route::delete('/courses/{id}', [CourseController::class, 'destroy']);
            Route::patch('/courses/{id}/request-review', [CourseController::class, 'requestReview']);
            Route::patch('/courses/{id}/basic', [CourseController::class, 'updateBasic']);
            Route::patch('/courses/{id}/pricing', [CourseController::class, 'updatePricing']);

            // Curriculum Builder (Secciones y Lecciones)
            Route::get('/courses/{courseId}/curriculum', [CourseCurriculumController::class, 'index']);
            Route::post('/courses/{courseId}/sections', [CourseCurriculumController::class, 'storeSection']);
            Route::put('/sections/{sectionId}', [CourseCurriculumController::class, 'updateSection']);
            Route::delete('/sections/{sectionId}', [CourseCurriculumController::class, 'destroySection']);
            Route::post('/sections/{sectionId}/lessons', [CourseCurriculumController::class, 'storeLesson']);
            Route::put('/lessons/{lessonId}', [CourseCurriculumController::class, 'updateLesson']);
            Route::delete('/lessons/{lessonId}', [CourseCurriculumController::class, 'destroyLesson']);
            Route::post('/courses/{courseId}/sections/reorder', [CourseCurriculumController::class, 'reorderSections']);
            Route::post('/lessons/reorder', [CourseCurriculumController::class, 'reorderLessons']);
        });

        // Panel de Admin (Solo role_id = 1)
        Route::middleware(['api.auth', 'checkRole:1'])->prefix('admin')->group(function () {
            Route::get('/dashboard', [AdminDashboardController::class, 'index']);
            Route::get('/stats', [AdminDashboardController::class, 'stats']);

            // Gestión de Postulaciones (Admin)
            Route::get('/instructor-applications', [InstructorApplicationController::class, 'index']);
            Route::patch('/instructor-applications/{id}/approve', [InstructorApplicationController::class, 'approve']);
            Route::patch('/instructor-applications/{id}/reject', [InstructorApplicationController::class, 'reject']);
            Route::get('/instructor-applications/{id}/resume', [InstructorApplicationController::class, 'downloadResume']);

            Route::get('/users', [AdminUserController::class, 'index']);
            Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);
            Route::patch('/users/{id}/restore', [AdminUserController::class, 'restore']);
            Route::patch('/users/{id}/toggle-status', [AdminUserController::class, 'toggleStatus']);

            Route::patch('/courses/{id}/restore', [CourseController::class, 'restore']);
            
            // Admin también puede hacer CRUD de cualquier curso
            Route::get('/courses', [AdminCourseController::class, 'index']);
            Route::get('/courses/{id}/preview', [AdminCourseController::class, 'show']);
            Route::post('/courses', [CourseController::class, 'store']);
            Route::put('/courses/{id}', [CourseController::class, 'update']);
            Route::delete('/courses/{id}', [CourseController::class, 'destroy']);
            
            // Moderación de Cursos (Admin)
            Route::get('/courses/pending', [AdminCourseController::class, 'pending']);
            Route::patch('/courses/{id}/approve', [AdminCourseController::class, 'approve']);
            Route::patch('/courses/{id}/reject', [AdminCourseController::class, 'reject']);
            
            // Transacciones y Pagos (Admin)
            Route::get('/payments', [AdminPaymentController::class, 'index']);
            Route::get('/payments/stats', [AdminPaymentController::class, 'stats']);
        });
    });
});
