<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('mouvements', function (Blueprint $table) {
            $table->id();
            $table->date('date_mouvement');
            $table->enum('type', ['entrée', 'sortie']);
            $table->integer('quantite');
            $table->foreignId('id_produit')->constrained('produits')->cascadeOnDelete();
            $table->foreignId('id_commande')->nullable()->constrained('commandes')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('mouvements');
    }
};
