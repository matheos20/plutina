<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Devis extends Model
{
    protected $fillable = ['reference', 'total', 'etat', 'date_devis', 'id_client'];

    public function client()
    {
        return $this->belongsTo(User::class, 'id_client');
    }

    public function details()
    {
        return $this->hasMany(DetailDevis::class, 'id_devis');
    }

    // ✅ Relation avec les produits via la table pivot devis_produit
    public function produits()
    {
        return $this->belongsToMany(Produit::class, 'devis_produit')
            ->withPivot('quantite', 'prix_unitaire', 'prix_total')
            ->withTimestamps();
    }
}
