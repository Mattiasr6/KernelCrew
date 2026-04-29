<?php

namespace Database\Seeders;

use App\Models\Rol;
use App\Models\Permiso;
use Illuminate\Database\Seeder;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            ['nombre' => 'users.list', 'modulo' => 'users'],
            ['nombre' => 'users.create', 'modulo' => 'users'],
            ['nombre' => 'users.edit', 'modulo' => 'users'],
            ['nombre' => 'users.delete', 'modulo' => 'users'],
            ['nombre' => 'courses.list', 'modulo' => 'courses'],
            ['nombre' => 'courses.view', 'modulo' => 'courses'],
            ['nombre' => 'courses.create', 'modulo' => 'courses'],
            ['nombre' => 'courses.edit', 'modulo' => 'courses'],
            ['nombre' => 'courses.delete', 'modulo' => 'courses'],
            ['nombre' => 'courses.publish', 'modulo' => 'courses'],
            ['nombre' => 'subscriptions.list', 'modulo' => 'subscriptions'],
            ['nombre' => 'subscriptions.view', 'modulo' => 'subscriptions'],
            ['nombre' => 'subscriptions.manage', 'modulo' => 'subscriptions'],
            ['nombre' => 'payments.list', 'modulo' => 'payments'],
            ['nombre' => 'payments.view', 'modulo' => 'payments'],
            ['nombre' => 'payments.manage', 'modulo' => 'payments'],
            ['nombre' => 'reports.view', 'modulo' => 'reports'],
            ['nombre' => 'reports.export', 'modulo' => 'reports'],
        ];

        $permissionIds = [];
        foreach ($permissions as $perm) {
            $p = Permiso::updateOrCreate(['nombre' => $perm['nombre']], ['modulo' => $perm['modulo']]);
            $permissionIds[$perm['nombre']] = $p->id;
        }

        $adminRole = Rol::updateOrCreate(['nombre' => 'admin'], ['descripcion' => 'Administrador']);
        $adminRole->syncPermisos(array_values($permissionIds));

        $instructorRole = Rol::updateOrCreate(['nombre' => 'instructor'], ['descripcion' => 'Instructor']);
        $instructorRole->syncPermisos([
            $permissionIds['courses.list'],
            $permissionIds['courses.view'],
            $permissionIds['courses.create'],
            $permissionIds['courses.edit'],
        ]);

        $studentRole = Rol::updateOrCreate(['nombre' => 'student'], ['descripcion' => 'Estudiante']);
        $studentRole->syncPermisos([
            $permissionIds['courses.list'],
            $permissionIds['courses.view'],
            $permissionIds['subscriptions.list'],
            $permissionIds['subscriptions.view'],
        ]);

        $this->command->info('Roles y permisos creados.');
    }
}