<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use OpenApi\Attributes as OA;

/**
 * @OA\Tag(
 *     name="Autenticación",
 *     description="Endpoints de autenticación"
 * )
 */
#[OA\Tag(name: 'Autenticación', description: 'Endpoints de autenticación')]
class AuthController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/v1/auth/register",
     *     tags={"Autenticación"},
     *     summary="Registrar nuevo usuario",
     *     description="Registra un nuevo usuario en la plataforma",
     *     operationId="register",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "email", "password", "password_confirmation"},
     *             @OA\Property(property="name", type="string", example="Juan Pérez"),
     *             @OA\Property(property="email", type="string", format="email", example="juan@ejemplo.com"),
     *             @OA\Property(property="password", type="string", format="password", example="Password123"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="Password123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Usuario registrado",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Usuario registrado exitosamente"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="user", type="object"),
     *                 @OA\Property(property="token", type="string")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=422, description="Error de validación")
     * )
     */
    #[OA\Post(path: '/api/v1/auth/register', tags: ['Autenticación'], summary: 'Registrar nuevo usuario')]
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'is_active' => true,
        ]);

        $user->update(['role_id' => 3]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Usuario registrado exitosamente',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->getRoleName(),
                    'created_at' => $user->created_at->toISOString(),
                ],
                'token' => $token,
            ],
        ], 201);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/auth/login",
     *     tags={"Autenticación"},
     *     summary="Iniciar sesión",
     *     description="Autentica al usuario y devuelve token",
     *     operationId="login",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email", "password"},
     *             @OA\Property(property="email", type="string", format="email", example="admin@kernellearn.com"),
     *             @OA\Property(property="password", type="string", format="password", example="admin123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Login exitoso",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Inicio de sesión exitoso"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Credenciales inválidas")
     * )
     */
    #[OA\Post(path: '/api/v1/auth/login', tags: ['Autenticación'], summary: 'Iniciar sesión')]
    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciales inválidas',
                'errors' => [
                    'email' => ['Las credenciales proporcionadas no son correctas'],
                ],
            ], 401);
        }

        if (!$user->isActive()) {
            return response()->json([
                'success' => false,
                'message' => 'Tu cuenta está inactiva. Contacta al administrador.',
                'errors' => [],
            ], 403);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Inicio de sesión exitoso',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->getRoleName(),
                ],
                'token' => $token,
            ],
        ], 200);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada exitosamente',
            'data' => (object)[],
        ], 200);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $subscription = $user->subscriptions()->where('status', 'active')->first();

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->getRoleName(),
                    'role_id' => $user->role_id,
                    'is_active' => $user->isActive(),
                    'avatar' => $user->avatar,
                    'bio' => $user->bio,
                    'phone' => $user->phone,
                    'subscription' => $subscription ? [
                        'id' => $subscription->id,
                        'plan_name' => $subscription->plan->name ?? 'N/A',
                    ] : null,
                ],
            ],
        ], 200);
    }

    #[OA\Put(path: '/api/v1/profile', tags: ['Autenticación'], summary: 'Actualizar perfil')]
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'bio' => 'sometimes|string|max:500',
            'phone' => 'sometimes|string|max:20',
            'avatar' => 'sometimes|string|url|max:500',
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Perfil actualizado exitosamente',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->getRoleName(),
                    'is_active' => $user->isActive(),
                    'avatar' => $user->avatar,
                    'bio' => $user->bio,
                    'phone' => $user->phone,
                ],
            ],
        ], 200);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/auth/forgot-password",
     *     tags={"Autenticación"},
     *     summary="Solicitar recuperación de contraseña",
     *     description="Envía un token al email del usuario",
     *     operationId="forgotPassword",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email"},
     *             @OA\Property(property="email", type="string", format="email", example="usuario@ejemplo.com")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Token enviado",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean"),
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */
    #[OA\Post(path: '/api/v1/auth/forgot-password', tags: ['Autenticación'], summary: 'Solicitar recuperación de contraseña')]
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $validated = $request->validated();
        
        $user = User::where('email', $validated['email'])->first();
        
        $token = \Str::random(60);
        
        \DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => $token,
                'created_at' => now(),
            ]
        );

        \Log::info('Password Reset Token for ' . $user->email . ': ' . $token);

        return response()->json([
            'success' => true,
            'message' => 'Se ha enviado un enlace de recuperación a tu correo electrónico',
            'data' => [
                'token' => $token,
                'expires_in' => 3600,
            ],
        ], 200);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/auth/reset-password",
     *     tags={"Autenticación"},
     *     summary="Restablecer contraseña",
     *     description="Restablece la contraseña usando el token",
     *     operationId="resetPassword",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"token", "email", "password", "password_confirmation"},
     *             @OA\Property(property="token", type="string", example="..."),
     *             @OA\Property(property="email", type="string", format="email", example="usuario@ejemplo.com"),
     *             @OA\Property(property="password", type="string", format="password", example="NewPassword123"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="NewPassword123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Contraseña actualizada",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean"),
     *             @OA\Property(property="message", type="string")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Token inválido o expirado")
     * )
     */
    #[OA\Post(path: '/api/v1/auth/reset-password', tags: ['Autenticación'], summary: 'Restablecer contraseña')]
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $validated = $request->validated();
        
        $tokenRecord = \DB::table('password_reset_tokens')
            ->where('email', $validated['email'])
            ->first();
        
        if (!$tokenRecord || !hash_equals($tokenRecord->token, $validated['token'])) {
            return response()->json([
                'success' => false,
                'message' => 'El token de recuperación es inválido o ha expirado',
                'data' => null,
                'errors' => [
                    'token' => ['El token de recuperación es inválido o ha expirado. Por favor, solicita uno nuevo.'],
                ],
            ], 422);
        }
        
        $tokenAge = now()->diffInSeconds($tokenRecord->created_at);
        if ($tokenAge > 3600) {
            \DB::table('password_reset_tokens')->where('email', $validated['email'])->delete();
            return response()->json([
                'success' => false,
                'message' => 'El token de recuperación ha expirado. Por favor, solicita uno nuevo.',
                'data' => null,
                'errors' => [
                    'token' => ['El token ha expirado.'],
                ],
            ], 422);
        }
        
        $user = User::where('email', $validated['email'])->first();
        $user->password = Hash::make($validated['password']);
        $user->save();
        
        \DB::table('password_reset_tokens')->where('email', $validated['email'])->delete();

        return response()->json([
            'success' => true,
            'message' => 'Contraseña restablecida exitosamente. Por favor, inicia sesión con tu nueva contraseña.',
            'data' => null,
        ], 200);
    }
}