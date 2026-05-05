<?php

namespace Database\Seeders;

use App\Enums\CourseStatus;
use App\Models\Course;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        $instructor = User::where('role_id', 2)->first();
        if (!$instructor) {
            $this->command->warn('No hay instructores. Ejecuta UserSeeder primero.');
            return;
        }

        $courses = [
            [
                'title' => 'Arquitectura Limpia con .NET 8 y C#',
                'description' => "Domina la arquitectura de software profesional con .NET 8 y C#. Este curso te lleva desde los fundamentos de Clean Architecture hasta la implementación de sistemas empresariales complejos.\n\nAprenderás a aplicar patrones como CQRS, Mediator y Repository Pattern usando Entity Framework Core 8 como ORM. Implementarás autenticación JWT con Identity, testing unitario con xUnit y Moq, y desplegarás tu aplicación en contenedores Docker con CI/CD.\n\nEl proyecto final consiste en construir un sistema de e-learning desde cero, aplicando todos los patrones aprendidos. Ideal para desarrolladores .NET que quieren dar el salto a arquitecto de software.",
                'short_description' => 'De desarrollador a arquitecto: domina Clean Architecture, CQRS y patrones enterprise con .NET 8',
                'price_in_credits' => 100,
                'price' => 9999,
                'level' => 'advanced',
                'duration_hours' => 45,
                'category_slug' => 'backend',
                'status' => CourseStatus::PUBLISHED,
                'instructor_id' => $instructor->id,
                'thumbnail' => 'https://placehold.co/800x450/18181b/06b6d4?text=.NET+8+Clean+Architecture',
            ],
            [
                'title' => 'Administración de Servidores Linux: De Ubuntu a Debian',
                'description' => "Conviértete en un administrador de sistemas Linux profesional. Este curso cubre la instalación, configuración y hardening de servidores Ubuntu Server y Debian desde cero.\n\nAprenderás a gestionar usuarios y permisos, configurar SSH con autenticación por clave pública, implementar firewalls con UFW e iptables, configurar servidores web Apache y Nginx, y desplegar bases de datos PostgreSQL.\n\nEl módulo avanzado cubre automatización con scripts Bash y cron, monitoreo con Grafana y Prometheus, y backup automático con rsync. Completarás el curso con un servidor productivo completamente configurado y seguro.",
                'short_description' => 'Domina Ubuntu y Debian: instalación, hardening, monitoreo y automatización de servidores',
                'price_in_credits' => 80,
                'price' => 7999,
                'level' => 'intermediate',
                'duration_hours' => 30,
                'category_slug' => 'devops-infraestructura',
                'status' => CourseStatus::PUBLISHED,
                'instructor_id' => $instructor->id,
                'thumbnail' => 'https://placehold.co/800x450/18181b/06b6d4?text=Linux+Server+Admin',
            ],
            [
                'title' => 'Orquestación de Agentes de IA Locales',
                'description' => "Aprende a crear, entrenar y orquestar agentes de inteligencia artificial que funcionan completamente en tu computadora, sin depender de APIs externas ni conexión a internet.\n\nComenzarás instalando y configurando Ollama para ejecutar modelos como Llama 3, Mistral y CodeLlama localmente. Luego explorarás LangChain para construir cadenas de razonamiento y agentes autónomos que pueden tomar decisiones, buscar información y ejecutar código.\n\nEl proyecto final te guiará en la creación de un asistente de desarrollo personal que analiza tu código, sugiere mejoras y genera documentación automáticamente, todo ejecutándose en tu hardware local con total privacidad.",
                'short_description' => 'Crea agentes de IA offline con Ollama y LangChain: privacidad total en tu hardware',
                'price_in_credits' => 60,
                'price' => 5999,
                'level' => 'beginner',
                'duration_hours' => 20,
                'category_slug' => 'inteligencia-artificial',
                'status' => CourseStatus::DRAFT,
                'instructor_id' => $instructor->id,
                'thumbnail' => 'https://placehold.co/800x450/18181b/06b6d4?text=IA+Agentes+Locales',
            ],
            [
                'title' => 'DevOps con Docker y Kubernetes en Producción',
                'description' => "Domina el ciclo completo de DevOps usando contenedores Docker y orquestación con Kubernetes en entornos de producción reales.\n\nAprenderás a crear Dockerfiles optimizados con multi-stage builds, configurar docker-compose para desarrollo local, y desplegar clusters de Kubernetes en la nube usando servicios gestionados. Cubriremos Helm charts para empaquetar aplicaciones, estrategias de deployment blue-green y canary, y monitoreo completo con Prometheus y Grafana.\n\nEl curso incluye un laboratorio práctico donde desplegarás una aplicación completa con microservicios, balanceador de carga, auto-scaling y CI/CD con GitHub Actions.",
                'short_description' => 'Docker, Kubernetes, CI/CD y monitoreo: el toolkit completo de DevOps moderno',
                'price_in_credits' => 120,
                'price' => 11999,
                'level' => 'advanced',
                'duration_hours' => 38,
                'category_slug' => 'devops-infraestructura',
                'status' => CourseStatus::REJECTED,
                'rejection_reason' => 'El contenido es demasiado básico para un curso de este nivel. Agrega más laboratorios prácticos con escenarios reales y un módulo avanzado de troubleshooting en producción.',
                'instructor_id' => $instructor->id,
                'thumbnail' => 'https://placehold.co/800x450/18181b/f43f5e?text=DevOps+Docker+K8s',
            ],
        ];

        foreach ($courses as $data) {
            $slug = Course::generateSlug($data['title']);
            $category = Category::where('slug', $data['category_slug'])->first();

            Course::create([
                'title' => $data['title'],
                'slug' => $slug,
                'description' => $data['description'],
                'short_description' => $data['short_description'],
                'price' => $data['price'],
                'price_in_credits' => $data['price_in_credits'],
                'level' => $data['level'],
                'duration_hours' => $data['duration_hours'],
                'instructor_id' => $data['instructor_id'],
                'category_id' => $category?->id,
                'status' => $data['status'],
                'rejection_reason' => $data['rejection_reason'] ?? null,
                'thumbnail' => $data['thumbnail'],
            ]);
        }

        $this->command->info('Cursos creados: 4');
        $this->command->info('- 2 PUBLICADOS: .NET 8 Clean Architecture, Linux Server Admin');
        $this->command->info('- 1 DRAFT: Orquestación de Agentes de IA');
        $this->command->info('- 1 REJECTED: DevOps Docker y Kubernetes');
    }
}
