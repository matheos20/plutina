<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Devis;
use App\Models\Produit;
use App\Models\Commande;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DevisController extends Controller
{
    /**
     * 📌 Liste de tous les devis
     */
    public function index()
    {
        try {
            // Récupérer tous les devis avec client et produits
            $devis = Devis::with(['client', 'produits'])->get();
            return response()->json($devis);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des devis',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    /**
     * 📌 Créer un nouveau devis
     */
    public function store(Request $request)
    {
        $request->validate([
            'reference'   => 'required|unique:devis,reference',
            'date_devis'  => 'required|date',
            'id_user'     => 'required|exists:users,id',
            'produits'    => 'required|array',
            'produits.*.id' => 'required|exists:produits,id',
            'produits.*.quantite' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();

        try {
            // Création du devis
            $devis = Devis::create([
                'reference' => $request->reference,
                'date_devis' => $request->date_devis,
                'id_user' => $request->id_user,
                'total' => 0, // sera calculé
            ]);

            $total = 0;

            foreach ($request->produits as $prod) {
                $produit = Produit::findOrFail($prod['id']);
                $prixUnitaire = $produit->prix;
                $quantite = $prod['quantite'];
                $prixTotal = $prixUnitaire * $quantite;

                // Attacher au pivot
                $devis->produits()->attach($produit->id, [
                    'quantite' => $quantite,
                    'prix_unitaire' => $prixUnitaire,
                    'prix_total' => $prixTotal,
                ]);

                $total += $prixTotal;
            }

            $devis->update(['total' => $total]);

            DB::commit();
            return response()->json(['message' => 'Devis créé avec succès', 'devis' => $devis->load('produits')], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * 📌 Afficher un devis spécifique
     */
    public function show($id)
    {
        $devis = Devis::with(['client', 'produits'])->findOrFail($id);
        return response()->json($devis);
    }

    /**
     * 📌 Modifier un devis (si encore en attente)
     */
    public function update(Request $request, $id)
    {
        $devis = Devis::findOrFail($id);

        if ($devis->etat !== 'en attente') {
            return response()->json(['error' => 'Impossible de modifier un devis accepté ou refusé'], 403);
        }

        $request->validate([
            'produits'    => 'required|array',
            'produits.*.id' => 'required|exists:produits,id',
            'produits.*.quantite' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();

        try {
            // Supprimer les anciens produits
            $devis->produits()->detach();
            $total = 0;

            foreach ($request->produits as $prod) {
                $produit = Produit::findOrFail($prod['id']);
                $prixUnitaire = $produit->prix;
                $quantite = $prod['quantite'];
                $prixTotal = $prixUnitaire * $quantite;

                $devis->produits()->attach($produit->id, [
                    'quantite' => $quantite,
                    'prix_unitaire' => $prixUnitaire,
                    'prix_total' => $prixTotal,
                ]);

                $total += $prixTotal;
            }

            $devis->update(['total' => $total]);

            DB::commit();
            return response()->json(['message' => 'Devis modifié avec succès', 'devis' => $devis->load('produits')]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * 📌 Supprimer un devis
     */
    public function destroy($id)
    {
        $devis = Devis::findOrFail($id);
        $devis->delete();
        return response()->json(['message' => 'Devis supprimé avec succès']);
    }

    /**
     * 📌 Accepter un devis
     */
    public function accepter($id)
    {
        $devis = Devis::findOrFail($id);

        if ($devis->etat !== 'en attente') {
            return response()->json(['error' => 'Ce devis a déjà été traité'], 403);
        }

        $devis->update(['etat' => 'accepté']);
        return response()->json(['message' => 'Devis accepté', 'devis' => $devis]);
    }

    /**
     * 📌 Refuser un devis
     */
    public function refuser($id)
    {
        $devis = Devis::findOrFail($id);

        if ($devis->etat !== 'en attente') {
            return response()->json(['error' => 'Ce devis a déjà été traité'], 403);
        }

        $devis->update(['etat' => 'refusé']);
        return response()->json(['message' => 'Devis refusé', 'devis' => $devis]);
    }

    /**
     * 📌 Transformer un devis accepté en commande
     */
    public function transformerEnCommande($id)
    {
        try {
            $devis = Devis::with('produits')->findOrFail($id);

            if ($devis->produits->isEmpty()) {
                return response()->json(['message' => 'Le devis ne contient aucun produit'], 400);
            }

            if ($devis->etat !== 'accepté') {
                return response()->json(['message' => 'Le devis doit être accepté avant de le transformer'], 400);
            }

            $commande = Commande::create([
                'id_client' => $devis->id_user,
                'debut_location' => now(),             // ou $devis->date_devis si tu veux
                'fin_location' => now()->addDays(7),  // exemple : +7 jours
                'prix_total' => $devis->total,
            ]);

            foreach ($devis->produits as $produit) {
                $commande->produits()->attach($produit->id, [
                    'quantite' => $produit->pivot->quantite,
                    'prix_unitaire' => $produit->pivot->prix_unitaire,
                    'prix_total' => $produit->pivot->prix_total,
                ]);
            }

            $devis->update(['etat' => 'transformé']); // laisse l’état “accepté”

            return response()->json([
                'message' => 'Devis transformé en commande avec succès',
                'commande' => $commande->load('produits')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la transformation du devis',
                'error' => $e->getMessage()
            ], 500);
        }
    }


}
