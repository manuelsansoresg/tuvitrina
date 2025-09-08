<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTransferSettingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('transfer_settings', function (Blueprint $table) {
            $table->id();
            $table->string('bank_name');
            $table->string('account_holder');
            $table->string('account_number');
            $table->string('account_type')->nullable();
            $table->string('identification_number')->nullable();
            $table->text('additional_info')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('transfer_settings');
    }
}
