<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\KernelAIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KernelAIController extends Controller
{
    protected $aiService;

    public function __construct(KernelAIService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * Endpoint de Chat con KernelAI
     */
    public function chat(Request $request): JsonResponse
    {
        $request->validate([
            'messages' => 'required|array',
            'messages.*.role' => 'required|string|in:user,assistant,system',
            'messages.*.content' => 'required|string',
        ]);

        $user = $request->user();

        // CA-15: Validar suscripción activa para usar IA
        $subscription = $user->subscriptions()
            ->where('status', 'active')
            ->where('end_date', '>=', now()->toDateString())
            ->with('plan')
            ->first();

        if (!$subscription && (int)$user->role_id !== 1) {
            return response()->json([
                'success' => false,
                'message' => 'Necesitas una suscripción activa para usar el asistente de IA.'
            ], 403);
        }

        // Construir contexto dinámico del usuario
        $userContext = [
            'name' => $user->name,
            'role' => $user->role ?? 'student',
            'plan' => $subscription && $subscription->plan ? $subscription->plan->name : 'admin',
            'subscription_status' => $subscription ? 'active' : 'admin',
        ];

        // Agregar system message con contexto
        $systemPrompt = $this->buildSystemPrompt($userContext);
        $messagesWithContext = array_merge([
            ['role' => 'system', 'content' => $systemPrompt]
        ], $request->messages);

        $result = $this->aiService->chat($messagesWithContext);

        if (isset($result['error'])) {
            return response()->json(['success' => false, 'message' => $result['error']], 500);
        }

        return response()->json([
            'success' => true,
            'data' => $result['choices'][0]['message']
        ]);
    }

    /**
     * Construir el system prompt con contexto dinámico
     */
    private function buildSystemPrompt(array $userContext): string
    {
        return <<<EOT
Eres "MattClaw", el asistente de inteligencia artificial de la plataforma educativa KernelLearn.

INFORMACIÓN DEL USUARIO:
- Nombre: {$userContext['name']}
- Rol: {$userContext['role']}
- Plan de suscripción: {$userContext['plan']}
- Estado de suscripción: {$userContext['subscription_status']}

INSTRUCCIONES:
1. Estás en una plataforma de cursos de programación y tecnología para desarrolladores.
2. Debes responder de forma útil, clara y concisa.
3. Si el usuario tiene preguntas técnicas sobre programación, ayúdalo con código ejemplos si es apropiado.
4. Usa un tono amigable pero profesional.
5. Cuando menciones conceptos técnicos, sé preciso.
6. Si no sabes algo, admítelo honestamente.
7. Puedes usar emojis para hacer las respuestas más amenas.

El usuario te consultará sobre sus cursos, dudas técnicas, o solicitando ayuda con el aprendizaje.
EOT;
    }
}
