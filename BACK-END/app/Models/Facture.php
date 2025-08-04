<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Facture extends Model
{
    protected $fillable = ['reference', 'total', 'date_facture', 'id_client'];

    public function client()
    {
        return $this->belongsTo(User::class, 'id_client');
    }

    public function details()
    {
        return $this->hasMany(DetailFacture::class, 'id_facture');
    }
}
