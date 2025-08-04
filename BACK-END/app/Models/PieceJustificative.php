<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PieceJustificative extends Model
{
    protected $fillable = ['id_client', 'chemin'];

    public function client()
    {
        return $this->belongsTo(User::class, 'id_client');
    }
}
