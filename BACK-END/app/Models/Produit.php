<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Produit extends Model
{
    protected $fillable = ['designation', 'quantite', 'quantite_par_lot', 'reference', 'prix','prix_par_lot', 'mode_prix', 'image'];

    // Ajout pour retourner l'URL complète de l'image
    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        return $this->image ? asset('storage/' . $this->image) : null;
    }

    public function commandes()
    {
        return $this->belongsToMany(Commande::class, 'produit_commande', 'id_produit', 'id_commande')
            ->withPivot('quantite', 'prix_unitaire')
            ->withTimestamps();
    }

    public function mouvements()
    {
        return $this->hasMany(Mouvement::class, 'id_produit');
    }
    public function devis()
    {
        return $this->belongsToMany(Devis::class, 'devis_produit')
            ->withPivot('quantite', 'prix_unitaire', 'prix_total')
            ->withTimestamps();
    }
}
