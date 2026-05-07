<?php

namespace App\Providers;

use App\Models\Course;
use App\Observers\CourseObserver;
use App\Policies\CoursePolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if ($this->app->environment('production', 'local')) {
            URL::forceScheme('https');
        }

        \Illuminate\Support\Facades\Event::listen(
            \App\Events\CoursePublished::class,
            \App\Listeners\AwardInstructorCredits::class
        );

        Course::observe(CourseObserver::class);

        // Registrar políticas de autorización
        Gate::policy(Course::class, CoursePolicy::class);
        Gate::policy(\App\Models\User::class, \App\Policies\UserPolicy::class);
    }
}
