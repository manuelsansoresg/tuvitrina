<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\SubscriptionPayment;
use App\Models\User;
use Carbon\Carbon;

class ProcessSubscriptionPayments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscription:process-payments {--auto-approve : Automatically approve all pending payments}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process pending subscription payments and update user subscriptions';

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
        $this->info('Processing subscription payments...');
        
        $pendingPayments = SubscriptionPayment::where('status', 'pending')
            ->with('user')
            ->get();
            
        if ($pendingPayments->isEmpty()) {
            $this->info('No pending payments found.');
            return 0;
        }
        
        $this->info("Found {$pendingPayments->count()} pending payments.");
        
        $autoApprove = $this->option('auto-approve');
        $processedCount = 0;
        
        foreach ($pendingPayments as $payment) {
            $shouldProcess = $autoApprove;
            
            if (!$autoApprove) {
                $shouldProcess = $this->confirm(
                    "Process payment for {$payment->user->name} ({$payment->plan_type} - \${$payment->amount})?"
                );
            }
            
            if ($shouldProcess) {
                $this->processPayment($payment);
                $processedCount++;
            }
        }
        
        $this->info("Processed {$processedCount} payments successfully.");
        return 0;
    }
    
    private function processPayment(SubscriptionPayment $payment)
    {
        $user = $payment->user;
        
        // Calcular nueva fecha de vencimiento
        $currentExpiration = $user->subscription_expires_at ? 
            Carbon::parse($user->subscription_expires_at) : 
            Carbon::now();
            
        // Si la suscripción ya venció, empezar desde hoy
        if ($currentExpiration->lt(Carbon::now())) {
            $currentExpiration = Carbon::now();
        }
        
        // Agregar tiempo según el plan
        $newExpiration = $payment->plan_type === 'monthly' ? 
            $currentExpiration->addMonth() : 
            $currentExpiration->addYear();
            
        // Actualizar usuario
        $user->update([
            'subscription_expires_at' => $newExpiration,
            'subscription_status' => 'active',
            'last_payment_date' => Carbon::now(),
            'selected_plan' => $payment->plan_type
        ]);
        
        // Marcar pago como completado
        $payment->update([
            'status' => 'completed',
            'verified_at' => Carbon::now()
        ]);
        
        $this->info("✓ Processed payment for {$user->name} - New expiration: {$newExpiration->format('Y-m-d')}");
    }
}
