<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('details_devis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_devis')->constrained('devis')->cascadeOnDelete();
            $table->foreignId('id_commande')->constrained('commandes')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('details_devis');
    }
};
