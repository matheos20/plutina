<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('devis', function (Blueprint $table) {
            // On change le type enum en string
            $table->string('etat')->default('Brouillon')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('devis', function (Blueprint $table) {
            // On revient à l'ancien enum
            $table->enum('etat', ['Brouillon','en attente','accepté','refusé','transformé'])
                ->default('Brouillon')
                ->change();
        });
    }
};
