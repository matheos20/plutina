<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetailDevis extends Model
{
    protected $table = 'details_devis'; // correspond exactement à la table

    protected $fillable = [
        'id_devis',
        'id_produit',
        'quantite',
        'prix_unitaire',
        'prix_total',
    ];

    public function devis()
    {
        return $this->belongsTo(Devis::class, 'id_devis');
    }

    public function produit()
    {
        return $this->belongsTo(Produit::class, 'id_produit');
    }
}
