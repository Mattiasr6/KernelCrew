<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        $courses = [
            [
                'title' => 'Arquitectura de Microservicios con Laravel',
                'description' => 'Aprende a diseñar y desarrollar arquitecturas de microservicios utilizando Laravel y Docker. Este curso covers comunicación entre servicios, API Gateway, Message Queues y despliegue en contenedores.',
                'price' => 450.00,
            ],
            [
                'title' => 'Gestión de Redes Privadas con Tailscale',
                'description' => 'Domina la creación de redes privadas seguras utilizando Tailscale. Ideal para equipos de desarrollo que necesitan acceder a recursos locales desde cualquier ubicación sin exposición pública.',
                'price' => 350.00,
            ],
            [
                'title' => 'Bases de Datos Avanzadas (PostgreSQL)',
                'description' => 'Profundiza en PostgreSQL con técnicas avanzadas: Índices GIN/GiST, Window Functions, CTE, replicación, particionamiento y optimización de consultas complejas.',
                'price' => 400.00,
            ],
            [
                'title' => 'Seguridad en APIs REST',
                'description' => 'Implementa las mejores prácticas de seguridad en APIs REST: OAuth 2.0, JWT, Rate Limiting, CORS, sanitización de entradas y protección contra los ataques más comunes.',
                'price' => 380.00,
            ],
            [
                'title' => 'Frontend Moderno con Angular Standalone',
                'description' => 'Domina Angular en su modalidad Standalone sin NgModules. Aprende signals, control flow syntax, deferrable views y las mejores prácticas para aplicaciones performant.',
                'price' => 420.00,
            ],
            [
                'title' => 'CI/CD con GitHub Actions y Tailscale',
                'description' => 'Construye pipelines de integración y despliegue continuo con GitHub Actions. Aprende a desplegar automáticamente a tu servidor local a través de Tailscale sin exponer puertos.',
                'price' => 300.00,
            ],
            [
                'title' => 'Fundamentos de Linux para Desarrolladores',
                'description' => 'Domina la línea de comandos, permisos, procesos, scripting bash y administración básica de servidores Linux. Esencial para cualquier desarrollador backend.',
                'price' => 250.00,
            ],
            [
                'title' => 'Docker & Kubernetes para Proyectos Reales',
                'description' => 'Desde cero hasta producción: Dockerfiles optimizados, docker-compose, orquestación con Kubernetes, Helm charts y despliegue en producción.',
                'price' => 480.00,
            ],
            [
                'title' => 'Patrones de Diseño en PHP',
                'description' => 'Implementa los patrones de diseño más útiles en PHP: Singleton, Factory, Strategy, Repository, Observer, Dependency Injection y más con ejemplos prácticos.',
                'price' => 320.00,
            ],
            [
                'title' => 'Testing Profesional con PHPUnit',
                'description' => 'Escribe pruebas unitarias, de integración y end-to-end con PHPUnit. Aprende mocking, factories, testing de bases de datos y coverage reporting.',
                'price' => 360.00,
            ],
            [
                'title' => 'GraphQL con Laravel',
                'description' => 'Implementa APIs GraphQL completas con Laravel. Aprende schema definition, resolvers, subscriptions y cómo migrar de REST a GraphQL.',
                'price' => 390.00,
            ],
            [
                'title' => 'Redis para Alta Perfomance',
                'description' => 'Utiliza Redis como cache, message broker y cola de tareas. Aprende patrones de caching, sesiones distribuidas y gestión de datos en memoria.',
                'price' => 280.00,
            ],
            [
                'title' => 'Auditoría de Código y Refactoring',
                'description' => 'Técnicas para mejorar código existente sin cambiar su comportamiento. Aprende a usar herramientas estáticas, code smells y refactoring seguro.',
                'price' => 340.00,
            ],
            [
                'title' => 'Event Sourcing y CQRS',
                'description' => 'Arquitecturas avanzadas para sistemas escalables: Event Sourcing, CQRS, proyección de datos y manejo de consistencia eventual en aplicaciones Laravel.',
                'price' => 500.00,
            ],
            [
                'title' => 'Introducción al Cloud Computing con AWS',
                'description' => 'Primeros pasos en AWS: EC2, S3, RDS, Lambda y CloudFront. Aprende a desplegar aplicaciones PHP en la nube con costos optimizados.',
                'price' => 300.00,
            ],
        ];

        $instructors = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['admin', 'instructor']);
        })->get();

        if ($instructors->isEmpty()) {
            $this->command->warn('No se encontraron instructores. Usando el primer usuario disponible.');
            $instructors = User::all();
        }

        foreach ($courses as $index => $courseData) {
            $instructor = $instructors->random();
            $slug = strtolower(trim($courseData['title']));
            $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug);
            $slug = preg_replace('/\s+/', '-', $slug);
            $slug = $slug . '-' . substr(md5($index . time()), 0, 6);

            Course::create([
                'title' => $courseData['title'],
                'slug' => $slug,
                'description' => $courseData['description'],
                'price' => $courseData['price'],
                'instructor_id' => $instructor->id,
                'status' => rand(0, 1) ? 'published' : 'draft',
            ]);
        }

        $this->command->info('Se crearon ' . count($courses) . ' cursos exitosamente.');
    }
}