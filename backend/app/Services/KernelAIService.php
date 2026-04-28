<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class KernelAIService
{
    private $apiKey;
    private $baseUrl = 'https://openrouter.ai/api/v1';

    public function __construct()
    {
        $this->apiKey = config('services.openrouter.key');
    }

    /**
     * Enviar mensaje al LLM
     */
    public function chat(array $messages)
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post("{$this->baseUrl}/chat/completions", [
                'model' => 'google/gemini-2.0-flash-lite-preview-02-05:free', // Modelo eficiente para MVP
                'messages' => $messages,
                'temperature' => 0.7,
            ]);

            if ($response->failed()) {
                Log::error('OpenRouter Error: ' . $response->body());
                return ['error' => 'Error al conectar con la Inteligencia Artificial'];
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('KernelAI Exception: ' . $e->getMessage());
            return ['error' => 'Excepción en el servicio de IA'];
        }
    }
}
