<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\ContactController;

Route::get('user/profile', [UserController::class, 'profile']);

Route::post('contact', [ContactController::class, 'create']);

Route::get('events/{id}', [EventController::class, 'find']);
Route::post('events/file', [EventController::class, 'uploadFile']);

Route::get('/{any?}', function () {
    return response()->json([
        'message' => 'Sorry, route does not exists',
        'data' => null,
        'status' => false,
    ], 404);
})
    ->where('any', '^(?!api\/).*')
    ->name('home');