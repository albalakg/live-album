<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EventController;

// TODO: for some reason it works only when added in the api.php file as well, need to to check it
Route::post('{event_id}/update', [EventController::class, 'update']);
Route::post('{event_id}/ready', [EventController::class, 'ready']);
Route::post('{event_id}/pending', [EventController::class, 'pending']);
