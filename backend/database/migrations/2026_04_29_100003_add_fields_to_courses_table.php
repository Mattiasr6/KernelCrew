<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            if (!Schema::hasColumn('courses', 'short_description')) {
                $table->string('short_description', 500)->nullable()->after('description');
            }
            if (!Schema::hasColumn('courses', 'level')) {
                $table->enum('level', ['beginner', 'intermediate', 'advanced'])->nullable()->after('short_description');
            }
            if (!Schema::hasColumn('courses', 'duration_hours')) {
                $table->integer('duration_hours')->nullable()->after('level');
            }
            if (!Schema::hasColumn('courses', 'is_published')) {
                $table->boolean('is_published')->default(false)->after('status');
            }
            if (!Schema::hasColumn('courses', 'thumbnail')) {
                $table->string('thumbnail')->nullable()->after('is_published');
            }
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn(['short_description', 'level', 'duration_hours', 'is_published', 'thumbnail']);
        });
    }
};