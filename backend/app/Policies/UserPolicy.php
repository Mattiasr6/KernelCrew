<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        // El usuario autenticado debe ser Admin (1)
        // El usuario a eliminar NO debe ser Admin (1)
        return (int) $user->role_id === 1 && (int) $model->role_id !== 1;
    }
}
