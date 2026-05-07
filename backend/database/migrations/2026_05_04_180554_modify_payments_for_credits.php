<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // 1. Eliminar FK existente y hacer nullable user_subscription_id
            $table->dropForeign(['user_subscription_id']);
            $table->foreignId('user_subscription_id')->nullable()->change();
            $table->foreign('user_subscription_id')
                ->references('id')
                ->on('user_subscriptions')
                ->nullOnDelete();

            // 2. Agregar columna para paquetes de créditos
            $table->foreignId('credit_package_id')
                ->nullable()
                ->after('user_subscription_id')
                ->constrained('credit_packages')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Revertir credit_package_id
            $table->dropForeign(['credit_package_id']);
            $table->dropColumn('credit_package_id');

            // Revertir user_subscription_id a NOT NULL
            $table->dropForeign(['user_subscription_id']);
            $table->foreignId('user_subscription_id')->change();
            $table->foreign('user_subscription_id')
                ->references('id')
                ->on('user_subscriptions')
                ->restrictOnDelete();
        });
    }
};
