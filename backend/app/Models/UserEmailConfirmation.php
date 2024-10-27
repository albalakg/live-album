<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class UserEmailConfirmation extends Model
{
    use HasFactory;

    public function user()
    {
        return $this->hasOne(User::class, 'email', 'email');
    }
}
