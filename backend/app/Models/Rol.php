<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Carbon\Carbon;

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
        return $this->belongsToMany(Permiso::class, 'permiso_rol', 'role_id', 'permiso_id')
            ->withPivot('estado', 'fecha_asignacion')
            ->withTimestamps();
    }

    public function syncPermisos(array $permisoIds): void
    {
        $syncData = [];
        foreach ($permisoIds as $id) {
            $syncData[$id] = [
                'estado' => 1,
                'fecha_asignacion' => Carbon::now()->toDateString(),
            ];
        }
        $this->permisos()->sync($syncData);
    }
}