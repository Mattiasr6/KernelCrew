<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // === ADMIN ===
        $admin = User::create([
            'name' => 'Admin Principal',
            'email' => 'admin@kernellearn.com',
            'password' => Hash::make('admin123'),
            'role_id' => 1,
            'is_active' => true,
            'bio' => 'Administrador del sistema KernelLearn',
        ]);

        // === INSTRUCTORES ===
        $instructors = [
            [
                'name' => 'Ing. Sebastián Vásquez',
                'email' => 'sebastian@kernellearn.com',
                'password' => Hash::make('instructor123'),
                'bio' => 'Arquitecto de software con más de 15 años de experiencia en sistemas empresariales. Especialista en .NET, arquitectura limpia y patrones de diseño. Ha liderado equipos de desarrollo en empresas fintech y retail.',
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=sebastian',
            ],
            [
                'name' => 'Mtro. Andrea Fuentes',
                'email' => 'andrea@kernellearn.com',
                'password' => Hash::make('instructor123'),
                'bio' => 'Experta en ciberseguridad y administración de sistemas Linux. Certified Ethical Hacker (CEH) con experiencia en auditorías de seguridad y hardening de servidores. Conferencista internacional en tecnología.',
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=andrea',
            ],
            [
                'name' => 'Dr. Roberto Martínez',
                'email' => 'roberto@kernellearn.com',
                'password' => Hash::make('instructor123'),
                'bio' => 'Doctor en Ciencias de la Computación especializado en inteligencia artificial y machine learning. Investigador en agentes autónomos y modelos de lenguaje locales. Autor de Papers sobre Ollama y LangChain.',
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=roberto',
            ],
        ];

        $instructorUsers = [];
        foreach ($instructors as $inst) {
            $user = User::create([
                'name' => $inst['name'],
                'email' => $inst['email'],
                'password' => $inst['password'],
                'role_id' => 2,
                'is_active' => true,
                'bio' => $inst['bio'],
                'avatar' => $inst['avatar'],
            ]);
            
            $instructorUsers[] = $user;
        }

        // === ESTUDIANTES ===
        $students = [
            [
                'name' => 'Mattias Ribera',
                'email' => 'mattias@kernellearn.com',
                'password' => Hash::make('password'),
                'bio' => 'Desarrollador Fullstack en formación. Interesado en .NET y seguridad informática.',
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=mattias',
            ],
            [
                'name' => 'Ana Gabriela López',
                'email' => 'ana@kernellearn.com',
                'password' => Hash::make('password'),
                'bio' => 'Estudiante de ingeniería de sistemas',
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana',
            ],
            [
                'name' => 'Carlos Mendoza',
                'email' => 'carlos@kernellearn.com',
                'password' => Hash::make('password'),
                'bio' => 'Aspirante a desarrollador backend',
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
            ],
            [
                'name' => 'María Elena Torres',
                'email' => 'maria@kernellearn.com',
                'password' => Hash::make('password'),
                'bio' => 'Interesada en DevOps y cloud computing',
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
            ],
            [
                'name' => 'Jorge Luis Sánchez',
                'email' => 'jorge@kernellearn.com',
                'password' => Hash::make('password'),
                'bio' => 'Estudiante de ciberseguridad',
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=jorge',
            ],
            [
                'name' => 'Sofia Herrera',
                'email' => 'sofia@kernellearn.com',
                'password' => Hash::make('password'),
                'bio' => 'Desarrolladora frontend junior',
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=sofia',
            ],
            [
                'name' => 'Diego Alejandro',
                'email' => 'diego@kernellearn.com',
                'password' => Hash::make('password'),
                'bio' => 'Interesado en IA y machine learning',
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=diego',
            ],
            [
                'name' => 'Valentina Ruiz',
                'email' => 'valentina@kernellearn.com',
                'password' => Hash::make('password'),
                'bio' => 'Estudiante de desarrollo móvil',
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=valentina',
            ],
            [
                'name' => 'Fernando González',
                'email' => 'fernando@kernellearn.com',
                'password' => Hash::make('password'),
                'bio' => 'Especialista en bases de datos',
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=fernando',
            ],
            [
                'name' => 'Isabella Morales',
                'email' => 'isabella@kernellearn.com',
                'password' => Hash::make('password'),
                'bio' => 'Aspirante a ingeniero de datos',
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=isabella',
            ],
            [
                'name' => 'Roberto Aguirre',
                'email' => 'roberto.aguirre@kernellearn.com',
                'password' => Hash::make('password'),
                'bio' => 'Desarrollador con experiencia en PHP',
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=robertoag',
            ],
        ];

        $studentUsers = [];
        foreach ($students as $student) {
            $user = User::create([
                'name' => $student['name'],
                'email' => $student['email'],
                'password' => $student['password'],
                'role_id' => 3,
                'is_active' => true,
                'bio' => $student['bio'],
                'avatar' => $student['avatar'] ?? null,
            ]);
            
            $studentUsers[] = $user;
        }

        $this->command->info("Usuarios creados:");
        $this->command->info("- 1 Admin");
        $this->command->info("- " . count($instructorUsers) . " Instructores");
        $this->command->info("- " . count($studentUsers) . " Estudiantes");
        $this->command->info("- Mattias Ribera creado con password: password");
    }
}