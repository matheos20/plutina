<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Devis;
use App\Models\User;
use App\Models\Produit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\DetailDevis;
use App\Models\Commande;

class DevisController extends Controller
{
    // Liste tous les devis
    public function index(Request $request)
    {
        $perPage = $request->query('limit', 10); // nombre de devis par page, par défaut 10
        $devis = Devis::with('client', 'produits')->latest()->paginate($perPage);

        return response()->json($devis);
    }


    // Données pour créer un devis (clients + produits)
    public function create()
    {
        $clients = User::all();
        $produits = Produit::all();

        return response()->json([
            'clients' => $clients,
            'produits' => $produits
        ]);
    }

    // Créer un devis
    public function store(Request $request)
    {
        // Validation des données
        $validatedData = $request->validate([
            'reference' => 'required|string|max:255|unique:devis,reference',
            'id_client' => 'required|exists:users,id',
            'produits' => 'required|array|min:1',
            'produits.*.id' => 'required|exists:produits,id',
            'produits.*.quantite' => 'required|integer|min:1',
            'produits.*.prix_unitaire' => 'required|numeric|min:0',
            'debut_location' => 'required|date|after_or_equal:today',
            'fin_location'   => 'required|date|after:debut_location',
        ]);

        DB::beginTransaction();

        try {
            // Création du devis
            $devis = Devis::create([
                'reference'      => $validatedData['reference'],
                'etat'           => 'en attente',
                'date_devis'     => now(),
                'total'          => 0,
                'id_user'        => $validatedData['id_client'],
                'debut_location' => $validatedData['debut_location'],
                'fin_location'   => $validatedData['fin_location'],
            ]);

            $total = 0;
            $produitsPivotData = [];
            $detailsDevisData = [];

            foreach ($validatedData['produits'] as $produitData) {
                $prixTotalProduit = $produitData['quantite'] * $produitData['prix_unitaire'];
                $total += $prixTotalProduit;

                $produitsPivotData[$produitData['id']] = [
                    'quantite'      => $produitData['quantite'],
                    'prix_unitaire' => $produitData['prix_unitaire'],
                    'prix_total'    => $prixTotalProduit,
                ];

                $detailsDevisData[] = [
                    'id_devis'      => $devis->id,
                    'id_produit'    => $produitData['id'],
                    'quantite'      => $produitData['quantite'],
                    'prix_unitaire' => $produitData['prix_unitaire'],
                    'prix_total'    => $prixTotalProduit,
                ];
            }

            $devis->produits()->attach($produitsPivotData);
            if (!empty($detailsDevisData)) {
                DetailDevis::insert($detailsDevisData);
            }

            $devis->update(['total' => $total]);

            DB::commit();

            return response()->json([
                'message' => 'Devis créé avec succès !',
                'devis'   => $devis->load('produits')
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'error' => 'Erreur lors de la création du devis : ' . $e->getMessage()
            ], 500);
        }
    }

    // Changer l’état du devis
    public function changerEtat(Request $request, $id)
    {
        // Définir les états autorisés
        $etatsAutorises = ['Brouillon', 'en attente', 'accepté', 'refusé', 'transformé', 'annulé'];

        // Validation
        $request->validate([
            'etat' => ['required', function ($attribute, $value, $fail) use ($etatsAutorises) {
                if (!in_array($value, $etatsAutorises)) {
                    $fail("L'état sélectionné est invalide.");
                }
            }],
        ]);

        try {
            // On récupère le devis avec ses produits
            $devis = Devis::with('produits')->findOrFail($id);

            // Mise à jour de l'état
            $devis->etat = $request->etat;
            $devis->save();

            // Transformation en commande si demandé
            if ($request->etat === 'transformé') {
                if (!$devis->debut_location || !$devis->fin_location) {
                    return response()->json([
                        'error' => 'Impossible de transformer le devis : les dates de location sont manquantes.'
                    ], 422);
                }

                $commande = Commande::create([
                    'id_client'      => $devis->id_user,
                    'etat'           => 'en cours',
                    'prix_total'     => $devis->total,
                    'debut_location' => $devis->debut_location,
                    'fin_location'   => $devis->fin_location,
                    'date_commande'  => now(),
                ]);

                foreach ($devis->produits as $produit) {
                    $commande->produits()->attach($produit->id, [
                        'quantite'      => $produit->pivot->quantite,
                        'prix_unitaire' => $produit->pivot->prix_unitaire,
                        'prix_total'    => $produit->pivot->prix_total,
                    ]);
                }
            }

            return response()->json(['message' => "État du devis mis à jour avec succès !"]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors du changement d\'état : ' . $e->getMessage()
            ], 500);
        }
    }


}
