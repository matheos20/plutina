<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Facture extends Model
{
    protected $fillable = ['reference', 'total', 'date_facture', 'id_user','id_commande'];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function commande()
    {
        return $this->belongsTo(Commande::class, 'id_commande');
    }

    public function details()
    {
        return $this->hasMany(DetailFacture::class, 'id_facture');
    }
}
