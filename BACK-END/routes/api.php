<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\ProduitController;
use App\Http\Controllers\API\CommandeController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\TypeClientController;
use App\Models\TypeClient;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\DevisController;

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

Route::get('/produits/all', [ProduitController::class, 'allProduits']);
Route::apiResource('produits', ProduitController::class);


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/commandes', [CommandeController::class, 'index']);
    Route::get('/commandes/{id}', [CommandeController::class, 'show']);
    Route::put('/commandes/{id}', [CommandeController::class, 'update']);
    Route::post('/commandes', [CommandeController::class, 'store']);
    Route::delete('/commandes/{id}', [CommandeController::class, 'destroy']);
});


Route::middleware('auth:sanctum')->group(function () {
    // Liste tous les devis
    Route::get('/devis', [DevisController::class, 'index']);

    // Retourne données pour formulaire création (clients + produits)
    Route::get('/devis/create', [DevisController::class, 'create']);

    // Crée un devis
    Route::post('/devis', [DevisController::class, 'store']);

    // Affiche un devis
    Route::get('/devis/{devis}', [DevisController::class, 'show']);

    // Édite un devis (retourne données pour modification)
    Route::get('/devis/{devis}/edit', [DevisController::class, 'edit']);

    // Met à jour un devis
    Route::put('/devis/{devis}', [DevisController::class, 'update']);

    // Supprime un devis
    Route::delete('/devis/{devis}', [DevisController::class, 'destroy']);
});

Route::post('/devis/{id}/changer-etat', [DevisController::class, 'changerEtat']);



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
    Route::get('/clients', [UserController::class, 'clientsIndex']);
});


