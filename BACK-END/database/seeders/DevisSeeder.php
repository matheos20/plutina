<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Produit;
use App\Models\Devis;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DevisSeeder extends Seeder
{
    public function run(): void
    {
        DB::beginTransaction();

        try {
            // 1. Créer un utilisateur client de test
            $client = User::firstOrCreate(
                ['email' => 'client@test.com'],
                [
                    'nom' => 'Client',
                    'prenom' => 'Test',
                    'password' => bcrypt('123456'),
                    'role' => 'client', // si tu as un champ role
                ]
            );

            // 2. Créer quelques produits
            $produit1 = Produit::firstOrCreate(
                ['designation' => 'Chaise'],
                ['reference' => 'Ref2020', 'prix' => 100.00, 'quantite'=> 1, 'mode_prix' => 'unitaire']
            );

            $produit2 = Produit::firstOrCreate(
                ['designation' => 'Table'],
                ['reference' => 'TRef-Chaise400', 'prix' => 400.00, 'quantite'=> 1, 'mode_prix' => 'unitaire']
            );

            // 3. Créer un devis
            $devis = Devis::create([
                'reference' => 'DEV-' . time(),
                'date_devis' => Carbon::now(),
                'id_user' => $client->id,
                'total' => 0,
            ]);

            // 4. Attacher les produits au devis
            $devis->produits()->attach($produit1->id, [
                'quantite' => 4,
                'prix_unitaire' => $produit1->prix,
                'prix_total' => $produit1->prix * 4,
            ]);

            $devis->produits()->attach($produit2->id, [
                'quantite' => 2,
                'prix_unitaire' => $produit2->prix,
                'prix_total' => $produit2->prix * 2,
            ]);

            // 5. Mettre à jour le total
            $devis->update([
                'total' => $devis->produits->sum(fn($p) => $p->pivot->prix_total)
            ]);

            DB::commit();

            echo "✅ Devis de test créé avec succès\n";

        } catch (\Exception $e) {
            DB::rollBack();
            echo "❌ Erreur lors de la création du devis : " . $e->getMessage() . "\n";
        }
    }
}
