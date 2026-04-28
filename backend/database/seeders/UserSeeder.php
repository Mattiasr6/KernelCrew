<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Admin Principal',
            'email' => 'admin@kernellearn.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'is_active' => true,
        ]);
        $admin->assignRole('admin');

        $instructor = User::create([
            'name' => 'Carlos Instructor',
            'email' => 'carlos@kernellearn.com',
            'password' => Hash::make('instructor123'),
            'role' => 'instructor',
            'is_active' => true,
        ]);
        $instructor->assignRole('instructor');

        $student = User::create([
            'name' => 'Juan Estudiante',
            'email' => 'juan@kernellearn.com',
            'password' => Hash::make('student123'),
            'role' => 'student',
            'is_active' => true,
        ]);
        $student->assignRole('student');
    }
}