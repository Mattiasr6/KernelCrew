<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('nombre')->unique();
            $table->string('descripcion');
            $table->timestamps();
        });

        Schema::create('permisos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('modulo');
            $table->timestamps();
        });

        Schema::create('permiso_rol', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('role_id');
            $table->unsignedBigInteger('permiso_id');
            $table->integer('estado');
            $table->date('fecha_asignacion');
            $table->timestamps();

            $table->foreign('role_id')->references('id')->on('roles')->onDelete('cascade');
            $table->foreign('permiso_id')->references('id')->on('permisos')->onDelete('cascade');
            $table->unique(['role_id', 'permiso_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permiso_rol');
        Schema::dropIfExists('permisos');
        Schema::dropIfExists('roles');
    }
};