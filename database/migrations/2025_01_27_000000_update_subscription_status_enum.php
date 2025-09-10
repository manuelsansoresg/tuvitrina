<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class UpdateSubscriptionStatusEnum extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Modificar el enum para incluir los nuevos valores
        DB::statement("ALTER TABLE users MODIFY COLUMN subscription_status ENUM('active', 'expired', 'cancelled', 'pending_renewal', 'incomplete', 'pending_approval', 'pending') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Revertir al enum original
        DB::statement("ALTER TABLE users MODIFY COLUMN subscription_status ENUM('active', 'expired', 'cancelled', 'pending_renewal') DEFAULT 'active'");
    }
}