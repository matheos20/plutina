<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\DetailDevis;
use App\Models\Produit;

class Devis extends Model
{
    /**
     * Les attributs qui peuvent être assignés en masse.
     * La colonne 'id_user' est rendue remplissable pour permettre
     * l'insertion du client lors de la création d'un devis.
     *
     * @var array
     */
    protected $fillable = ['reference', 'total', 'etat', 'date_devis', 'id_user','debut_location','fin_location'];

    /**
     * Relation Many-to-one vers le modèle User pour le client.
     * La clé étrangère utilisée est 'id_user'.
     */
    public function client()
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    /**
     * Relation One-to-many vers le modèle DetailDevis.
     * La clé étrangère est 'id_devis'.
     */
    public function details()
    {
        return $this->hasMany(DetailDevis::class, 'id_devis');
    }

    /**
     * Relation Many-to-many avec les produits via la table pivot devis_produit.
     * Permet d'accéder aux produits d'un devis.
     */
    public function produits()
    {
        return $this->belongsToMany(Produit::class, 'devis_produit')
            ->withPivot('quantite', 'prix_unitaire', 'prix_total')
            ->withTimestamps();
    }
}
