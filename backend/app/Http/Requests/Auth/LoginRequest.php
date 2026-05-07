<?php

declare(strict_types=1);

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseFormRequest;

class LoginRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.string' => 'El correo debe ser texto válido.',
            'email.email' => 'El correo electrónico no tiene un formato válido.',

            'password.required' => 'La contraseña es obligatoria.',
            'password.string' => 'La contraseña debe ser texto válido.',
        ];
    }
}
