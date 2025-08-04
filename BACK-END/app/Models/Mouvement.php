<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mouvement extends Model
{
    protected $fillable = ['date_mouvement', 'sortie', 'entree', 'id_produit', 'id_commande'];

    public function produit()
    {
        return $this->belongsTo(Produit::class, 'id_produit');
    }

    public function commande()
    {
        return $this->belongsTo(Commande::class, 'id_commande');
    }
}
