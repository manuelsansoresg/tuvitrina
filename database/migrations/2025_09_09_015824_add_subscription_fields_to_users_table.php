<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddSubscriptionFieldsToUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('subscription_expires_at')->nullable()->after('selected_plan');
            $table->enum('subscription_status', ['active', 'expired', 'cancelled', 'pending_renewal'])->default('active')->after('subscription_expires_at');
            $table->timestamp('last_payment_date')->nullable()->after('subscription_status');
            $table->boolean('renewal_notification_sent')->default(false)->after('last_payment_date');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'subscription_expires_at',
                'subscription_status',
                'last_payment_date',
                'renewal_notification_sent'
            ]);
        });
    }
}
