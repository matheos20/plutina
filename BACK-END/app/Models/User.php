<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;  // <-- ici l'import correct
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = ['nom', 'prenom', 'email', 'password', 'adresse', 'id_type_client', 'role'];

    public function typeClient()
    {
        return $this->belongsTo(TypeClient::class, 'id_type_client');
    }

    public function commandes()
    {
        return $this->hasMany(Commande::class, 'id_client');
    }

    public function piecesJustificatives()
    {
        return $this->hasMany(PieceJustificative::class, 'id_client');
    }

    public function devis()
    {
        return $this->hasMany(Devis::class, 'id_client');
    }

    public function factures()
    {
        return $this->hasMany(Facture::class, 'id_client');
    }
}
