<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'pickup_date' => ['required', 'date', 'after:today'],
            'return_date' => ['required', 'date', 'after:pickup_date'],
            'pickup_location' => ['required', 'string', 'max:255'],
            'return_location' => ['required', 'string', 'max:255'],
            'need_driver' => ['required', Rule::in([true, false, '0', '1', 0, 1])],
            'driver_id' => ['nullable', 'exists:users,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'pickup_date.after' => 'Pickup date must be in the future.',
            'return_date.after' => 'Return date must come after the pickup date.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'need_driver' => filter_var($this->input('need_driver'), FILTER_VALIDATE_BOOLEAN),
        ]);
    }
}
