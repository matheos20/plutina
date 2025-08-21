<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Produit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProduitController extends Controller
{
    public function allProduits()
    {
        // Tous les produits
        $produits = Produit::orderBy('designation', 'asc')->get();
        return response()->json($produits);
    }

    // Lister tous les produits
    public function index(Request $request)
    {
        $query = Produit::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('designation', 'like', "%$search%")
                ->orWhere('reference', 'like', "%$search%");
        }
//        return Produit::all();
//        return Produit::latest()->paginate(12); // 6 produits par page
        return $query->latest()->paginate(4);
    }


    // Créer un nouveau produit
    public function store(Request $request)
    {
        $validated = $request->validate([
            'designation' => 'required|string|max:255',
            'quantite' => 'required|integer',
            'quantite_par_lot' => 'nullable|integer',
            'reference' => 'required|string|max:255|unique:produits',
            'prix' => 'required|numeric',
            'image' => 'nullable|file|mimetypes:image/jpeg,image/png,image/webp,image/avif,image/jpg|max:3048',
        ]);

        if ($request->hasFile('image')) {
            \Log::info('Type MIME reçu : ' . $request->file('image')->getMimeType());
            \Log::info('Extension réelle : ' . $request->file('image')->getClientOriginalExtension());
            // Stocker dans storage/app/public/produits
            $path = $request->file('image')->store('produits', 'public');
            $validated['image'] = $path;
        }

        $produit = Produit::create($validated);

        return response()->json($produit, 201);
    }

    // Afficher un produit spécifique
    public function show($id)
    {
        return Produit::findOrFail($id);
    }

    // Mettre à jour un produit
    public function update(Request $request, $id)
    {
        $produit = Produit::findOrFail($id);

        $validated = $request->validate([
            'designation' => 'sometimes|string|max:255',
            'quantite' => 'sometimes|integer',
            'quantite_par_lot' => 'nullable|integer',
            'reference' => 'sometimes|string|max:255|unique:produits,reference,' . $id,
            'prix' => 'sometimes|numeric',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,avif,webp|max:3048',
        ]);

        if ($request->hasFile('image')) {
            // Supprimer l'ancienne image
            if ($produit->image) {
                Storage::delete('public/' . $produit->image);
            }

            $path = $request->file('image')->store('produits', 'public');
            $validated['image'] = $path;
        }


        $produit->update($validated);
        return response()->json($produit);
    }

    // Supprimer un produit
    public function destroy($id)
    {
        $produit = Produit::findOrFail($id);

        // Supprimer l'image liée si elle existe
        if ($produit->image) {
            Storage::delete('public/images/' . $produit->image);
        }

        $produit->delete();
        return response()->json(null, 204);
    }
}
