<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetailFacture extends Model
{
    protected $fillable = ['id_facture', 'id_commande'];

    public function facture()
    {
        return $this->belongsTo(Facture::class, 'id_facture');
    }

    public function commande()
    {
        return $this->belongsTo(Commande::class, 'id_commande');
    }
}
