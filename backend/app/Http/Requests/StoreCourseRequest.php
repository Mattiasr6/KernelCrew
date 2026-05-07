<?php

declare(strict_types=1);

namespace App\Http\Requests;

class StoreCourseRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        if (!$user) {
            return false;
        }

        return $user->isInstructor() || $user->isAdmin();
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'min:50'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'price_in_credits' => ['nullable', 'integer', 'min:0'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'level' => ['nullable', 'string', 'in:beginner,intermediate,advanced'],
            'duration_hours' => ['nullable', 'integer', 'min:0'],
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

            'price.numeric' => 'El precio debe ser un número válido.',
            'price.min' => 'El precio debe ser un valor positivo.',

            'price_in_credits.integer' => 'El precio en créditos debe ser un número entero.',
            'price_in_credits.min' => 'El precio en créditos no puede ser negativo.',

            'category_id.exists' => 'La categoría seleccionada no es válida.',

            'level.in' => 'El nivel debe ser: beginner, intermediate o advanced.',

            'duration_hours.integer' => 'La duración debe ser un número entero.',
            'duration_hours.min' => 'La duración no puede ser negativa.',
        ];
    }
}
