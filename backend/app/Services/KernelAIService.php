<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class KernelAIService
{
    private $apiKey;
    private $baseUrl = 'https://opencode.ai/zen/go/v1';

    public function __construct()
    {
        $this->apiKey = config('services.opencode.key');
    }

    /**
     * Enviar mensaje al LLM
     */
    public function chat(array $messages)
    {
        try {
            $start = microtime(true);
            $response = Http::timeout(30)->withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post("{$this->baseUrl}/chat/completions", [
                'model' => 'deepseek-v4-flash',
                'messages' => $messages,
                'temperature' => 0.7,
            ]);
            $elapsed = round(microtime(true) - $start, 2);

            if ($response->failed()) {
                Log::error("KAI Error ({$elapsed}s): " . $response->status() . ' ' . $response->body());
                return ['error' => 'Error al conectar con la Inteligencia Artificial'];
            }

            Log::info("KAI OK ({$elapsed}s)");
            return $response->json();
        } catch (\Exception $e) {
            Log::error('KAI Exception: ' . $e->getMessage());
            return ['error' => 'Excepción en el servicio de IA'];
        }
    }
}
