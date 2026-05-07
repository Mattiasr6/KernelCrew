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
            // 1. Fundación
            RoleAndPermissionSeeder::class,
            UserSeeder::class,
            CategorySeeder::class,

            // 2. Contenido
            CourseSeeder::class,
            CurriculumSeeder::class,

            // 3. Economía de Créditos
            CreditPackageSeeder::class,
            PaymentSeeder::class,

            // 4. Comunidad y Actividad
            EnrollmentSeeder::class,
            ReviewSeeder::class,
            ActivitySeeder::class,

            // 5. Certificados (dependen de enrollements 100%)
            CertificateSeeder::class,
        ]);

        $this->command->info('=========================================');
        $this->command->info('  DATABASE SEEDING COMPLETE');
        $this->command->info('=========================================');

        $this->command->info('');
        $this->command->info('Credenciales:');
        $this->command->info('- Admin: admin@kernellearn.com / admin123');
        $this->command->info('- Instructor: andrea@kernellearn.com / instructor123');
        $this->command->info('- Estudiante: mattias@kernellearn.com / password');
        $this->command->info('');
        $this->command->info('Estadísticas de la comunidad:');
        $this->command->info('- 11 estudiantes activos');
        $this->command->info('- 2 cursos publicados con 19 lecciones');
        $this->command->info('- 18 inscripciones con progreso real');
        $this->command->info('- 15 reseñas (avg 4.3★)');
        $this->command->info('- 7 compras de créditos (\$86 USD)');
        $this->command->info('- Certificados emitidos para cursos completados');
    }
}
