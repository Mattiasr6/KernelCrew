<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        try {
            DB::statement('ALTER TABLE users DROP CONSTRAINT users_role_check');
        } catch (\Exception $e) {
            // La constraint puede no existir
        }

        try {
            DB::statement("DROP TYPE IF EXISTS users_role_enum");
        } catch (\Exception $e) {
            // El tipo puede no existir
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'instructor', 'student'])->default('student')->after('password');
        });
    }
};