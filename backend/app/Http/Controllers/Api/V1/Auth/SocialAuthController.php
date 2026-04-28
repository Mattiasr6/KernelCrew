<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

class SocialAuthController extends Controller
{
    public function redirect($provider)
    {
        return Socialite::driver($provider)->stateless()->redirect();
    }

    public function callback($provider)
    {
        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();
            
            // Buscar o crear el usuario
            $user = User::where('email', $socialUser->getEmail())->first();

            if (!$user) {
                $user = User::create([
                    'name' => $socialUser->getName() ?? $socialUser->getNickname(),
                    'email' => $socialUser->getEmail(),
                    'provider' => $provider,
                    'provider_id' => $socialUser->getId(),
                    'avatar' => $socialUser->getAvatar(),
                    'role_id' => 3, // Student por defecto (Regla de Negocio)
                    'password' => null, // OAuth user
                ]);
            } else {
                // Actualizar datos de provider si ya existe
                $user->update([
                    'provider' => $provider,
                    'provider_id' => $socialUser->getId(),
                    'avatar' => $socialUser->getAvatar(),
                ]);
            }

            // Generar token de Sanctum
            $token = $user->createToken('auth_token')->plainTextToken;

            // Redirigir al frontend con el token usando la configuración dinámica
            $frontendUrl = config('app.frontend_url') . '/auth/callback';
            
            return redirect()->to("{$frontendUrl}?token={$token}");

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la autenticación social: ' . $e->getMessage()
            ], 500);
        }
    }
}
