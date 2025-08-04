<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProduitCommande extends Model
{
    protected $table = 'produit_commandes';

    protected $fillable = ['id_produit', 'id_commande', 'quantite', 'prix_unitaire'];
}
