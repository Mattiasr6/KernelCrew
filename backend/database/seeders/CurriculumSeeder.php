<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CourseSection;
use App\Models\Lesson;
use Illuminate\Database\Seeder;

class CurriculumSeeder extends Seeder
{
    public function run(): void
    {
        $courses = Course::all();

        if ($courses->isEmpty()) {
            $this->command->warn('No hay cursos. Ejecuta CourseSeeder primero.');
            return;
        }

        $curriculum = [
            '.NET 8' => [
                [
                    'title' => 'Fundamentos de Clean Architecture',
                    'order' => 1,
                    'lessons' => [
                        ['title' => 'Introducción a la Arquitectura Limpia', 'duration' => 45, 'is_free' => true],
                        ['title' => 'Capas de la aplicación: Domain, Application, Infrastructure', 'duration' => 60, 'is_free' => false],
                        ['title' => 'Configuración del proyecto con .NET 8', 'duration' => 50, 'is_free' => false],
                    ],
                ],
                [
                    'title' => 'Implementación de CQRS y Mediator',
                    'order' => 2,
                    'lessons' => [
                        ['title' => 'Patrón CQRS: separando comandos y consultas', 'duration' => 55, 'is_free' => true],
                        ['title' => 'Mediator Pattern con MediatR', 'duration' => 45, 'is_free' => false],
                        ['title' => 'Testing unitario con xUnit y Moq', 'duration' => 50, 'is_free' => false],
                    ],
                ],
            ],
            'Linux' => [
                [
                    'title' => 'Instalación y Configuración del Servidor',
                    'order' => 1,
                    'lessons' => [
                        ['title' => 'Instalación de Ubuntu Server 24.04 LTS', 'duration' => 40, 'is_free' => true],
                        ['title' => 'Gestión de usuarios, grupos y permisos', 'duration' => 50, 'is_free' => false],
                        ['title' => 'Configuración de red y firewall con UFW', 'duration' => 45, 'is_free' => false],
                    ],
                ],
                [
                    'title' => 'Seguridad, Hardening y Monitoreo',
                    'order' => 2,
                    'lessons' => [
                        ['title' => 'Hardening SSH y autenticación por clave pública', 'duration' => 50, 'is_free' => true],
                        ['title' => 'Monitoreo del servidor con Grafana y Prometheus', 'duration' => 55, 'is_free' => false],
                    ],
                ],
            ],
            'IA' => [
                [
                    'title' => 'Fundamentos de Ollama y Modelos Locales',
                    'order' => 1,
                    'lessons' => [
                        ['title' => 'Instalación y configuración de Ollama', 'duration' => 30, 'is_free' => true],
                        ['title' => 'Ejecutando Llama 3 y Mistral localmente', 'duration' => 45, 'is_free' => false],
                    ],
                ],
                [
                    'title' => 'Construcción de Agentes con LangChain',
                    'order' => 2,
                    'lessons' => [
                        ['title' => 'Introducción a LangChain y cadenas de razonamiento', 'duration' => 40, 'is_free' => true],
                        ['title' => 'Creando tu primer agente autónomo', 'duration' => 50, 'is_free' => false],
                    ],
                ],
            ],
            'DevOps' => [
                [
                    'title' => 'Contenedores con Docker',
                    'order' => 1,
                    'lessons' => [
                        ['title' => 'Dockerfiles y multi-stage builds', 'duration' => 40, 'is_free' => true],
                        ['title' => 'Docker Compose para entornos de desarrollo', 'duration' => 45, 'is_free' => false],
                    ],
                ],
                [
                    'title' => 'Orquestación con Kubernetes',
                    'order' => 2,
                    'lessons' => [
                        ['title' => 'Primeros pasos con Kubernetes', 'duration' => 50, 'is_free' => true],
                        ['title' => 'Deployments, Services y ConfigMaps', 'duration' => 55, 'is_free' => false],
                    ],
                ],
            ],
        ];

        $totalSections = 0;
        $totalLessons = 0;

        foreach ($courses as $course) {
            // Buscar el plan curricular que coincide con el título del curso
            $matchedKey = null;
            foreach (array_keys($curriculum) as $key) {
                if (stripos($course->title, $key) !== false) {
                    $matchedKey = $key;
                    break;
                }
            }
            if (!$matchedKey) continue;

            foreach ($curriculum[$matchedKey] as $sectionData) {
                $section = CourseSection::create([
                    'course_id' => $course->id,
                    'title' => $sectionData['title'],
                    'order' => $sectionData['order'],
                ]);
                $totalSections++;

                foreach ($sectionData['lessons'] as $index => $lessonData) {
                    Lesson::create([
                        'course_section_id' => $section->id,
                        'title' => $lessonData['title'],
                        'duration_minutes' => $lessonData['duration'],
                        'order' => $index + 1,
                        'is_free' => $lessonData['is_free'],
                    ]);
                    $totalLessons++;
                }
            }
        }

        $this->command->info("Currículo creado: {$totalSections} secciones, {$totalLessons} lecciones.");
    }
}
