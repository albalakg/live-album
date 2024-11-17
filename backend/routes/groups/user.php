<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

Route::get('profile', [UserController::class, 'profile']);
Route::post('logout', [UserController::class, 'logout']);