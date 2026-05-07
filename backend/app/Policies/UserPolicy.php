<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
    public function delete(User $user, User $model): bool
    {
        return (int) $user->role_id === UserRole::Admin->value
            && (int) $model->role_id !== UserRole::Admin->value;
    }
}
