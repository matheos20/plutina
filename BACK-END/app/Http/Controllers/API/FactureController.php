<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Facture;
use Illuminate\Http\Request;
use App\Models\Commande;

class FactureController extends Controller
{
    public function commandesPourFacture()
    {
        $commandes = Commande::with('client')
            ->where('etat', 'livrée')
            ->whereDoesntHave('facture')
            ->get();

        return response()->json([
            'success'   => true,
            'count'     => $commandes->count(),
            'commandes' => $commandes
        ], 200);
    }


    // Liste toutes les factures
    public function index()
    {
        // Charger les relations 'user', 'commande', et les 'produits' de la commande
        $factures = Facture::with(['user', 'commande.produits'])->latest()->get();
        return response()->json($factures);
    }

    // Créer une facture
    public function store(Request $request)
    {
        $validated = $request->validate([
            'reference' => 'required|string|unique:factures,reference',
            'total' => 'required|numeric',
            'date_facture' => 'required|date',
            'id_user' => 'required|exists:users,id',
            'id_commande' => 'required|exists:commandes,id',
        ]);

        $facture = Facture::create($validated);

        return response()->json([
            'message' => 'Facture créée avec succès',
            'facture' => $facture->load(['user','commande'])
        ], 201);
    }


    // Afficher une facture
    public function show($id)
    {
        $facture = Facture::with('user')->findOrFail($id);
        return response()->json($facture);
    }

    // Modifier une facture
    public function update(Request $request, $id)
    {
        $facture = Facture::findOrFail($id);

        $validated = $request->validate([
            'reference' => 'required|string|unique:factures,reference,' . $facture->id,
            'total' => 'required|numeric',
            'date_facture' => 'required|date',
            'id_user' => 'required|exists:users,id',
        ]);

        $facture->update($validated);

        return response()->json([
            'message' => 'Facture mise à jour avec succès',
            'facture' => $facture
        ]);
    }

    // Supprimer une facture
    public function destroy($id)
    {
        $facture = Facture::findOrFail($id);
        $facture->delete();

        return response()->json(['message' => 'Facture supprimée avec succès']);
    }

    public function genererDepuisCommande($id_commande)
    {
        $commande = \App\Models\Commande::with('produits')
            ->where('id', $id_commande)
            ->where('etat', 'livrée')
            ->whereDoesntHave('facture')
            ->first();

        if (!$commande) {
            return response()->json([
                'message' => 'Commande introuvable ou déjà facturée.'
            ], 200); // PAS 404 → front-end ne bloque pas
        }

        $total = $commande->produits->sum(fn($p) => $p->pivot->quantite * $p->pivot->prix_unitaire);

        $facture = \App\Models\Facture::create([
            'reference' => 'FAC-' . time(),
            'total' => $total,
            'date_facture' => now(),
            'id_user' => $commande->id_client,
            'id_commande' => $commande->id,
        ]);

        return response()->json([
            'message' => 'Facture générée avec succès',
            'facture' => $facture->load(['user', 'commande'])
        ]);
    }



}
