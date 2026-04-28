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
        $hasActiveSub = $user->subscriptions()->where('status', 'active')->exists();
        if (!$hasActiveSub && (int)$user->role_id !== 1) {
            return response()->json([
                'success' => false,
                'message' => 'Necesitas una suscripción activa para usar el asistente de IA.'
            ], 403);
        }

        $result = $this->aiService->chat($request->messages);

        if (isset($result['error'])) {
            return response()->json(['success' => false, 'message' => $result['error']], 500);
        }

        return response()->json([
            'success' => true,
            'data' => $result['choices'][0]['message']
        ]);
    }
}
