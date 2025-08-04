<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\ProduitController;
use App\Http\Controllers\API\CommandeController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\TypeClientController;
use App\Models\TypeClient;
use App\Http\Controllers\API\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


Route::apiResource('produits', ProduitController::class);


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/commandes', [CommandeController::class, 'index']);
    Route::get('/commandes/{id}', [CommandeController::class, 'show']);
    Route::post('/commandes', [CommandeController::class, 'store']);
    Route::delete('/commandes/{id}', [CommandeController::class, 'destroy']);
});





Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


Route::get('/types-clients', [TypeClientController::class, 'index']);

Route::middleware('auth:sanctum')->get('/clients', function () {
    return \App\Models\User::where('role', 'client')->get();
});


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/utilisateurs', [UserController::class, 'index']);
    Route::post('/utilisateurs', [UserController::class, 'store']);
    Route::put('/utilisateurs/{id}', [UserController::class, 'update']);
    Route::delete('/utilisateurs/{id}', [UserController::class, 'destroy']);
});


