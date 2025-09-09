<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class FixSubscriptionPaymentsPlanTypeEnum extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Primero actualizar los valores existentes de 'annual' a 'yearly'
        DB::statement("UPDATE subscription_payments SET plan_type = 'yearly' WHERE plan_type = 'annual'");
        
        // Luego modificar la columna usando SQL directo
        DB::statement("ALTER TABLE subscription_payments MODIFY COLUMN plan_type ENUM('monthly', 'yearly') NOT NULL");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Revertir los valores de 'yearly' a 'annual'
        DB::statement("UPDATE subscription_payments SET plan_type = 'annual' WHERE plan_type = 'yearly'");
        
        // Revertir la columna
        DB::statement("ALTER TABLE subscription_payments MODIFY COLUMN plan_type ENUM('monthly', 'annual') NOT NULL");
    }
}
