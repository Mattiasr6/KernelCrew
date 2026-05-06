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

            // 2. Usuarios (Admin, Instructores, Estudiantes)
            UserSeeder::class,

            // 3. Categorías
            CategorySeeder::class,

            // 4. Cursos (4 cursos con estados mixtos)
            CourseSeeder::class,

            // 5. Curriculum (Secciones y Lecciones)
            CurriculumSeeder::class,

            // 6. Inscripciones y Progreso (con lesson_user)
            EnrollmentSeeder::class,

            // 7. Paquetes de Créditos
            CreditPackageSeeder::class,
        ]);

        $this->command->info('=========================================');
        $this->command->info('  DATABASE SEEDING COMPLETE');
        $this->command->info('=========================================');

        $this->command->info('');
        $this->command->info('Credenciales:');
        $this->command->info('- Admin: admin@kernellearn.com / admin123');
        $this->command->info('- Instructor: andrea@kernellearn.com / instructor123');
        $this->command->info('- Estudiante: mattias@kernellearn.com / password (150 créditos)');
        $this->command->info('');
        $this->command->info('Cursos:');
        $this->command->info('- 2 PUBLICADOS: .NET 8, Linux');
        $this->command->info('- 1 DRAFT: IA Agentes Locales');
        $this->command->info('- 1 REJECTED: DevOps Docker K8s');
    }
}
