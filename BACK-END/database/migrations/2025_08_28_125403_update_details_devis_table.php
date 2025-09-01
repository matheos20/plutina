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
        Schema::table('details_devis', function (Blueprint $table) {
            $table->unsignedBigInteger('id_produit')->after('id_devis');
            $table->integer('quantite')->after('id_produit');
            $table->decimal('prix_unitaire', 10, 2)->after('quantite');
            $table->decimal('prix_total', 10, 2)->after('prix_unitaire');
        });
    }

    public function down()
    {
        Schema::table('details_devis', function (Blueprint $table) {
            $table->dropColumn(['id_produit', 'quantite', 'prix_unitaire', 'prix_total']);
        });
    }

};
