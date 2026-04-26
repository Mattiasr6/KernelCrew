<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRoleId
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  int  $roleId
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next, $roleId): Response
    {
        if (!$request->user() || (int) $request->user()->role_id !== (int) $roleId) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado. Rol incorrecto.',
                'error_code' => 'INSUFFICIENT_PERMISSIONS'
            ], 403);
        }

        return $next($request);
    }
}
