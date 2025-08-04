<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TypeClient extends Model
{
    protected $table = 'types_clients';
    protected $fillable = ['designation'];

    public function users()
    {
        return $this->hasMany(User::class, 'id_type_client');
    }
}
