<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Commande extends Model
{
    protected $fillable = ['id_client', 'etat', 'prix', 'quantite', 'debut_location', 'fin_location'];

    public function client()
    {
        return $this->belongsTo(User::class, 'id_client');
    }

    public function produits()
    {
        return $this->belongsToMany(Produit::class, 'produit_commande', 'id_commande', 'id_produit')
            ->withPivot('quantite', 'prix_unitaire','prix_total')
            ->withTimestamps();
    }

    public function mouvements()
    {
        return $this->hasMany(Mouvement::class, 'id_commande');
    }

    public function detailsDevis()
    {
        return $this->hasMany(DetailDevis::class, 'id_commande');
    }

    public function detailsFactures()
    {
        return $this->hasMany(DetailFacture::class, 'id_commande');
    }
}
