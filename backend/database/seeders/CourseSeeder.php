<?php

declare(strict_types=1);

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
            // === Desarrollo Web (5 courses) ===
            [
                'title' => 'React 19: De Cero a Experto con TypeScript',
                'description' => 'Domina React 19 con TypeScript desde los fundamentos hasta patrones avanzados. Aprenderás Server Components, Actions, useOptimistic, y el nuevo compilador de React. Construirás 3 proyectos completos: un dashboard, un clon de Trello y una app de e-commerce con pagos reales.',
                'short_description' => 'Server Components, Actions, useOptimistic y 3 proyectos reales con el nuevo React 19',
                'price_in_credits' => 90,
                'price' => 8999,
                'level' => 'intermediate',
                'duration_hours' => 40,
                'category_slug' => 'desarrollo-web',
                'status' => CourseStatus::PUBLISHED,
                'instructor_id' => $instructor->id,
                'thumbnail' => 'https://placehold.co/800x450/18181b/06b6d4?text=React+19+TypeScript',
            ],
            [
                'title' => 'Angular 21: Arquitectura Enterprise con Signals',
                'description' => 'Aprende Angular 21 con Signals, control flow y el nuevo modelo de reactividad. Cubre routing avanzado, lazy loading, NgRx Signal Store, testing con Jest y despliegue con Docker. Ideal para equipos que quieren construir aplicaciones escalables y mantenibles.',
                'short_description' => 'Signals, Signal Store, routing avanzado y testing con el Angular moderno',
                'price_in_credits' => 110,
                'price' => 10999,
                'level' => 'advanced',
                'duration_hours' => 50,
                'category_slug' => 'desarrollo-web',
                'status' => CourseStatus::PUBLISHED,
                'instructor_id' => $instructor->id,
                'thumbnail' => 'https://placehold.co/800x450/18181b/06b6d4?text=Angular+21+Signals',
            ],
            [
                'title' => 'Vue 3 + Pinia: Desarrollo Ágil de SPAs',
                'description' => 'Descubre Vue 3 Composition API con Pinia para gestión de estado. Aprenderás a crear componentes reutilizables, implementar rutas dinámicas, formularios complejos con VeeValidate, y desplegar en Vercel y Netlify. Incluye un proyecto final de clon de Notion.',
                'short_description' => 'Composition API, Pinia, formularios y despliegue rápido con Vue 3',
                'price_in_credits' => 70,
                'price' => 6999,
                'level' => 'beginner',
                'duration_hours' => 35,
                'category_slug' => 'desarrollo-web',
                'status' => CourseStatus::PUBLISHED,
                'instructor_id' => $instructor->id,
                'thumbnail' => 'https://placehold.co/800x450/18181b/06b6d4?text=Vue+3+Pinia',
            ],
            [
                'title' => 'Tailwind CSS 4: Diseño Moderno Sin Esfuerzo',
                'description' => 'Domina Tailwind CSS 4 con las nuevas utilidades, diseño responsive, animaciones y el nuevo engine CSS. Aprenderás a crear temas oscuros, layouts complejos y componentes accesibles sin escribir una línea de CSS personalizado.',
                'short_description' => 'Utility-first, responsive, animaciones y temas con Tailwind CSS 4',
                'price_in_credits' => 50,
                'price' => 4999,
                'level' => 'beginner',
                'duration_hours' => 20,
                'category_slug' => 'desarrollo-web',
                'status' => CourseStatus::IN_REVIEW,
                'instructor_id' => $instructor->id,
                'thumbnail' => 'https://placehold.co/800x450/18181b/06b6d4?text=Tailwind+CSS+4',
            ],
            [
                'title' => 'Next.js 15: Full-Stack con React y Node',
                'description' => 'Construye aplicaciones full-stack con Next.js 15 App Router, Server Actions, autenticación con NextAuth, y bases de datos con Prisma. Cubre renderizado híbrido, ISR, streaming y optimización de rendimiento para producción.',
                'short_description' => 'App Router, Server Actions, Prisma y despliegue en Vercel',
                'price_in_credits' => 95,
                'price' => 9499,
                'level' => 'intermediate',
                'duration_hours' => 42,
                'category_slug' => 'desarrollo-web',
                'status' => CourseStatus::PUBLISHED,
                'instructor_id' => $instructor->id,
                'thumbnail' => 'https://placehold.co/800x450/18181b/06b6d4?text=Next.js+15',
            ],

            // === Backend (5 courses) ===
            [
                'title' => 'Arquitectura Limpia con .NET 8 y C#',
                'description' => 'Domina la arquitectura de software profesional con .NET 8 y C#. Aprenderás Clean Architecture, CQRS, Mediator, Entity Framework Core, autenticación JWT con Identity, testing con xUnit y Moq, y despliegue en Docker con CI/CD. El proyecto final es un sistema de e-learning completo.',
                'short_description' => 'Clean Architecture, CQRS, Entity Framework y DDD con .NET 8',
                'price_in_credits' => 120,
                'price' => 11999,
                'level' => 'advanced',
                'duration_hours' => 45,
                'category_slug' => 'backend',
                'status' => CourseStatus::PUBLISHED,
                'instructor_id' => $instructor->id,
                'thumbnail' => 'https://placehold.co/800x450/18181b/06b6d4?text=.NET+8+Clean+Arch',
            ],
            [
                'title' => 'Laravel 11: APIs RESTful y Microservicios',
                'description' => 'Construye APIs RESTful profesionales con Laravel 11, usando Sanctum para autenticación, Laravel Reverb para WebSockets, y Octane para alto rendimiento. Cubre patrones Repository, Service Layer, DTOs, testing con Pest, y despliegue con Forge.',
                'short_description' => 'REST APIs, WebSockets, Octane, Pest testing y despliegue con Laravel 11',
                'price_in_credits' => 85,
                'price' => 8499,
                'level' => 'intermediate',
                'duration_hours' => 38,
                'category_slug' => 'backend',
                'status' => CourseStatus::PUBLISHED,
                'instructor_id' => $instructor->id,
                'thumbnail' => 'https://placehold.co/800x450/18181b/06b6d4?text=Laravel+11+APIs',
            ],
            [
                'title' => 'Go: Concurrencia y APIs de Alto Rendimiento',
                'description' => 'Domina Go para construir APIs de alto rendimiento con goroutines, channels y patterns de concurrencia. Aprenderás Gin, GORM, testing, profiling, y despliegue de microservicios. Ideal para sistemas que requieren throughput masivo.',
                'short_description' => 'Goroutines, Gin, GORM, concurrencia y microservicios en Go',
                'price_in_credits' => 100,
                'price' => 9999,
                'level' => 'advanced',
                'duration_hours' => 35,
                'category_slug' => 'backend',
                'status' => CourseStatus::PUBLISHED,
                'instructor_id' => $instructor->id,
                'thumbnail' => 'https://placehold.co/800x450/18181b/06b6d4?text=Go+Concurrency',
            ],
            [
                'title' => 'Python FastAPI: APIs Modernas con Type Hints',
                'description' => 'Crea APIs modernas con FastAPI aprovechando type hints de Python. Cubre SQLAlchemy, async/await, WebSockets, OAuth2, y documentación automática con Swagger. Incluye un proyecto de sistema de colas con Celery y Redis.',
                'short_description' => 'FastAPI, SQLAlchemy, async, OAuth2 y Celery con Python moderno',
                'price_in_credits' => 65,
                'price' => 6499,
                'level' => 'beginner',
                'duration_hours' => 30,
                'category_slug' => 'backend',
                'status' => CourseStatus::PUBLISHED,
                'instructor_id' => $instructor->id,
                'thumbnail' => 'https://placehold.co/800x450/18181b/06b6d4?text=FastAPI+Python',
            ],
            [
                'title' => 'PostgreSQL: Optimización y Alta Disponibilidad',
                'description' => 'Domina PostgreSQL desde la optimización de queries hasta clusters de alta disponibilidad. Cubre índices avanzados, particionamiento, replicación streaming, pgBadger para monitoreo, y migraciones sin downtime con pgroll.',
                'short_description' => 'Índices, particionamiento, replicación y tuning de PostgreSQL en producción',
                'price_in_credits' => 80,
                'price' => 7999,
                'level' => 'advanced',
                'duration_hours' => 32,
                'category_slug' => 'backend',
                'status' => CourseStatus::DRAFT,
                'instructor_id' => $instructor->id,
                'thumbnail' => 'https://placehold.co/800x450/18181b/06b6d4?text=PostgreSQL+Pro',
            ],

            // === DevOps & Infraestructura (5 courses) ===
            [
                'title' => 'Administración de Servidores Linux: De Ubuntu a Debian',
                'description' => 'Conviértete en administrador de sistemas Linux profesional. Cubre instalación, hardening, gestión de usuarios, SSH con clave pública, firewalls UFW/iptables, servidores web Apache y Nginx, y bases de datos PostgreSQL. Módulo avanzado con Bash scripting, cron, Grafana, Prometheus y backups con rsync.',
                'short_description' => 'Hardening, monitoreo, automatización y servidores productivos Linux',
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
                'title' => 'DevOps con Docker y Kubernetes en Producción',
                'description' => 'Domina Docker multi-stage builds, docker-compose, y Kubernetes en producción. Cubre Helm charts, estrategias blue-green y canary, auto-scaling, y CI/CD con GitHub Actions. Laboratorio completo con microservicios y monitoreo Prometheus+Grafana.',
                'short_description' => 'Docker, K8s, Helm, CI/CD y monitoreo: el toolkit completo de DevOps',
                'price_in_credits' => 120,
                'price' => 11999,
                'level' => 'advanced',
                'duration_hours' => 38,
                'category_slug' => 'devops-infraestructura',
                'status' => CourseStatus::REJECTED,
                'rejection_reason' => 'El contenido es demasiado básico para un curso avanzado. Agrega más laboratorios prácticos con escenarios reales de troubleshooting en producción.',
                'instructor_id' => $instructor->id,
                'thumbnail' => 'https://placehold.co/800x450/18181b/f43f5e?text=DevOps+Docker+K8s',
            ],
            [
                'title' => 'Terraform: Infraestructura como Código Multi-Cloud',
                'description' => 'Automatiza infraestructura en AWS, GCP y Azure con Terraform. Cubre HCL, módulos reutilizables, state management remoto, workspaces, y GitOps con Terragrunt. Proyecto final: infraestructura completa de una startup con 3 entornos.',
                'short_description' => 'IaC con Terraform, multi-cloud, módulos y GitOps para infraestructura moderna',
                'price_in_credits' => 90,
                'price' => 8999,
                'level' => 'intermediate',
                'duration_hours' => 35,
                'category_slug' => 'devops-infraestructura',
                'status' => CourseStatus::PUBLISHED,
                'instructor_id' => $instructor->id,
                'thumbnail' => 'https://placehold.co/800x450/18181b/06b6d4?text=Terraform+IaC',
            ],
            [
                'title' => 'CI/CD con GitHub Actions y GitLab CI',
                'description' => 'Aprende a diseñar pipelines de integración y despliegue continuo con GitHub Actions y GitLab CI. Cubre matrices de testing, caching inteligente, despliegue multi-entorno, security scanning con SonarQube, y estrategias de versionado semántico.',
                'short_description' => 'Pipelines, matrices, caching, security scanning y despliegue automatizado',
                'price_in_credits' => 60,
                'price' => 5999,
                'level' => 'beginner',
                'duration_hours' => 25,
                'category_slug' => 'devops-infraestructura',
                'status' => CourseStatus::PUBLISHED,
                'instructor_id' => $instructor->id,
                'thumbnail' => 'https://placehold.co/800x450/18181b/06b6d4?text=CI+CD+Pipelines',
            ],
            [
                'title' => 'AWS Solutions Architect: De Principiante a Certificado',
                'description' => 'Prepárate para la certificación AWS Solutions Architect Associate. Cubre EC2, S3, RDS, Lambda, VPC, IAM, CloudFront, Route53, y ECS. Incluye laboratorios prácticos con AWS Free Tier y simulacros de examen con 200+ preguntas.',
                'short_description' => 'EC2, S3, Lambda, VPC, IAM y preparación completa para certificación AWS',
                'price_in_credits' => 150,
                'price' => 14999,
                'level' => 'intermediate',
                'duration_hours' => 55,
                'category_slug' => 'devops-infraestructura',
                'status' => CourseStatus::PUBLISHED,
                'instructor_id' => $instructor->id,
                'thumbnail' => 'https://placehold.co/800x450/18181b/06b6d4?text=AWS+Solutions+Arch',
            ],

            // === Inteligencia Artificial (5 courses) ===
            [
                'title' => 'Orquestación de Agentes de IA Locales',
                'description' => 'Crea, entrena y orquesta agentes de IA que funcionan completamente en local con Ollama y LangChain. Explora modelos Llama 3, Mistral y CodeLlama, construye cadenas de razonamiento y agentes autónomos que ejecutan código. Proyecto final: asistente de desarrollo personal con privacidad total.',
                'short_description' => 'Agentes offline con Ollama y LangChain: privacidad total en tu hardware',
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
                'title' => 'Machine Learning con Python: De Cero a Producción',
                'description' => 'Aprende Machine Learning con scikit-learn, XGBoost y TensorFlow. Cubre regresión, clasificación, clustering, feature engineering, y despliegue de modelos con MLflow y FastAPI. Incluye 5 proyectos reales con datasets de Kaggle.',
                'short_description' => 'scikit-learn, XGBoost, TensorFlow, feature engineering y MLOps',
                'price_in_credits' => 95,
                'price' => 9499,
                'level' => 'intermediate',
                'duration_hours' => 45,
                'category_slug' => 'inteligencia-artificial',
                'status' => CourseStatus::PUBLISHED,
                'instructor_id' => $instructor->id,
                'thumbnail' => 'https://placehold.co/800x450/18181b/06b6d4?text=ML+Python',
            ],
            [
                'title' => 'Deep Learning con PyTorch: Redes Neuronales Avanzadas',
                'description' => 'Domina Deep Learning con PyTorch: CNNs para visión, RNNs/LSTMs para secuencias, Transformers para NLP, y GANs para generación. Cubre entrenamiento distribuido, deployment con TorchServe, y fine-tuning de modelos pre-entrenados.',
                'short_description' => 'PyTorch, CNNs, Transformers, GANs y deployment de modelos deep learning',
                'price_in_credits' => 130,
                'price' => 12999,
                'level' => 'advanced',
                'duration_hours' => 50,
                'category_slug' => 'inteligencia-artificial',
                'status' => CourseStatus::PUBLISHED,
                'instructor_id' => $instructor->id,
                'thumbnail' => 'https://placehold.co/800x450/18181b/06b6d4?text=Deep+Learning+PyTorch',
            ],
            [
                'title' => 'Procesamiento de Lenguaje Natural con Hugging Face',
                'description' => 'Aprende NLP moderno con la biblioteca Hugging Face Transformers. Cubre fine-tuning de BERT, GPT, T5 y Llama para clasificación, QA, traducción y generación. Incluye deployment con Inference Endpoints y optimización con ONNX.',
                'short_description' => 'Transformers, BERT, GPT, fine-tuning y deployment con Hugging Face',
                'price_in_credits' => 85,
                'price' => 8499,
                'level' => 'advanced',
                'duration_hours' => 35,
                'category_slug' => 'inteligencia-artificial',
                'status' => CourseStatus::IN_REVIEW,
                'instructor_id' => $instructor->id,
                'thumbnail' => 'https://placehold.co/800x450/18181b/06b6d4?text=NLP+Hugging+Face',
            ],
            [
                'title' => 'ChatGPT API: Integración y Productos con GPT-4',
                'description' => 'Construye productos potenciados por la API de OpenAI. Cubre prompt engineering, RAG con Pinecone, fine-tuning, function calling, y asistentes autónomos. Proyecto final: un chatbot de soporte técnico con memoria y acceso a base de conocimiento.',
                'short_description' => 'GPT-4 API, prompt engineering, RAG y asistentes autónomos en producción',
                'price_in_credits' => 75,
                'price' => 7499,
                'level' => 'intermediate',
                'duration_hours' => 28,
                'category_slug' => 'inteligencia-artificial',
                'status' => CourseStatus::PUBLISHED,
                'instructor_id' => $instructor->id,
                'thumbnail' => 'https://placehold.co/800x450/18181b/06b6d4?text=ChatGPT+API',
            ],
        ];

        $youtubeIds = [
            'HVZIg7b4i-4',   // React 19
            'R1QePsia5xk',   // Angular 21
            'LAozf_wDejU',   // Vue 3
            'R5EXap3vNDA',   // Tailwind CSS 4
            'C9b1dhPsGec',   // Next.js 15
            'HeAC9W5c4jA',   // .NET 8 Clean Arch
            'Oa_pHsymaiA',   // Laravel 11
            'ID9NZ88JeOE',   // Go Concurrency
            'OKUDmlvB8Hk',   // FastAPI
            'zTyRIe83CJY',   // PostgreSQL
            'L906Kti3gzE',   // Linux Server
            'gjRoNFopFig',   // Docker K8s
            'Z94DYoF5ufg',   // Terraform
            'xXde5PzV8X4',   // CI/CD
            'j4eoatveZq0',   // AWS Architect
            'vCA2jBthyhA',   // IA Agentes Locales
            'xrQ1YH0PnrM',   // ML Python
            'kY14KfZQ1TI',   // Deep Learning PyTorch
            'vhBR1BaIUyA',   // NLP Hugging Face
            'dlm2okvxvUE',   // ChatGPT API
        ];

        foreach ($courses as $index => $data) {
            $slug = Course::generateSlug($data['title']);
            $category = Category::where('slug', $data['category_slug'])->first();
            $ytId = $youtubeIds[$index] ?? null;

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
                'thumbnail' => $ytId ? "https://img.youtube.com/vi/{$ytId}/maxresdefault.jpg" : $data['thumbnail'],
                'video_url' => $ytId ? "https://www.youtube.com/embed/{$ytId}?rel=0&modestbranding=1" : null,
                'is_credit_counted' => $data['status'] === CourseStatus::PUBLISHED,
            ]);
        }

        $count = count($courses);
        $published = count(array_filter($courses, fn($c) => $c['status'] === CourseStatus::PUBLISHED));
        $draft = count(array_filter($courses, fn($c) => $c['status'] === CourseStatus::DRAFT));
        $review = count(array_filter($courses, fn($c) => $c['status'] === CourseStatus::IN_REVIEW));
        $rejected = count(array_filter($courses, fn($c) => $c['status'] === CourseStatus::REJECTED));

        $this->command->info("Cursos creados: {$count} (Publicados: {$published}, Borrador: {$draft}, Revisión: {$review}, Rechazados: {$rejected})");
    }
}
