<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/**
 * @OA\Tag(
 *     name="Administración - Usuarios",
 *     description="Endpoints de gestión de usuarios (solo admin)"
 * )
 */
#[OA\Tag(name: 'Administración - Usuarios', description: 'Endpoints de gestión de usuarios (solo admin)')]
class AdminUserController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/admin/users",
     *     tags={"Administración - Usuarios"},
     *     summary="Listar todos los usuarios",
     *     description="Retorna lista paginada de usuarios (incluye eliminados)",
     *     operationId="getUsers",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         @OA\Schema(type="integer", default=1)
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         @OA\Schema(type="integer", default=15)
     *     ),
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Usuarios obtenidos",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="array"),
     *             @OA\Property(property="meta", type="object")
     *         )
     *     ),
     *     @OA\Response(response=403, description="No autorizado")
     * )
     */
    #[OA\Get(path: '/api/v1/admin/users', tags: ['Administración - Usuarios'], summary: 'Listar todos los usuarios')]
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $perPage = $request->query('per_page', 15);

        $query = User::withTrashed();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%");
            });
        }

        $users = $query->paginate((int) $perPage);

        return response()->json([
            'success' => true,
            'message' => 'Usuarios obtenidos exitosamente',
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ], 200);
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/admin/users/{id}",
     *     tags={"Administración - Usuarios"},
     *     summary="Eliminar usuario",
     *     description="SoftDelete de usuario",
     *     operationId="deleteUser",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Usuario eliminado",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Usuario no encontrado")
     * )
     */
    #[OA\Delete(path: '/api/v1/admin/users/{id}', tags: ['Administración - Usuarios'], summary: 'Eliminar usuario')]
    public function destroy(int $id): JsonResponse
    {
        $user = User::withTrashed()->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado',
                'data' => null,
            ], 404);
        }

        if (!$user->trashed()) {
            $user->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Usuario eliminado exitosamente',
            'data' => null,
        ], 200);
    }

    /**
     * @OA\Patch(
     *     path="/api/v1/admin/users/{id}/restore",
     *     tags={"Administración - Usuarios"},
     *     summary="Restaurar usuario",
     *     description="Restaura un usuario eliminado",
     *     operationId="restoreUser",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Usuario restaurado",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Usuario no encontrado")
     * )
     */
    #[OA\Patch(path: '/api/v1/admin/users/{id}/restore', tags: ['Administración - Usuarios'], summary: 'Restaurar usuario')]
    public function restore(int $id): JsonResponse
    {
        $user = User::withTrashed()->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado',
                'data' => null,
            ], 404);
        }

        if ($user->trashed()) {
            $user->restore();
        }

        return response()->json([
            'success' => true,
            'message' => 'Usuario restaurado exitosamente',
            'data' => null,
        ], 200);
    }

    /**
     * @OA\Patch(
     *     path="/api/v1/admin/users/{id}/toggle-status",
     *     tags={"Administración - Usuarios"},
     *     summary="Cambiar estado de usuario",
     *     description="Activar o desactivar usuario",
     *     operationId="toggleUserStatus",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="is_active", type="boolean")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Estado actualizado",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true)
     *         )
     *     )
     * )
     */
    #[OA\Patch(path: '/api/v1/admin/users/{id}/toggle-status', tags: ['Administración - Usuarios'], summary: 'Cambiar estado de usuario')]
    public function toggleStatus(Request $request, int $id): JsonResponse
    {
        $user = User::withTrashed()->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado',
                'data' => null,
            ], 404);
        }

        $isActive = $request->input('is_active');
        
        if ($isActive !== null) {
            $user->is_active = (bool) $isActive;
            $user->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Estado actualizado exitosamente',
            'data' => null,
        ], 200);
    }
}