<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('commandes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_client')->constrained('users')->cascadeOnDelete();
            $table->enum('etat', ['en cours', 'livrée', 'annulée'])->default('en cours');
            $table->decimal('prix_total', 10, 2)->default(0);
            $table->dateTime('debut_location');
            $table->dateTime('fin_location');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('commandes');
    }
};
