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
        DB::statement("ALTER TABLE devis MODIFY etat ENUM('en attente','accepté','refusé','transformé') DEFAULT 'en attente'");
    }

    public function down()
    {
        DB::statement("ALTER TABLE devis MODIFY etat ENUM('en attente','accepté','refusé') DEFAULT 'en attente'");
    }

};
