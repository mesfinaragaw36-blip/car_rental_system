<?php

namespace App\Http\Requests\Settings;

use App\Concerns\ProfileValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    use ProfileValidationRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = $this->profileRules($this->user()->id);

        if ($this->user()->role === 'owner') {
            $rules = array_merge($rules, [
                'national_id' => ['required', 'digits:12'],
                'national_id_front_file' => ['sometimes', 'file', 'image', 'max:10240'],
                'national_id_back_file' => ['sometimes', 'file', 'image', 'max:10240'],
            ]);
        }

        if ($this->user()->hasDriverPermission()) {
            $rules = array_merge($rules, [
                'license_number' => ['required', 'string', 'max:255'],
                'license_type' => ['required', 'string', Rule::in(['አውቶ', 'ህዝብ', 'ደረቅ ጭነት', 'ፈሳሽ ጭነት', 'ግንባታ መሣሪያዎች / ኮንስትራክሽን'])],
                'experience_years' => ['required', 'integer', 'min:0', 'max:50'],
                'location' => ['required', 'string', 'max:255'],
            ]);
        }

                if ($this->user()->role === 'customer') {
            $rules = array_merge($rules, [
                'address' => ['required', 'string', 'max:255'],
            ]);

            $identity = $this->user()->customerIdentity;
            $isLocked = $identity?->verification_status === 'approved';

            if (! $isLocked) {
                $rules = array_merge($rules, [
                    'national_id_number' => [
                        'required',
                        'digits:12',
                        Rule::unique('customer_identities', 'national_id_number')->ignore($this->user()->id, 'user_id'),
                    ],
                    'national_id_front' => [$identity ? 'nullable' : 'required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
                    'national_id_back' => [$identity ? 'nullable' : 'required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
                ]);
            }
        }

                if (in_array($this->user()->role, ['customer', 'owner'], true)) {
            $rules = array_merge($rules, [
                'refund_method' => ['nullable', Rule::in(['cbe', 'telebirr'])],
                'cbe_account_number' => ['nullable', 'string', 'max:50', 'required_if:refund_method,cbe'],
                'cbe_account_holder_name' => ['nullable', 'string', 'max:255', 'required_if:refund_method,cbe'],
                'telebirr_number' => ['nullable', 'string', 'max:20', 'required_if:refund_method,telebirr'],
                'telebirr_account_holder_name' => ['nullable', 'string', 'max:255', 'required_if:refund_method,telebirr'],
            ]);
        }

        return $rules;
    }
}
