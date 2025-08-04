<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('details_factures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_facture')->constrained('factures')->cascadeOnDelete();
            $table->foreignId('id_commande')->constrained('commandes')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('details_factures');
    }
};
