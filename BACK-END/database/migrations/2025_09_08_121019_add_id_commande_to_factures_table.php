<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('factures', function (Blueprint $table) {
            $table->foreignId('id_commande')->after('date_facture')->constrained('commandes')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('factures', function (Blueprint $table) {
            $table->dropForeign(['id_commande']);
            $table->dropColumn('id_commande');
        });
    }
};
