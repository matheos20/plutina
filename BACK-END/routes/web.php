<?php

use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Http\Controllers\CsrfCookieController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});


//Route::get('/sanctum/csrf-cookie', [CsrfCookieController::class, 'show']);
//
//
//Route::post('/login', [\App\Http\Controllers\Auth\LoginController::class, 'login']);


Route::middleware('auth:sanctum')->get('/clients', function (Request $request) {
    return response()->json([
        'user' => $request->user(),
        'clients' => \App\Models\User::where('role', 'client')->get()
    ]);
});
// routes/web.php
Route::get('/login', function () {
    return response()->json(['message' => 'Redirection vers login interdite.'], 401);
})->name('login');
