<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('details_devis', function (Blueprint $table) {
            $table->unsignedBigInteger('id_commande')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('details_devis', function (Blueprint $table) {
            $table->unsignedBigInteger('id_commande')->nullable(false)->change();
        });
    }
};
