<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = $this->createPermissions();
        $this->createRoles($permissions);
    }

    protected function createPermissions(): array
    {
        $permissionGroups = [
            'users' => [
                'users.list',
                'users.create',
                'users.edit',
                'users.delete',
                'users.manage',
            ],
            'courses' => [
                'courses.list',
                'courses.view',
                'courses.create',
                'courses.edit',
                'courses.delete',
                'courses.publish',
                'courses.manage',
            ],
            'subscriptions' => [
                'subscriptions.list',
                'subscriptions.view',
                'subscriptions.create',
                'subscriptions.manage',
            ],
            'payments' => [
                'payments.list',
                'payments.view',
                'payments.manage',
            ],
            'reports' => [
                'reports.view',
                'reports.export',
            ],
        ];

        $createdPermissions = [];

        foreach ($permissionGroups as $group => $groupPermissions) {
            foreach ($groupPermissions as $permission) {
                $createdPermissions[$permission] = Permission::create([
                    'name' => $permission,
                    'guard_name' => 'web',
                ]);
            }
        }

        return $createdPermissions;
    }

    protected function createRoles(array $permissions): void
    {
        $adminRole = Role::create([
            'name' => 'admin',
            'guard_name' => 'web',
        ]);
        $adminRole->givePermissionTo(Permission::all());

        $instructorRole = Role::create([
            'name' => 'instructor',
            'guard_name' => 'web',
        ]);
        $instructorRole->givePermissionTo([
            $permissions['courses.list'],
            $permissions['courses.view'],
            $permissions['courses.create'],
            $permissions['courses.edit'],
        ]);

        $studentRole = Role::create([
            'name' => 'student',
            'guard_name' => 'web',
        ]);
        $studentRole->givePermissionTo([
            $permissions['courses.list'],
            $permissions['courses.view'],
            $permissions['subscriptions.list'],
            $permissions['subscriptions.view'],
        ]);
    }
}