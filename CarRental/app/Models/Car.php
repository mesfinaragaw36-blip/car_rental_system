<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Car extends Model
{
    protected $fillable = [
        'branch_id',
        'car_type_id',
        'brand_id',
        'car_model_id',
        'car_code_id',
        'plate_number',
        'color',
        'manufacture_year',
        'status',
    ];


    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }


    public function carType(): BelongsTo
    {
        return $this->belongsTo(CarType::class);
    }


    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }


    public function carModel(): BelongsTo
    {
        return $this->belongsTo(CarModel::class);
    }


    public function carCode(): BelongsTo
    {
        return $this->belongsTo(CarCode::class);
    }
}