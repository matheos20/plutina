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
        Schema::table('produits', function (Blueprint $table) {
            $table->enum('mode_prix', ['unitaire', 'proportionnel'])->default('unitaire');
            $table->decimal('prix_par_lot', 10, 2)->nullable();
            $table->integer('quantite_par_lot')->nullable();
        });
    }

    public function down()
    {
        Schema::table('produits', function (Blueprint $table) {
            $table->dropColumn(['mode_prix', 'prix_par_lot', 'quantite_par_lot']);
        });
    }

};
