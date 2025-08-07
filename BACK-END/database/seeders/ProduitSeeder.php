<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProduitSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('produits')->insert([
            [
                'designation' => 'Chaise standard',
                'reference' => 'CH001',
                'quantite' => 100,
                'prix' => 12000,
                'mode_prix' => 'unitaire',
                'prix_par_lot' => null,
                'quantite_par_lot' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'designation' => 'Table ronde - Lot de 5',
                'reference' => 'TB005',
                'quantite' => 50,
                'prix' => 0, // pas utilisé si mode proportionnel
                'mode_prix' => 'proportionnel',
                'prix_par_lot' => 40000,
                'quantite_par_lot' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'designation' => 'Tente 3x3',
                'reference' => 'TN333',
                'quantite' => 20,
                'prix' => 50000,
                'mode_prix' => 'unitaire',
                'prix_par_lot' => null,
                'quantite_par_lot' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
