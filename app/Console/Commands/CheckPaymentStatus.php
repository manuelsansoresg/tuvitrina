<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\SubscriptionPayment;

class CheckPaymentStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payments:check';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check subscription payment status';

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
        $this->info('=== Subscription Payments Status ===');
        
        $payments = SubscriptionPayment::with('user')->orderBy('created_at', 'desc')->get();
        
        if ($payments->isEmpty()) {
            $this->info('No payments found.');
            return 0;
        }
        
        foreach ($payments as $payment) {
            $this->info("ID: {$payment->id} | Status: {$payment->status} | Label: {$payment->status_label} | User: {$payment->user->name} | Created: {$payment->created_at->format('Y-m-d H:i:s')}");
        }
        
        return 0;
    }
}
