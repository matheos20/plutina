<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Devis extends Model
{
    protected $fillable = ['reference', 'total', 'etat', 'date_devis', 'id_client'];

    public function client()
    {
        return $this->belongsTo(User::class, 'id_client');
    }

    public function details()
    {
        return $this->hasMany(DetailDevis::class, 'id_devis');
    }
}
