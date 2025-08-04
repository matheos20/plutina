<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Commande;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
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

    // Créer une commande
//    public function store(Request $request)
//    {
//        $validator = Validator::make($request->all(), [
//            'id_client' => 'required|exists:users,id',
//            'debut_location' => 'required|date',
//            'fin_location' => 'required|date|after_or_equal:debut_location',
//            'etat' => 'in:en cours,livrée,annulée',
//            'produits' => 'required|array',
//            'produits.*.id' => 'required|exists:produits,id',
//            'produits.*.quantite' => 'required|integer|min:1',
//            'produits.*.prix_unitaire' => 'required|numeric|min:0',
//        ]);
//
//        if ($validator->fails()) {
//            return response()->json(['errors' => $validator->errors()], 422);
//        }
//
//        DB::beginTransaction();
//
//        try {
//            $commande = Commande::create([
//                'id_client' => $request->id_client,
//                'debut_location' => $request->debut_location,
//                'fin_location' => $request->fin_location,
//                'etat' => $request->etat ?? 'en cours',
//                'prix_total' => 0,
//            ]);
//
//            $total = 0;
//
//            foreach ($request->produits as $produit) {
//                $commande->produits()->attach($produit['id'], [
//                    'quantite' => $produit['quantite'],
//                    'prix_unitaire' => $produit['prix_unitaire'],
//                ]);
//                $total += $produit['quantite'] * $produit['prix_unitaire'];
//            }
//
//            $commande->prix_total = $total;
//            $commande->save();
//
//            DB::commit();
//
//            return response()->json([
//                'message' => 'Commande créée avec succès',
//                'commande' => $commande->load('produits', 'client')
//            ], 201);
//
//        } catch (QueryException $e) {
//            DB::rollback();
//            return response()->json([
//                'error' => 'Erreur de connexion à la base de données.',
//                'details' => $e->getMessage()
//            ], 500);
//        } catch (\Exception $e) {
//            DB::rollback();
//            return response()->json([
//                'error' => 'Erreur interne du serveur.',
//                'details' => $e->getMessage()
//            ], 500);
//        }
//    }
//
//    // Afficher une commande
//    public function show($id)
//    {
//        try {
//            $commande = Commande::with('client', 'produits')->find($id);
//            if (!$commande) {
//                return response()->json(['error' => 'Commande introuvable'], 404);
//            }
//            return response()->json($commande);
//        } catch (QueryException $e) {
//            return response()->json([
//                'error' => 'Erreur de connexion à la base de données.',
//                'details' => $e->getMessage()
//            ], 500);
//        } catch (\Exception $e) {
//            return response()->json([
//                'error' => 'Erreur interne du serveur.',
//                'details' => $e->getMessage()
//            ], 500);
//        }
//    }

//    public function store(Request $request)
//    {
//        try {
//            // Log des données reçues
//            \Log::info("Requête reçue pour créer une commande :", $request->all());
//
//            // Validation des données
//            $validatedData = $request->validate([
//                'date_commande' => 'required|date',
//                'statut' => 'required|string',
//                'client_id' => 'required|exists:users,id',
//                'produits' => 'required|array|min:1',
//                'produits.*.id' => 'required|exists:produits,id',
//                'produits.*.quantite' => 'required|integer|min:1',
//                'produits.*.prix_unitaire' => 'required|numeric|min:0',
//            ]);
//
//            // Création de la commande
//            $commande = Commande::create([
//                'date_commande' => $validatedData['date_commande'],
//                'statut' => $validatedData['statut'],
//                'client_id' => $validatedData['client_id'],
//            ]);
//
//            // Attacher les produits avec quantité et prix unitaire
//            foreach ($validatedData['produits'] as $produit) {
//                $commande->produits()->attach($produit['id'], [
//                    'quantite' => $produit['quantite'],
//                    'prix_unitaire' => $produit['prix_unitaire'],
//                ]);
//            }
//
//            // Réponse de succès
//            return response()->json([
//                'message' => 'Commande créée avec succès',
//                'commande' => $commande->load('produits')
//            ], 201);
//
//        } catch (\Exception $e) {
//            // Log de l’erreur
//            \Log::error('Erreur lors de la création de la commande :', [
//                'message' => $e->getMessage(),
//                'file' => $e->getFile(),
//                'line' => $e->getLine(),
//            ]);
//
//            // Réponse d’erreur
//            return response()->json([
//                'error' => 'Erreur interne du serveur',
//                'details' => $e->getMessage()
//            ], 500);
//        }
//    }

    public function store(Request $request)
    {
        try {
            \Log::info("Requête reçue pour créer une commande :", $request->all());

            // Validation
            $validatedData = $request->validate([
                'id_client' => 'required|exists:users,id',
                'debut_location' => 'required|date',
                'fin_location' => 'required|date|after:debut_location',
                'produits' => 'required|array|min:1',
                'produits.*.id' => 'required|exists:produits,id',
                'produits.*.quantite' => 'required|integer|min:1',
                'produits.*.prix_unitaire' => 'required|numeric|min:0',
            ]);

            // Calcul du prix total
            $prixTotal = collect($validatedData['produits'])->sum(function ($p) {
                return $p['quantite'] * $p['prix_unitaire'];
            });

            // Création de la commande
            $commande = Commande::create([
                'id_client' => $validatedData['id_client'],
                'etat' => 'en cours',
                'prix_total' => $prixTotal,
                'debut_location' => $validatedData['debut_location'],
                'fin_location' => $validatedData['fin_location'],
            ]);

            // Attacher les produits
            foreach ($validatedData['produits'] as $produit) {
                $commande->produits()->attach($produit['id'], [
                    'quantite' => $produit['quantite'],
                    'prix_unitaire' => $produit['prix_unitaire'],
                ]);
            }

            return response()->json([
                'message' => 'Commande créée avec succès',
                'commande' => $commande->load('produits')
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Erreur lors de la création de la commande :', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'error' => 'Erreur interne du serveur',
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
}
