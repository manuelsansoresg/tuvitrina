<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FixSubscriptionStatusForActiveUsers extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Corregir usuarios que tienen pagos completados pero estado incorrecto
        $usersWithCompletedPayments = DB::table('subscription_payments')
            ->select('user_id')
            ->where('status', 'completed')
            ->where('expires_at', '>', Carbon::now())
            ->groupBy('user_id')
            ->get();

        foreach ($usersWithCompletedPayments as $payment) {
            // Obtener el pago más reciente completado para este usuario
            $latestPayment = DB::table('subscription_payments')
                ->where('user_id', $payment->user_id)
                ->where('status', 'completed')
                ->where('expires_at', '>', Carbon::now())
                ->orderBy('expires_at', 'desc')
                ->first();

            if ($latestPayment) {
                // Actualizar el usuario con la información correcta
                DB::table('users')
                    ->where('id', $payment->user_id)
                    ->update([
                        'subscription_status' => 'active',
                        'subscription_expires_at' => $latestPayment->expires_at,
                        'selected_plan' => $latestPayment->plan_type,
                        'last_payment_date' => $latestPayment->verified_at,
                        'updated_at' => Carbon::now()
                    ]);
            }
        }

        // También corregir usuarios que tienen subscription_expires_at en el futuro pero estado incorrecto
        DB::table('users')
            ->where('subscription_expires_at', '>', Carbon::now())
            ->where('subscription_status', '!=', 'active')
            ->update([
                'subscription_status' => 'active',
                'updated_at' => Carbon::now()
            ]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // No hay reversión necesaria para esta migración de corrección
    }
}