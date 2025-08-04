<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\TypeClient;

class TypeClientController extends Controller
{
    public function index()
    {
        return TypeClient::all();
    }
}
