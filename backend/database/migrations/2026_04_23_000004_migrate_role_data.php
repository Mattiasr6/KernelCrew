<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('roles')->insert([
            ['nombre' => 'admin', 'descripcion' => 'Administrador del sistema', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'instructor', 'descripcion' => 'Instructor de cursos', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'student', 'descripcion' => 'Estudiante', 'created_at' => now(), 'updated_at' => now()],
        ]);

        DB::statement("
            UPDATE users 
            SET role_id = CASE 
                WHEN role = 'admin' THEN 1
                WHEN role = 'instructor' THEN 2
                WHEN role = 'student' THEN 3
            END
            WHERE role IS NOT NULL
        ");

        DB::table('users')->where('role', 'admin')->update(['role_id' => 1]);
        DB::table('users')->where('role', 'instructor')->update(['role_id' => 2]);
        DB::table('users')->where('role', 'student')->update(['role_id' => 3]);
    }

    public function down(): void
    {
        DB::table('users')->where('role_id', 1)->update(['role' => 'admin']);
        DB::table('users')->where('role_id', 2)->update(['role' => 'instructor']);
        DB::table('users')->where('role_id', 3)->update(['role' => 'student']);
        DB::table('roles')->whereIn('nombre', ['admin', 'instructor', 'student'])->delete();
    }
};