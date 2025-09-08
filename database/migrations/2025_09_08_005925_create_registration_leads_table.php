<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRegistrationLeadsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('registration_leads', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->enum('plan_type', ['monthly', 'annual']);
            $table->decimal('amount', 8, 2);
            $table->string('payment_proof')->nullable();
            $table->enum('status', ['pending', 'payment_uploaded', 'approved', 'rejected'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamp('payment_uploaded_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users');
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
        Schema::dropIfExists('registration_leads');
    }
}
