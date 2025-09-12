<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\ProduitController;
use App\Http\Controllers\API\CommandeController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\TypeClientController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\DevisController;
use App\Http\Controllers\API\FactureController;

// Routes publiques
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/produits/all', [ProduitController::class, 'allProduits']);
Route::get('/types-clients', [TypeClientController::class, 'index']);

// Routes protégées par Sanctum
Route::middleware('auth:sanctum')->group(function () {

    // Auth utilisateur
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Commandes disponibles pour factures → jamais 404
    // Cette route doit être **avant** /commandes/{id}
    Route::get('/commandes/pour-facture', [FactureController::class, 'commandesPourFacture']);

    // Commandes
    Route::get('/commandes', [CommandeController::class, 'index']);
    Route::get('/commandes/{id}', [CommandeController::class, 'show']);
    Route::post('/commandes', [CommandeController::class, 'store']);
    Route::put('/commandes/{id}', [CommandeController::class, 'update']);
    Route::delete('/commandes/{id}', [CommandeController::class, 'destroy']);



    // Factures
    Route::apiResource('factures', FactureController::class);

    // Générer une facture depuis commande
    Route::post('/factures/generer/{id_commande}', [FactureController::class, 'genererDepuisCommande']);

    // Devis
    Route::get('/devis', [DevisController::class, 'index']);
    Route::get('/devis/create', [DevisController::class, 'create']);
    Route::post('/devis', [DevisController::class, 'store']);
    Route::get('/devis/{devis}', [DevisController::class, 'show']);
    Route::get('/devis/{devis}/edit', [DevisController::class, 'edit']);
    Route::put('/devis/{devis}', [DevisController::class, 'update']);
    Route::delete('/devis/{devis}', [DevisController::class, 'destroy']);
    Route::post('/devis/{id}/changer-etat', [DevisController::class, 'changerEtat']);

    // Utilisateurs
    Route::get('/utilisateurs', [UserController::class, 'index']);
    Route::post('/utilisateurs', [UserController::class, 'store']);
    Route::put('/utilisateurs/{id}', [UserController::class, 'update']);
    Route::delete('/utilisateurs/{id}', [UserController::class, 'destroy']);

    // Clients
    Route::get('/clients', [UserController::class, 'clients']);
//    Route::get('/clients', [UserController::class, 'clientsIndex']);
});
