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
            $table->dateTime('debut_location')->nullable()->after('total');
            $table->dateTime('fin_location')->nullable()->after('debut_location');
        });
    }

    public function down()
    {
        Schema::table('devis', function (Blueprint $table) {
            $table->dropColumn(['debut_location', 'fin_location']);
        });
    }

};
