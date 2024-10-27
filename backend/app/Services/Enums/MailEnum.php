<?php

namespace App\Services\Enums;

use App\Mail\OrderFailedMail;
use App\Mail\ForgotPasswordMail;
use App\Mail\OrderConfirmedMail;
use App\Services\Enums\BaseEnum;
use App\Mail\UserSignupMail;

class MailEnum extends BaseEnum
{
    const USER_SIGNUP = UserSignupMail::class;
    const FORGOT_PASSWORD = ForgotPasswordMail::class;
    const ORDER_CONFIRMED = OrderConfirmedMail::class;
    const ORDER_FAILED = OrderFailedMail::class;
}
