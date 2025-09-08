<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class UpdateOrdersTableStatusEnum extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Modificar el enum para incluir los nuevos valores
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'payment_uploaded', 'approved', 'confirmed', 'completed', 'cancelled', 'rejected') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Revertir al enum original
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'payment_uploaded', 'completed', 'cancelled') DEFAULT 'pending'");
    }
}
