<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetailDevis extends Model
{
    protected $fillable = ['id_devis', 'id_commande'];

    public function devis()
    {
        return $this->belongsTo(Devis::class, 'id_devis');
    }

    public function commande()
    {
        return $this->belongsTo(Commande::class, 'id_commande');
    }
}
