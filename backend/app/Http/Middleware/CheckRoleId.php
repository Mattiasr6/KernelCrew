<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRoleId
{
    public function handle(Request $request, Closure $next, string $roleId): Response
    {
        $requiredRole = UserRole::tryFrom((int) $roleId);

        if (!$requiredRole || !$request->user() || (int) $request->user()->role_id !== $requiredRole->value) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado. Rol incorrecto.',
                'error_code' => 'INSUFFICIENT_PERMISSIONS',
            ], 403);
        }

        return $next($request);
    }
}
