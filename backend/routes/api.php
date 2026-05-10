<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/categories', [\App\Http\Controllers\CategoryController::class, 'index']);
Route::get('/tags', [\App\Http\Controllers\TagController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    
    // Admin Dashboard
    Route::get('/admin/dashboard', [\App\Http\Controllers\DashboardController::class, 'index']);

    // Admin Categories
    Route::post('/admin/categories', [\App\Http\Controllers\CategoryController::class, 'store']);
    Route::put('/admin/categories/{category}', [\App\Http\Controllers\CategoryController::class, 'update']);
    Route::delete('/admin/categories/{category}', [\App\Http\Controllers\CategoryController::class, 'destroy']);

    // Admin Tags
    Route::post('/admin/tags', [\App\Http\Controllers\TagController::class, 'store']);
    Route::delete('/admin/tags/{tag}', [\App\Http\Controllers\TagController::class, 'destroy']);
});
