<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('pieces_justificatives', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_user')->constrained('users')->cascadeOnDelete();
            $table->text('chemin');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('pieces_justificatives');
    }
};
