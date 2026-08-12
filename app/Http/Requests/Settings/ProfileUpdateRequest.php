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
                'business_name' => ['required', 'string', 'max:255'],
                'national_id' => ['required', 'string', 'max:255'],
                'trade_license_number' => ['required', 'string', 'max:255'],
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
        }

        return $rules;
    }
}
