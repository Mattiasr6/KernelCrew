<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Activity;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class ActivitySeeder extends Seeder
{
    public function run(): void
    {
        $instructors = User::where('role_id', 2)->get();

        if ($instructors->isEmpty()) {
            $this->command->warn('No hay instructores. Ejecuta UserSeeder primero.');
            return;
        }

        $instructor = $instructors->first();
        $activities = [
            ['type' => 'course_published', 'description' => 'Curso "Arquitectura Limpia con .NET 8 y C#" fue aprobado y publicado.', 'days' => 150],
            ['type' => 'credit_earned', 'description' => 'Ganaste 1 crédito por publicar un curso.', 'days' => 150],
            ['type' => 'course_published', 'description' => 'Curso "Administración de Servidores Linux: De Ubuntu a Debian" fue aprobado y publicado.', 'days' => 120],
            ['type' => 'credit_earned', 'description' => 'Ganaste 1 crédito por publicar un curso.', 'days' => 120],
            ['type' => 'course_published', 'description' => 'Primeros 5 estudiantes se inscribieron en .NET 8.', 'days' => 90],
            ['type' => 'course_published', 'description' => 'Curso .NET 8 alcanzó 50% de tasa de completación.', 'days' => 60],
            ['type' => 'credit_earned', 'description' => 'Recibiste un crédito por alta tasa de estudiantes completando tu curso.', 'days' => 60],
            ['type' => 'course_published', 'description' => 'Curso Linux superó las 10 inscripciones.', 'days' => 30],
            ['type' => 'course_published', 'description' => '3 estudiantes completaron el curso .NET 8 este mes.', 'days' => 15],
            ['type' => 'course_published', 'description' => 'Un nuevo estudiante se inscribió en tu curso de Linux.', 'days' => 3],
        ];

        $count = 0;
        foreach ($activities as $data) {
            Activity::create([
                'user_id' => $instructor->id,
                'type' => $data['type'],
                'description' => $data['description'],
                'created_at' => Carbon::now()->subDays($data['days']),
            ]);
            $count++;
        }

        $this->command->info("Actividades: {$count} eventos creados para el instructor.");
    }
}
