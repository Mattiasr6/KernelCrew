<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lesson_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'lesson_id']);
        });

        Schema::table('course_enrollments', function (Blueprint $table) {
            $table->foreignId('last_lesson_id')->nullable()->constrained('lessons')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('course_enrollments', function (Blueprint $table) {
            $table->dropForeign(['last_lesson_id']);
            $table->dropColumn('last_lesson_id');
        });

        Schema::dropIfExists('lesson_user');
    }
};
