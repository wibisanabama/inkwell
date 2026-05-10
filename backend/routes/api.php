<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/categories', [\App\Http\Controllers\CategoryController::class, 'index']);
Route::get('/tags', [\App\Http\Controllers\TagController::class, 'index']);

Route::get('/posts', [\App\Http\Controllers\PostController::class, 'index']);
Route::get('/posts/{slug}', [\App\Http\Controllers\PostController::class, 'show']);
Route::get('/posts/{slug}/related', [\App\Http\Controllers\PostController::class, 'related']);
Route::get('/posts/{slug}/comments', [\App\Http\Controllers\CommentController::class, 'index']);
Route::post('/posts/{slug}/comments', [\App\Http\Controllers\CommentController::class, 'store']);

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

    // Admin Posts
    Route::get('/admin/posts', [\App\Http\Controllers\PostController::class, 'adminIndex']);
    Route::post('/admin/posts', [\App\Http\Controllers\PostController::class, 'store']);
    Route::put('/admin/posts/{post}', [\App\Http\Controllers\PostController::class, 'update']);
    Route::delete('/admin/posts/{post}', [\App\Http\Controllers\PostController::class, 'destroy']);

    // Admin Upload
    Route::post('/admin/upload', [\App\Http\Controllers\MediaController::class, 'upload']);

    // Admin Comments
    Route::get('/admin/comments', [\App\Http\Controllers\CommentController::class, 'adminIndex']);
    Route::put('/admin/comments/{id}', [\App\Http\Controllers\CommentController::class, 'update']);
    Route::delete('/admin/comments/{id}', [\App\Http\Controllers\CommentController::class, 'destroy']);
});
