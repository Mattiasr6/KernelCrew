<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class ApiAuthenticate
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'No autenticado',
                'error' => 'Unauthorized'
            ], 401);
        }

        $parts = explode('|', $token);
        $tokenId = $parts[0] ?? null;

        if (!$tokenId) {
            return response()->json([
                'success' => false,
                'message' => 'Token inválido',
                'error' => 'Unauthorized'
            ], 401);
        }

        $accessToken = PersonalAccessToken::find($tokenId);

        if (!$accessToken) {
            // Si el token no existe (por ejemplo tras migrate:fresh) y es logout, dejamos pasar
            if ($request->is('api/v1/auth/logout') || $request->is('v1/auth/logout')) {
                return $next($request);
            }
            return response()->json([
                'success' => false,
                'message' => 'Token inválido',
                'error' => 'Unauthorized'
            ], 401);
        }

        $user = $accessToken->tokenable;

        // Set the user on the request (for $request->user())
        $request->setUserResolver(fn() => $user);

        // Set the user on the Auth facade (for Gate/Policy via $this->authorize())
        Auth::setUser($user);

        return $next($request);
    }
}