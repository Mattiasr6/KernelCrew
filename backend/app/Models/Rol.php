<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Rol extends Model
{
    protected $table = 'roles';

    protected $fillable = [
        'nombre',
        'descripcion',
    ];

    public function usuarios(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'users', 'role_id');
    }

    public function permisos(): BelongsToMany
    {
        return $this->belongsToMany(Permiso::class, 'permiso_rol')
            ->withPivot('estado', 'fecha_asignacion')
            ->withTimestamps();
    }
}