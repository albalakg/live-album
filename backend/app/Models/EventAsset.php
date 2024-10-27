<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EventAsset extends Model
{
    use HasFactory, SoftDeletes;
    
    public function event()
    {
        return $this->hasOne(Event::class, 'id', 'event_id');
    }
}
