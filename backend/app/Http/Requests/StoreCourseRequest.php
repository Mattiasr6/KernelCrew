<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\JsonResponse;

class StoreCourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        
        if (!$user) {
            return false;
        }

        return $user->hasRole('instructor') || $user->hasRole('admin');
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'min:50'],
            'price' => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'El título es obligatorio.',
            'title.string' => 'El título debe ser texto válido.',
            'title.max' => 'El título no puede exceder 255 caracteres.',
            
            'description.required' => 'La descripción es obligatoria.',
            'description.string' => 'La descripción debe ser texto válido.',
            'description.min' => 'La descripción debe tener al menos 50 caracteres.',
            
            'price.required' => 'El precio es obligatorio.',
            'price.numeric' => 'El precio debe ser un número válido.',
            'price.min' => 'El precio debe ser un valor positivo.',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        $errors = $validator->errors()->toArray();
        
        $formattedErrors = [];
        foreach ($errors as $field => $messages) {
            $formattedErrors[$field] = is_array($messages) ? $messages : [$messages];
        }

        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'data' => $formattedErrors,
                'errors' => $formattedErrors,
            ], JsonResponse::HTTP_UNPROCESSABLE_ENTITY)
        );
    }
}