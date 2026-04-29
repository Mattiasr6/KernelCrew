<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\User;
use App\Models\Category;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        // Crear categorías si no existen
        $categories = [
            ['name' => 'Desarrollo Backend', 'slug' => 'desarrollo-backend', 'is_active' => true],
            ['name' => 'Desarrollo Móvil', 'slug' => 'desarrollo-movil', 'is_active' => true],
            ['name' => 'DevOps y SysAdmin', 'slug' => 'devops-sysadmin', 'is_active' => true],
            ['name' => 'Ciberseguridad', 'slug' => 'ciberseguridad', 'is_active' => true],
            ['name' => 'Inteligencia Artificial', 'slug' => 'inteligencia-artificial', 'is_active' => true],
            ['name' => 'Bases de Datos', 'slug' => 'bases-de-datos', 'is_active' => true],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(['slug' => $cat['slug']], $cat);
        }

        $instructors = User::where('role_id', 2)->get();
        if ($instructors->isEmpty()) {
            $this->command->warn('No hay instructores. Los cursos no serán creados.');
            return;
        }

        $courses = [
            // === LOS 5 CURSOS ESPECÍFICOS ===
            [
                'title' => 'Mastering .NET 8 y Arquitectura Limpia para Backend',
                'description' => 'Domina .NET 8 desde cero hasta nivel experto. Aprende arquitectura limpia (Clean Architecture), patrones de diseño (CQRS, Mediator, Repository), Entity Framework Core 8, autenticación con JWT,Testing unitario con xUnit y despliegue en contenedores Docker. Este curso te llevará de programación básica a poder arquitectar sistemas empresariales complejos.',
                'price' => 5999,
                'level' => 'advanced',
                'category' => 'desarrollo-backend',
                'duration_hours' => 45,
                'short_description' => 'El curso más completo de .NET 8 y arquitectura de software profesional',
            ],
            [
                'title' => 'Desarrollo Multiplataforma con .NET MAUI y C#',
                'description' => 'Crea aplicaciones nativas para iOS, Android, Windows y macOS usando una sola base de código con .NET MAUI. Aprende XAML, data binding, consumo de APIs REST, acceso a cámara y GPS, notificaciones push y publicación en stores. Desde conceptos básicos hasta Publishing en App Store y Google Play.',
                'price' => 4499,
                'level' => 'intermediate',
                'category' => 'desarrollo-movil',
                'duration_hours' => 35,
                'short_description' => 'Crea apps nativas para todas las plataformas con una sola base de código',
            ],
            [
                'title' => 'Administración de Servidores Linux: Fedora 43 y Configuración Samba',
                'description' => 'Conviértete en administrador de sistemas Linux profesional. Aprende desde la instalación de Fedora 43 Server hasta configuración de servicios: SSH hardening, Samba para compartir archivos, NFS, Apache/Nginx, firewall con firewalld, gestión de usuarios y permisos, automatización con cron, y monitoreo con Grafana. Preparación para certificación Linux.',
                'price' => 3999,
                'level' => 'intermediate',
                'category' => 'devops-sysadmin',
                'duration_hours' => 30,
                'short_description' => 'Domina la administración de servidores Linux desde cero',
            ],
            [
                'title' => 'Hacking Ético, Hardening SSH y Auditoría de Redes',
                'description' => 'Aprende a pensar como un atacante para defender mejor. Este curso cubre: metodología de pentesting, reconocimiento y enumeración, explotación de vulnerabilidades, hardening de SSH, configuración de fail2ban, auditoría de redes con Wireshark, análisis de tráfico, detección de intrusiones y elaboración de informes técnicos. Certificación preparatoria CEH.',
                'price' => 5499,
                'level' => 'advanced',
                'category' => 'ciberseguridad',
                'duration_hours' => 40,
                'short_description' => 'Aprende a proteger sistemas mediante técnicas de hacking ético',
            ],
            [
                'title' => 'Creación de Agentes de IA Autónomos con Ollama',
                'description' => 'Introducción práctica a la IA local. Aprende a instalar y configurar Ollama, ejecutar modelos (Llama, Mistral, CodeLlama), crear agentes autónomos que razonan y ejecutan tareas, integración con LangChain, RAG (Retrieval Augmented Generation) para documentos propios, y deployment de chatbots privados. Sin dependencia de APIs externas.',
                'price' => 2999,
                'level' => 'beginner',
                'category' => 'inteligencia-artificial',
                'duration_hours' => 20,
                'short_description' => 'Crea agentes de IA que funcionan offline en tu computadora',
            ],

            // === CURSOS DE RELLENO ===
            [
                'title' => 'Docker y Kubernetes en Producción',
                'description' => 'Domina los contenedores desde fundamentos hasta orquestación con Kubernetes. Crea Dockerfiles optimizados, docker-compose para desarrollo, Helm charts, deployment strategies (blue-green, canary),监控 con Prometheus y Grafana, y CI/CD con GitHub Actions.',
                'price' => 4999,
                'level' => 'advanced',
                'category' => 'devops-sysadmin',
                'duration_hours' => 38,
            ],
            [
                'title' => 'PostgreSQL Avanzado: Rendimiento y Escalabilidad',
                'description' => 'Profundiza en PostgreSQL: índices GiST, GIN, BRIN, Window Functions, CTEs, partitioning, replicación streaming,PgBouncer, optimización de queries, Explain Analyze, y migración desde MySQL.',
                'price' => 3499,
                'level' => 'advanced',
                'category' => 'bases-de-datos',
                'duration_hours' => 25,
            ],
            [
                'title' => 'React con TypeScript y Next.js 14',
                'description' => 'Build de aplicaciones modernas con React 18, TypeScript strict, Next.js 14 (App Router), Server Components, Tailwind CSS, Zustand para estado, React Query para datos, y testing con Vitest.',
                'price' => 3799,
                'level' => 'intermediate',
                'category' => 'desarrollo-backend',
                'duration_hours' => 28,
            ],
            [
                'title' => 'Seguridad en APIs REST con Laravel',
                'description' => 'Protege tus APIs: OAuth 2.0, JWT implementation, Rate Limiting, CORS avanzado, input sanitization, protección XSS y SQL injection, headers de seguridad, y auditoría de vulnerabilidades.',
                'price' => 3299,
                'level' => 'intermediate',
                'category' => 'ciberseguridad',
                'duration_hours' => 22,
            ],
            [
                'title' => 'GraphQL con Node.js y Apollo',
                'description' => 'Crea APIs GraphQL completas con Node.js, Apollo Server, schema design, resolvers, subscriptions para tiempo real, testing, y migración desde REST.',
                'price' => 3599,
                'level' => 'intermediate',
                'category' => 'desarrollo-backend',
                'duration_hours' => 24,
            ],
            [
                'title' => 'Vue.js 3 Composition API y Pinia',
                'description' => 'Master Vue 3 con Composition API, Pinia para estado, Vue Router 4, testing con Vitest, SSR con Nuxt 3, y deployment a producción.',
                'price' => 3299,
                'level' => 'intermediate',
                'category' => 'desarrollo-backend',
                'duration_hours' => 26,
            ],
            [
                'title' => 'AWS para Desarrolladores',
                'description' => 'AWS práctico para devs: EC2, Lambda, S3, RDS, DynamoDB, API Gateway, CloudFront, CI/CD con CodePipeline, y optimización de costos.',
                'price' => 4299,
                'level' => 'intermediate',
                'category' => 'devops-sysadmin',
                'duration_hours' => 32,
            ],
            [
                'title' => 'Python para Ciencia de Datos',
                'description' => 'Aprende Python para análisis de datos: Pandas, NumPy, visualización con Matplotlib y Seaborn, preprocesamiento, y intro a Machine Learning con scikit-learn.',
                'price' => 3799,
                'level' => 'beginner',
                'category' => 'inteligencia-artificial',
                'duration_hours' => 28,
            ],
            [
                'title' => 'Git Avanzado y Flujos de Trabajo en Equipo',
                'description' => 'Git profesional: rebase interactivo, cherry-picking, stash, hooks, Git Flow, GitHub Actions, y resolución efectiva de conflictos.',
                'price' => 1999,
                'level' => 'beginner',
                'category' => 'devops-sysadmin',
                'duration_hours' => 12,
            ],
            [
                'title' => 'Swift y SwiftUI para iOS',
                'description' => 'Desarrolla apps para iPhone y iPad con Swift 5.9 y SwiftUI: views, state management, networking, Core Data, y publicación en App Store.',
                'price' => 4499,
                'level' => 'intermediate',
                'category' => 'desarrollo-móvil',
                'duration_hours' => 35,
            ],
        ];

        foreach ($courses as $index => $courseData) {
            $instructor = $instructors->random();
            $slug = strtolower(trim($courseData['title']));
            $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug);
            $slug = preg_replace('/\s+/', '-', $slug);
            $slug = $slug . '-' . substr(md5($index . time()), 0, 6);

            $category = Category::where('slug', $courseData['category'])->first();

            Course::create([
                'title' => mb_convert_encoding($courseData['title'], 'UTF-8', 'UTF-8'),
                'slug' => $slug,
                'description' => mb_convert_encoding($courseData['description'], 'UTF-8', 'UTF-8'),
                'short_description' => mb_convert_encoding($courseData['short_description'] ?? substr($courseData['description'], 0, 100), 'UTF-8', 'UTF-8'),
                'price' => $courseData['price'],
                'level' => $courseData['level'],
                'duration_hours' => $courseData['duration_hours'],
                'instructor_id' => $instructor->id,
                'category_id' => $category?->id,
                'status' => 'published',
                'is_published' => true,
                'thumbnail' => 'https://placehold.co/800x450/18181b/06b6d4?text=' . urlencode($courseData['title']),
            ]);
        }

        $this->command->info('Se crearon ' . count($courses) . ' cursos exitosamente.');
        $this->command->info('Los 5 cursos específicos fueron creados con niveles: advanced, intermediate, beginner');
    }
}