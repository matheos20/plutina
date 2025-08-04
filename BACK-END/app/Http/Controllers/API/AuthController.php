<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;





class AuthController extends Controller
{

        public function register(Request $request)
        {

            // Validation
            $validator = Validator::make($request->all(), [
                'nom' => 'required|string|max:255',
                'prenom' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:6|confirmed',
                'adresse' => 'nullable|string',
                'id_type_client' => 'nullable|exists:types_clients,id',
                'role' => 'required|in:admin,receptionniste,client',
            ]);

            if ($validator->fails()) {
                return response()->json($validator->errors(), 422);
            }

            // Création utilisateur
            $user = User::create([
                'nom' => $request->nom,
                'prenom' => $request->prenom,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'adresse' => $request->adresse,
                'id_type_client' => $request->id_type_client,
                'role' => $request->role,
            ]);

            $token = $user->createToken('authToken')->plainTextToken;

            return response()->json([
                'message' => 'Utilisateur enregistré avec succès.',
                'user' => $user,
                'token' => $token
            ], 201);
        }

        // Connexion
        public function login(Request $request)
        {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            $user = User::where('email', $request->email)->first();

            if (! $user || ! Hash::check($request->password, $user->password)) {
                return response()->json(['message' => 'Identifiants invalides.'], 401);
            }

            $token = $user->createToken('authToken')->plainTextToken;

            return response()->json([
                'message' => 'Connexion réussie.',
                'user' => $user,
                'token' => $token
            ]);
        }

        // Déconnexion
        public function logout(Request $request)
        {
            $request->user()->tokens()->delete();

            return response()->json([
                'message' => 'Déconnecté avec succès.'
            ]);
        }
}
