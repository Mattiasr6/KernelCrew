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
}
