<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\SubscriptionPayment;
use Carbon\Carbon;

class ApprovePayment extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payment:approve {id}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Approve a subscription payment';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $paymentId = $this->argument('id');
        $payment = SubscriptionPayment::find($paymentId);
        
        if (!$payment) {
            $this->error("Payment with ID {$paymentId} not found.");
            return 1;
        }
        
        $this->info("Current payment status: {$payment->status} ({$payment->status_label})");
        
        if ($payment->status === 'completed') {
            $this->info('Payment is already completed.');
            return 0;
        }
        
        // Update payment status
        $payment->update([
            'status' => 'completed',
            'verified_at' => Carbon::now()
        ]);
        
        $this->info("Payment approved successfully! New status: {$payment->fresh()->status} ({$payment->fresh()->status_label})");
        
        return 0;
    }
}
