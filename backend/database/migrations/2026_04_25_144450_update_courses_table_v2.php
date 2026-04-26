<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            // Flag de seguridad para evitar farming de créditos
            if (!Schema::hasColumn('courses', 'is_credit_counted')) {
                $table->boolean('is_credit_counted')->default(false)->after('status');
            }
            
            // Aseguramos que el status soporte 'archived' si no estaba
            $table->string('status')->default('draft')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn('is_credit_counted');
        });
    }
};
