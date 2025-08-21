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
        Schema::table('produit_commande', function (Blueprint $table) {
            $table->decimal('prix_total', 10, 2)->after('prix_unitaire');
        });
    }

    public function down()
    {
        Schema::table('produit_commande', function (Blueprint $table) {
            $table->dropColumn('prix_total');
        });
    }

};
