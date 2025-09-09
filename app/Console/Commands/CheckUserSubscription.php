<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\SubscriptionPayment;
use Carbon\Carbon;

class CheckUserSubscription extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscription:check-user {email : The email of the user to check}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check the subscription status of a specific user';

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
        
        $this->info("=== Subscription Status for {$user->name} ({$email}) ===");
        $this->info("User ID: {$user->id}");
        $this->info("Current Status: {$user->subscription_status}");
        $this->info("Selected Plan: {$user->selected_plan}");
        $this->info("Expires At: " . ($user->subscription_expires_at ? $user->subscription_expires_at->format('Y-m-d H:i:s') : 'Not set'));
        $this->info("Last Payment Date: " . ($user->last_payment_date ? $user->last_payment_date->format('Y-m-d H:i:s') : 'Not set'));
        
        // Check if subscription is active
        $isActive = $user->hasActiveSubscription();
        $this->info("Has Active Subscription: " . ($isActive ? 'YES' : 'NO'));
        
        if ($user->subscription_expires_at) {
            $daysUntilExpiration = $user->getDaysUntilExpirationAttribute();
            $this->info("Days Until Expiration: {$daysUntilExpiration}");
        }
        
        // Check subscription payments
        $payments = $user->subscriptionPayments()->orderBy('created_at', 'desc')->take(5)->get();
        
        if ($payments->count() > 0) {
            $this->info("\n=== Recent Subscription Payments ===");
            foreach ($payments as $payment) {
                $this->info("Payment ID: {$payment->id}");
                $this->info("  Status: {$payment->status}");
                $this->info("  Plan: {$payment->plan_type}");
                $this->info("  Amount: \${$payment->amount}");
                $this->info("  Created: {$payment->created_at->format('Y-m-d H:i:s')}");
                $this->info("  Verified: " . ($payment->verified_at ? $payment->verified_at->format('Y-m-d H:i:s') : 'Not verified'));
                $this->info("  Expires: " . ($payment->expires_at ? $payment->expires_at->format('Y-m-d H:i:s') : 'Not set'));
                $this->info("---");
            }
        } else {
            $this->info("\nNo subscription payments found.");
        }
        
        // Suggest fixes if needed
        if (!$isActive && $user->subscription_expires_at && $user->subscription_expires_at > Carbon::now()) {
            $this->warn("\n⚠️  ISSUE DETECTED: User has future expiration date but subscription is not active.");
            $this->info("Suggested fix: Update subscription_status to 'active'");
            
            if ($this->confirm('Do you want to fix this automatically?')) {
                $user->update(['subscription_status' => 'active']);
                $this->info('✅ Fixed: User subscription status updated to active.');
            }
        }
        
        return 0;
    }
}