<?php

namespace App\Enums;

enum RoleEnumV2: int
{
    case ADMIN = 10;
    case USER = 20;

    public function label(): string
    {
        return match($this) {
            self::ADMIN => 'admin',
            self::USER => 'user',
        };
    }
}
