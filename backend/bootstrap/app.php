<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();
        
        $middleware->alias([
            'checkRole' => \App\Http\Middleware\CheckRoleId::class,
            'api.auth' => \App\Http\Middleware\ApiAuthenticate::class,
        ]);

        $middleware->trustProxies(at: '*');
        $middleware->append(\Illuminate\Http\Middleware\HandleCors::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            return response()->json([
                'success' => false,
                'message' => 'No autenticado'
            ], 401);
        });

        $exceptions->render(function (\Illuminate\Database\Eloquent\ModelNotFoundException $e, $request) {
            if ($request->expectsJson() || $request->is('api/v1/*') || $request->is('v1/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Recurso no encontrado',
                ], 404);
            }
        });

        $exceptions->render(function (\Illuminate\Auth\Access\AuthorizationException $e, $request) {
            if ($request->expectsJson() || $request->is('api/v1/*') || $request->is('v1/*')) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage() ?: 'Acción no autorizada',
                ], 403);
            }
        });

        $exceptions->render(function (\Throwable $e, $request) {
            if ($request->expectsJson() || $request->is('api/v1/*') || $request->is('v1/*')) {
                $status = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;
                if ($status < 100 || $status > 599) $status = 500;
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage() ?: 'Error interno del servidor',
                ], $status);
            }
        });
    })->create();
