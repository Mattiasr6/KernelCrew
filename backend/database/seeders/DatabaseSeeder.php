<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('=========================================');
        $this->command->info('  KERNELLEARN - SEEDING DATABASE');
        $this->command->info('=========================================');

        $this->call([
            // 1. Roles y Permisos
            RoleAndPermissionSeeder::class,

            // 2. Planes de Suscripción
            SubscriptionPlanSeeder::class,

            // 3. Usuarios (Admin, Instructores, Estudiantes)
            UserSeeder::class,

            // 4. Cursos (15 cursos profesionales)
            CourseSeeder::class,

            // 5. Suscripciones (activas y vencidas)
            SubscriptionSeeder::class,

            // 6. Inscripciones y Progreso
            EnrollmentSeeder::class,

            // 7. Reseñas y Ratings
            ReviewSeeder::class,

            // 8. Transacciones/Pagos
            PaymentSeeder::class,

            // 9. Certificados (cursos completados)
            CertificateSeeder::class,
        ]);

        $this->command->info('=========================================');
        $this->command->info('  DATABASE SEEDING COMPLETE');
        $this->command->info('=========================================');
        
        // Resumen de datos
        $this->command->info('');
        $this->command->info('Resumen de datos generados:');
        $this->command->info('- Admin: admin@kernellearn.com / admin123');
        $this->command->info('- Instructores: sebastian@kernellearn.com, andrea@kernellearn.com, roberto@kernellearn.com');
        $this->command->info('- Estudiante principal: mattias@kernellearn.com / password');
        $this->command->info('- Cursos: 15 profesionales con niveles (beginner, intermediate, advanced)');
        $this->command->info('- Suscripciones: Activas y vencidas para demo de bloqueo');
        $this->command->info('- Ratings: Promedio ~4.3 en el catálogo');
        $this->command->info('- Transacciones: Distribución en últimos 6 meses con pico reciente');
    }
}