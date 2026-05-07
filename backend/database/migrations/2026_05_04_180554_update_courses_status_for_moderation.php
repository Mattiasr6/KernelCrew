<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Eliminar check constraint del enum anterior (PostgreSQL)
        DB::statement("ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_status_check");

        // Cambiar el default a 'DRAFT' para nuevos cursos
        Schema::table('courses', function (Blueprint $table) {
            $table->string('status', 20)->default('DRAFT')->change();
        });

        // Actualizar registros existentes a mayúsculas para consistencia
        DB::statement("UPDATE courses SET status = 'DRAFT' WHERE LOWER(status) = 'draft'");
        DB::statement("UPDATE courses SET status = 'PUBLISHED' WHERE LOWER(status) = 'published'");
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->string('status', 20)->default('draft')->change();
        });

        DB::statement("UPDATE courses SET status = 'draft' WHERE LOWER(status) = 'draft'");
        DB::statement("UPDATE courses SET status = 'published' WHERE LOWER(status) = 'published'");
        DB::statement("UPDATE courses SET status = 'draft' WHERE LOWER(status) = 'in_review'");
        DB::statement("UPDATE courses SET status = 'draft' WHERE LOWER(status) = 'rejected'");
    }
};
