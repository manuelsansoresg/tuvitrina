<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\SubscriptionPayment;
use Carbon\Carbon;

class FixUserSubscription extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscription:fix-user {email : The email of the user to fix}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix the subscription status of a specific user';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $email = $this->argument('email');
        
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            $this->error("User with email {$email} not found.");
            return 1;
        }
        
        $this->info("Fixing subscription for {$user->name} ({$email})");
        
        // Find the most recent payment
        $payment = $user->subscriptionPayments()->orderBy('created_at', 'desc')->first();
        
        if (!$payment) {
            $this->error('No subscription payments found for this user.');
            return 1;
        }
        
        $this->info("Found payment ID: {$payment->id} with status: {$payment->status}");
        
        // If payment has expires_at in the future, it should be completed
        if ($payment->expires_at && Carbon::parse($payment->expires_at)->gt(Carbon::now())) {
            $this->info('Payment has future expiration date, marking as completed...');
            
            // Update payment status
            $payment->update([
                'status' => 'completed',
                'verified_at' => Carbon::now()
            ]);
            
            // Map plan type to correct enum value
            $selectedPlan = $this->mapPlanType($payment->plan_type);
            
            // Update user subscription
            $user->update([
                'subscription_status' => 'active',
                'subscription_expires_at' => $payment->expires_at,
                'selected_plan' => $selectedPlan,
                'last_payment_date' => Carbon::now()
            ]);
            
            $this->info('✅ Fixed successfully!');
            $this->info("User subscription status: active");
            $this->info("Expires at: {$payment->expires_at}");
            $this->info("Plan: {$payment->plan_type}");
            
        } else {
            $this->warn('Payment does not have a valid future expiration date.');
            
            if ($this->confirm('Do you want to set a new expiration date based on the plan type?')) {
                $newExpiration = $payment->plan_type === 'monthly' ? 
                    Carbon::now()->addMonth() : 
                    Carbon::now()->addYear();
                
                $payment->update([
                    'status' => 'completed',
                    'verified_at' => Carbon::now(),
                    'expires_at' => $newExpiration
                ]);
                
                // Map plan type to correct enum value
                $selectedPlan = $this->mapPlanType($payment->plan_type);
                
                $user->update([
                    'subscription_status' => 'active',
                    'subscription_expires_at' => $newExpiration,
                    'selected_plan' => $selectedPlan,
                    'last_payment_date' => Carbon::now()
                ]);
                
                $this->info('✅ Fixed with new expiration date!');
                $this->info("New expiration: {$newExpiration}");
            }
        }
        
        return 0;
    }
    
    /**
     * Map payment plan type to user selected_plan enum value
     */
    private function mapPlanType($planType)
    {
        // Convert payment plan_type to user selected_plan enum
        switch (strtolower($planType)) {
            case 'plan mensual':
            case 'monthly':
                return 'monthly';
            case 'plan anual':
            case 'annual':
                return 'annual';
            default:
                // Default to monthly if unknown
                return 'monthly';
        }
    }
}