<?php

namespace App\Services\Enums;

use App\Services\Enums\BaseEnum;

class MessagesEnum extends BaseEnum
{
    // Errors
    const INVALID_CREDENTIALS = 'Email or password is invalid';
    const USER_LOGIN_UNAUTHORIZED = 'Unauthorized to login';
    const MAINTENANCE_VALIDATION = 'Sorry, Unauthorized to login during maintenance mode';
    const USER_NOT_FOUND = 'User not found';
    const USER_NEW_PASSWORD_MATCH_OLD = 'Can\'t update new password that matches the old password';
    const ORDER_NOT_FOUND = 'Order not found';
    const EVENT_NOT_FOUND = 'Event not found';
    const EVENT_NOT_AUTHORIZED = 'Not authorized to modify this event';
    const USER_NOT_AUTHORIZED_TO_DELETE = 'Not authorized to delete this user';

    // Info
    const LOGIN_SUCCESS = 'Logged in successfully';
    const SIGNUP_SUCCESS = 'You have Signed Up Successfully';
    const RESET_PASSWORD = 'You have reset your password';
    const FORGOT_PASSWORD = 'An email has been sent to the requested address';
    const CONFIRM_EMAIL = 'You have verified your email successfully';
    const ORDER_FOUND_SUCCESS = 'Order fetched successfully';
    const ORDER_CREATED_SUCCESS = 'Order created successfully';
    const ORDER_UPDATED_SUCCESS = 'Order updated successfully';
    const ORDER_DELETED_SUCCESS = 'Order deleted successfully';
    const EVENT_FOUND_SUCCESS = 'Event fetched successfully';
    const EVENT_CREATED_SUCCESS = 'Event created successfully';
    const EVENT_UPDATED_SUCCESS = 'Event updated successfully';
    const EVENT_DELETED_SUCCESS = 'Event deleted successfully';
    const EVENT_FILE_UPLOADED_SUCCESS = 'Event file uploaded successfully';
    const USER_CREATED_SUCCESS = 'User created successfully';
    const USER_UPDATED_SUCCESS = 'User updated successfully';
    const USER_DELETED_SUCCESS = 'User deleted successfully';
    const USERS_FETCHED_SUCCESS = 'Users fetched successfully';
    const USER_FOUND_SUCCESS = 'User found successfully';


    // Validations
    const INVALID_PASSWORD = 'Password is required and must be minimum 8 characters, at least one lowercase letter, uppercase letter and one number';
}
