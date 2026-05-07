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
                        [
                            'title' => 'Introducción a la Arquitectura Limpia',
                            'duration' => 45, 'is_free' => true,
                            'content' => '<h3>¿Qué es Clean Architecture?</h3><p>La <strong>Arquitectura Limpia</strong> (Clean Architecture) es un conjunto de principios de diseño de software propuestos por Robert C. Martin (Uncle Bob) que buscan crear sistemas que sean:</p><ul><li><strong>Independientes del framework</strong> — Los frameworks son herramientas, no la base del sistema.</li><li><strong>Testeables</strong> — Las reglas de negocio pueden probarse sin depender de la UI, base de datos o servidor.</li><li><strong>Independientes de la UI</strong> — La interfaz puede cambiar sin afectar la lógica de negocio.</li><li><strong>Independientes de la base de datos</strong> — Puedes cambiar de PostgreSQL a MongoDB sin tocar el core.</li></ul><p>Esta arquitectura organiza el código en <strong>capas concéntricas</strong>, donde las dependencias apuntan hacia adentro (hacia el dominio).</p>',
                        ],
                        [
                            'title' => 'Capas de la aplicación: Domain, Application, Infrastructure',
                            'duration' => 60, 'is_free' => false,
                            'content' => '<h3>Las 4 capas principales</h3><p>Clean Architecture divide la aplicación en cuatro capas principales:</p><ol><li><strong>Domain</strong> — Entidades, value objects, interfaces de repositorio. Es el núcleo puro del negocio.</li><li><strong>Application</strong> — Casos de uso, DTOs, mapeadores. Orquesta el flujo de datos.</li><li><strong>Infrastructure</strong> — Implementaciones concretas (Entity Framework, archivos, APIs externas).</li><li><strong>Presentation</strong> — Controladores, vistas, APIs. Es la puerta de entrada al sistema.</li></ol><p>La regla de oro: <em>las capas internas no conocen nada sobre las externas</em>. La capa Domain nunca debe hacer referencia a Entity Framework o a un controlador web.</p>',
                        ],
                        [
                            'title' => 'Configuración del proyecto con .NET 8',
                            'duration' => 50, 'is_free' => false,
                            'content' => '<h3>Creando la solución desde cero</h3><p>Para implementar Clean Architecture con .NET 8, seguiremos estos pasos:</p><pre><code>dotnet new sln -n CleanArchExample\ndotnet new classlib -n CleanArchExample.Domain\ndotnet new classlib -n CleanArchExample.Application\ndotnet new webapi -n CleanArchExample.Api</code></pre><p>Luego agregamos las referencias entre proyectos respetando la dirección de dependencias:</p><ul><li>Application → Domain</li><li>Infrastructure → Application</li><li>Api → Infrastructure</li></ul>',
                        ],
                    ],
                ],
                [
                    'title' => 'Implementación de CQRS y Mediator',
                    'order' => 2,
                    'lessons' => [
                        [
                            'title' => 'Patrón CQRS: separando comandos y consultas',
                            'duration' => 55, 'is_free' => true,
                            'content' => '<h3>Command Query Responsibility Segregation</h3><p>CQRS es un patrón que separa las operaciones de <strong>lectura</strong> (Queries) de las de <strong>escritura</strong> (Commands).</p><ul><li><strong>Commands</strong>: Cambian el estado del sistema. Deberían devolver void o un identificador.</li><li><strong>Queries</strong>: Devuelven datos. No modifican el estado.</li></ul><p>Beneficio principal: puedes escalar y optimizar lecturas y escrituras de forma independiente.</p>',
                        ],
                        [
                            'title' => 'Mediator Pattern con MediatR',
                            'duration' => 45, 'is_free' => false,
                            'content' => '<h3>MediatR: el bus de comandos</h3><p><strong>MediatR</strong> es una librería que implementa el patrón Mediator en .NET, permitiendo desacoplar los handlers de los request:</p><pre><code>public class CreateCourseCommand : IRequest&lt;int&gt;\n{\n    public string Title { get; set; }\n    public string Description { get; set; }\n}\n\npublic class CreateCourseHandler : IRequestHandler&lt;CreateCourseCommand, int&gt;\n{\n    public async Task&lt;int&gt; Handle(...) { ... }\n}</code></pre><p>El controlador solo necesita inyectar <code>IMediator</code> y llamar a <code>mediator.Send(command)</code>.</p>',
                        ],
                        [
                            'title' => 'Testing unitario con xUnit y Moq',
                            'duration' => 50, 'is_free' => false,
                            'content' => '<h3>Probando los casos de uso</h3><p>El testing se vuelve simple porque las dependencias se inyectan como interfaces:</p><pre><code>[Fact]\npublic async Task CreateCourse_ShouldReturnId()\n{\n    var repo = new Mock&lt;ICourseRepository&gt;();\n    var handler = new CreateCourseHandler(repo.Object);\n    var result = await handler.Handle(new CreateCourseCommand { ... });\n    Assert.True(result > 0);\n}</code></pre><p>Mockeamos las interfaces de infraestructura y probamos solo la lógica de aplicación.</p>',
                        ],
                    ],
                ],
            ],
            'Linux' => [
                [
                    'title' => 'Instalación y Configuración del Servidor',
                    'order' => 1,
                    'lessons' => [
                        [
                            'title' => 'Instalación de Ubuntu Server 24.04 LTS',
                            'duration' => 40, 'is_free' => true,
                            'content' => '<h3>Instalación paso a paso</h3><p>Ubuntu Server 24.04 LTS es la versión más estable para entornos de producción. Sigue estos pasos:</p><ol><li>Descarga la ISO desde <a href="https://ubuntu.com/download/server">ubuntu.com</a></li><li>Crea un USB booteable con Rufus o balenaEtcher</li><li>Bootea el servidor y selecciona "Install Ubuntu Server"</li><li>Configura el idioma, teclado y zona horaria</li><li>Selecciona "Install OpenSSH server" cuando se te pregunte</li></ol><p>Una vez instalado, conectate via SSH para continuar la configuración.</p>',
                        ],
                        [
                            'title' => 'Gestión de usuarios, grupos y permisos',
                            'duration' => 50, 'is_free' => false,
                            'content' => '<h3>Seguridad multiusuario</h3><p>Linux maneja permisos mediante una matriz de <strong>usuario:grupo:otros</strong>:</p><pre><code># Crear usuario\nsudo useradd -m -s /bin/bash juanperez\n# Asignar contraseña\nsudo passwd juanperez\n# Agregar al grupo sudo\nsudo usermod -aG sudo juanperez\n# Ver permisos\nls -la /home/</code></pre><p>Los permisos se representan con números: 7=rwx, 6=rw-, 5=r-x, 4=r--</p>',
                        ],
                        [
                            'title' => 'Configuración de red y firewall con UFW',
                            'duration' => 45, 'is_free' => false,
                            'content' => '<h3>UFW — Uncomplicated Firewall</h3><p>UFW simplifica la gestión de iptables. Configuración básica:</p><pre><code>sudo ufw default deny incoming\nsudo ufw default allow outgoing\nsudo ufw allow ssh\nsudo ufw allow 80/tcp\nsudo ufw allow 443/tcp\nsudo ufw enable\nsudo ufw status verbose</code></pre><p>Siempre permite SSH antes de habilitar el firewall para no perder acceso al servidor.</p>',
                        ],
                    ],
                ],
                [
                    'title' => 'Seguridad, Hardening y Monitoreo',
                    'order' => 2,
                    'lessons' => [
                        [
                            'title' => 'Hardening SSH y autenticación por clave pública',
                            'duration' => 50, 'is_free' => true,
                            'content' => '<h3>Asegurando el acceso SSH</h3><p>Edita <code>/etc/ssh/sshd_config</code> y cambia estas opciones:</p><ul><li><code>Port 2222</code> — Cambia el puerto por defecto</li><li><code>PermitRootLogin no</code> — Desactiva login como root</li><li><code>PasswordAuthentication no</code> — Solo claves SSH</li><li><code>PubkeyAuthentication yes</code></li></ul><p>Luego reinicia el servicio: <code>sudo systemctl restart sshd</code></p>',
                        ],
                        [
                            'title' => 'Monitoreo del servidor con Grafana y Prometheus',
                            'duration' => 55, 'is_free' => false,
                            'content' => '<h3>Monitoreo en tiempo real</h3><p>Grafana + Prometheus forman el stack de monitoreo más popular:</p><ol><li>Instala Prometheus: <code>sudo apt install prometheus</code></li><li>Configura los targets a monitorear en <code>/etc/prometheus/prometheus.yml</code></li><li>Instala Grafana: <code>sudo apt install grafana</code></li><li>Accede a <code>http://tu-servidor:3000</code> con admin/admin</li><li>Agrega Prometheus como data source y crea dashboards</li></ol><p>Puedes monitorear CPU, RAM, disco, red y procesos críticos.</p>',
                        ],
                    ],
                ],
            ],
            'IA' => [
                [
                    'title' => 'Fundamentos de Ollama y Modelos Locales',
                    'order' => 1,
                    'lessons' => [
                        [
                            'title' => 'Instalación y configuración de Ollama',
                            'duration' => 30, 'is_free' => true,
                            'content' => '<h3>¿Qué es Ollama?</h3><p>Ollama es una herramienta que permite ejecutar modelos de lenguaje grandes (LLMs) localmente en tu computadora, sin depender de APIs externas.</p><p>Instalación rápida:</p><pre><code># Linux/Mac\ncurl -fsSL https://ollama.com/install.sh | sh\n\n# Verificar instalación\nollama --version</code></pre><p>Luego descarga tu primer modelo: <code>ollama pull llama3.2</code></p>',
                        ],
                        [
                            'title' => 'Ejecutando Llama 3 y Mistral localmente',
                            'duration' => 45, 'is_free' => false,
                            'content' => '<h3>Corriendo modelos locales</h3><p>Ollama permite ejecutar múltiples modelos. Los más populares:</p><ul><li><strong>Llama 3.2</strong> — 8B params, excelente para código y razonamiento</li><li><strong>Mistral 7B</strong> — Rápido y eficiente, ideal para tareas generales</li><li><strong>CodeLlama</strong> — Especializado en generación de código</li></ul><p>Para ejecutar: <code>ollama run llama3.2</code>. Puedes interactuar directamente desde la terminal.</p>',
                        ],
                    ],
                ],
                [
                    'title' => 'Construcción de Agentes con LangChain',
                    'order' => 2,
                    'lessons' => [
                        [
                            'title' => 'Introducción a LangChain y cadenas de razonamiento',
                            'duration' => 40, 'is_free' => true,
                            'content' => '<h3>LangChain: el framework para agentes</h3><p>LangChain permite construir aplicaciones que usan LLMs de forma estructurada. Concepto clave: las <strong>cadenas</strong> (chains).</p><pre><code>from langchain.llms import Ollama\nfrom langchain.prompts import PromptTemplate\n\nllm = Ollama(model="llama3.2")\nprompt = PromptTemplate.from_template("Explica {tema} en 3 puntos")\nchain = prompt | llm\nresult = chain.invoke({"tema": "Clean Architecture"})</code></pre><p>Las cadenas se pueden combinar, paralelizar y condicionar.</p>',
                        ],
                        [
                            'title' => 'Creando tu primer agente autónomo',
                            'duration' => 50, 'is_free' => false,
                            'content' => '<h3>Agentes: IA que toma decisiones</h3><p>Un agente usa un LLM para decidir qué acciones tomar. Ejemplo con herramientas:</p><pre><code>from langchain.agents import create_react_agent\nfrom langchain_community.tools import DuckDuckGoSearchRun\n\ntools = [DuckDuckGoSearchRun()]\nagent = create_react_agent(llm, tools)\nagent_executor = AgentExecutor(agent=agent, tools=tools)\nagent_executor.invoke({"input": "Busca información sobre Ollama"})</code></pre><p>El agente decide si necesita buscar en internet, calcular algo o responder directamente.</p>',
                        ],
                    ],
                ],
            ],
            'DevOps' => [
                [
                    'title' => 'Contenedores con Docker',
                    'order' => 1,
                    'lessons' => [
                        [
                            'title' => 'Dockerfiles y multi-stage builds',
                            'duration' => 40, 'is_free' => true,
                            'content' => '<h3>Construyendo imágenes eficientes</h3><p>Un Dockerfile bien escrito usa <strong>multi-stage builds</strong> para reducir el tamaño de la imagen final:</p><pre><code># Build stage\nFROM mcr.microsoft.com/dotnet/sdk:8.0 AS build\nWORKDIR /app\nCOPY . .\nRUN dotnet publish -c Release -o out\n\n# Runtime stage\nFROM mcr.microsoft.com/dotnet/aspnet:8.0\nWORKDIR /app\nCOPY --from=build /app/out .\nENTRYPOINT ["dotnet", "app.dll"]</code></pre><p>La imagen final solo contiene el runtime, no el SDK.</p>',
                        ],
                        [
                            'title' => 'Docker Compose para entornos de desarrollo',
                            'duration' => 45, 'is_free' => false,
                            'content' => '<h3>Orquestación local con docker-compose</h3><p>Docker Compose permite levantar múltiples servicios con un solo comando:</p><pre><code>version: "3.9"\nservices:\n  api:\n    build: .\n    ports:\n      - "5000:5000"\n    depends_on:\n      - db\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_DB: myapp\n      POSTGRES_PASSWORD: secret</code></pre><p><code>docker compose up -d</code> levanta todo junto.</p>',
                        ],
                    ],
                ],
                [
                    'title' => 'Orquestación con Kubernetes',
                    'order' => 2,
                    'lessons' => [
                        [
                            'title' => 'Primeros pasos con Kubernetes',
                            'duration' => 50, 'is_free' => true,
                            'content' => '<h3>Kubernetes: el orquestador de contenedores</h3><p>Kubernetes (K8s) gestiona contenedores en producción. Conceptos fundamentales:</p><ul><li><strong>Pod</strong> — La unidad más pequeña, contiene uno o más contenedores</li><li><strong>Deployment</strong> — Define el estado deseado de los Pods</li><li><strong>Service</strong> — Expone los Pods dentro o fuera del cluster</li><li><strong>ConfigMap/Secret</strong> — Almacenan configuración sensible</li></ul>',
                        ],
                        [
                            'title' => 'Deployments, Services y ConfigMaps',
                            'duration' => 55, 'is_free' => false,
                            'content' => '<h3>Tu primer deployment en K8s</h3><p>Crea un archivo <code>deployment.yaml</code>:</p><pre><code>apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: mi-api\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: mi-api\n  template:\n    metadata:\n      labels:\n        app: mi-api\n    spec:\n      containers:\n      - name: api\n        image: mi-api:latest\n        ports:\n        - containerPort: 5000</code></pre><p>Aplica: <code>kubectl apply -f deployment.yaml</code></p>',
                        ],
                    ],
                ],
            ],
        ];

        $totalSections = 0;
        $totalLessons = 0;

        foreach ($courses as $course) {
            $matchedKey = null;
            foreach (array_keys($curriculum) as $key) {
                if (stripos($course->title, $key) !== false) {
                    $matchedKey = $key;
                    break;
                }
            }

            if ($matchedKey) {
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
                            'content' => $lessonData['content'] ?? null,
                            'duration_minutes' => $lessonData['duration'],
                            'order' => $index + 1,
                            'is_free' => $lessonData['is_free'],
                        ]);
                        $totalLessons++;
                    }
                }
            } else {
                // Generar currículo genérico para cursos sin contenido específico
                $section = CourseSection::create([
                    'course_id' => $course->id,
                    'title' => 'Introducción',
                    'order' => 1,
                ]);
                $totalSections++;

                Lesson::create([
                    'course_section_id' => $section->id,
                    'title' => "Bienvenida al curso: {$course->title}",
                    'content' => "<h3>¡Bienvenido!</h3><p>En este curso exploraremos los conceptos fundamentales y avanzados de <strong>{$course->title}</strong>.</p><p>A lo largo de las lecciones, construirás proyectos prácticos que reforzarán tu aprendizaje.</p>",
                    'duration_minutes' => 15,
                    'order' => 1,
                    'is_free' => true,
                ]);
                $totalLessons++;

                Lesson::create([
                    'course_section_id' => $section->id,
                    'title' => 'Configuración del entorno',
                    'content' => '<h3>Preparando tu estación de trabajo</h3><p>Asegúrate de tener las herramientas necesarias instaladas antes de comenzar.</p>',
                    'duration_minutes' => 20,
                    'order' => 2,
                    'is_free' => false,
                ]);
                $totalLessons++;

                Lesson::create([
                    'course_section_id' => $section->id,
                    'title' => 'Primeros pasos y objetivos del curso',
                    'content' => '<h3>¿Qué aprenderás?</h3><p>Revisaremos la estructura del curso, los proyectos que construirás y los conocimientos previos recomendados.</p>',
                    'duration_minutes' => 10,
                    'order' => 3,
                    'is_free' => false,
                ]);
                $totalLessons++;

                $section2 = CourseSection::create([
                    'course_id' => $course->id,
                    'title' => 'Contenido Principal',
                    'order' => 2,
                ]);
                $totalSections++;

                Lesson::create([
                    'course_section_id' => $section2->id,
                    'title' => 'Conceptos fundamentales',
                    'content' => '<h3>Los pilares fundamentales</h3><p>En esta lección cubriremos los conceptos base que necesitas dominar para avanzar en el curso.</p>',
                    'duration_minutes' => 30,
                    'order' => 1,
                    'is_free' => false,
                ]);
                $totalLessons++;

                Lesson::create([
                    'course_section_id' => $section2->id,
                    'title' => 'Ejercicio práctico guiado',
                    'content' => '<h3>Manos a la obra</h3><p>Sigue los pasos del ejercicio práctico para aplicar lo aprendido en la lección anterior.</p>',
                    'duration_minutes' => 45,
                    'order' => 2,
                    'is_free' => false,
                ]);
                $totalLessons++;

                Lesson::create([
                    'course_section_id' => $section2->id,
                    'title' => 'Resumen y siguientes pasos',
                    'content' => '<h3>¿Y ahora qué?</h3><p>Revisemos lo aprendido y veamos qué viene en las siguientes secciones del curso.</p>',
                    'duration_minutes' => 10,
                    'order' => 3,
                    'is_free' => false,
                ]);
                $totalLessons++;
            }
        }

        $this->command->info("Currículo creado: {$totalSections} secciones, {$totalLessons} lecciones.");
    }
}
