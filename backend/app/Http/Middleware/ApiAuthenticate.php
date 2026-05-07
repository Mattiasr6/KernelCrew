<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
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
            return response()->json([
                'success' => false,
                'message' => 'Token inválido',
                'error' => 'Unauthorized'
            ], 401);
        }
        
        // Set the user on the request
        $request->setUserResolver(function () use ($accessToken) {
            return $accessToken->tokenable;
        });
        
        return $next($request);
    }
}