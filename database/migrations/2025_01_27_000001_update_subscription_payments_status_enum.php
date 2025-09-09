<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class UpdateSubscriptionPaymentsStatusEnum extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Modificar el enum para incluir el nuevo valor 'incomplete'
        DB::statement("ALTER TABLE subscription_payments MODIFY COLUMN status ENUM('pending', 'completed', 'failed', 'refunded', 'incomplete') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Revertir al enum original
        DB::statement("ALTER TABLE subscription_payments MODIFY COLUMN status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending'");
    }
}