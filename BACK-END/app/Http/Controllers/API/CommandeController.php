<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Commande;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;

class CommandeController extends Controller
{
    // Lister les commandes
    public function index()
    {
        try {
            $commandes = Commande::with('client', 'produits')->orderByDesc('created_at')->get();
            return response()->json($commandes);
        } catch (QueryException $e) {
            return response()->json([
                'error' => 'Erreur de connexion à la base de données.',
                'details' => $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur interne du serveur.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    // Créer une nouvelle commande
    public function store(Request $request)
    {
        try {
            \Log::info("Requête reçue pour créer une commande :", $request->all());

            // Validation
            $validatedData = $request->validate([
                'id_client'       => 'required|exists:users,id',
                'debut_location'  => 'required|date|after_or_equal:today',
                'fin_location'    => 'required|date|after:debut_location',
                'produits'        => 'required|array|min:1',
                'produits.*.id'   => 'required|exists:produits,id',
                'produits.*.quantite' => 'required|integer|min:1',
                'produits.*.prix_unitaire' => 'required|numeric|min:0',
            ]);

            // Calcul du prix total
            $prixTotal = collect($validatedData['produits'])->sum(function ($p) {
                return $p['quantite'] * $p['prix_unitaire'];
            });

            // Création de la commande
            $commande = Commande::create([
                'id_client'      => $validatedData['id_client'],
                'etat'           => 'en cours',
                'prix_total'     => $prixTotal,
                'debut_location' => $validatedData['debut_location'],
                'fin_location'   => $validatedData['fin_location'],
            ]);

            // Attacher les produits
            foreach ($validatedData['produits'] as $produit) {
                $commande->produits()->attach($produit['id'], [
                    'quantite'      => $produit['quantite'],
                    'prix_unitaire' => $produit['prix_unitaire'],
                    'prix_total'    => $produit['quantite'] * $produit['prix_unitaire'],
                ]);
            }

            return response()->json([
                'message'  => 'Commande créée avec succès',
                'commande' => $commande->load('produits')
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Erreur lors de la création de la commande :', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return response()->json([
                'error'   => 'Erreur interne du serveur',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    // Modifier une commande
    public function update(Request $request, $id)
    {
        try {
            \Log::info("Requête reçue pour mettre à jour la commande $id :", $request->all());

            // Validation
            $validatedData = $request->validate([
                'id_client'       => 'required|exists:users,id',
                'debut_location'  => 'required|date|after_or_equal:today',
                'fin_location'    => 'required|date|after:debut_location',
                'produits'        => 'required|array|min:1',
                'produits.*.id'   => 'required|exists:produits,id',
                'produits.*.quantite' => 'required|integer|min:1',
                'produits.*.prix_unitaire' => 'required|numeric|min:0',
            ]);

            $commande = Commande::findOrFail($id);

            // Calcul du prix total
            $prixTotal = collect($validatedData['produits'])->sum(function ($p) {
                return $p['quantite'] * $p['prix_unitaire'];
            });

            // Mise à jour de la commande principale
            $commande->update([
                'id_client'      => $validatedData['id_client'],
                'debut_location' => $validatedData['debut_location'],
                'fin_location'   => $validatedData['fin_location'],
                'prix_total'     => $prixTotal,
            ]);

            // Suppression des anciennes associations
            $commande->produits()->detach();

            // Ré-attacher les produits
            foreach ($validatedData['produits'] as $produit) {
                $commande->produits()->attach($produit['id'], [
                    'quantite'      => $produit['quantite'],
                    'prix_unitaire' => $produit['prix_unitaire'],
                    'prix_total'    => $produit['quantite'] * $produit['prix_unitaire'],
                ]);
            }

            return response()->json([
                'message'  => 'Commande mise à jour avec succès',
                'commande' => $commande->load('produits')
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Commande introuvable'], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => 'Données invalides', 'details' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error("Erreur lors de la mise à jour de la commande $id :", [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);
            return response()->json([
                'error'   => 'Erreur interne du serveur',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    // Récupérer une commande
    public function show($id)
    {
        try {
            $commande = Commande::with(['client', 'produits'])->findOrFail($id);
            return response()->json($commande);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Commande introuvable'], 404);
        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Erreur interne du serveur',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    // Supprimer une commande
    public function destroy($id)
    {
        try {
            $commande = Commande::find($id);
            if (!$commande) {
                return response()->json(['error' => 'Commande introuvable'], 404);
            }

            $commande->produits()->detach();
            $commande->delete();

            return response()->json(['message' => 'Commande supprimée']);
        } catch (QueryException $e) {
            return response()->json([
                'error'   => 'Erreur de connexion à la base de données.',
                'details' => $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Erreur interne du serveur.',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
