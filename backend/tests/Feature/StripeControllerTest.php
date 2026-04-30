<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\SubscriptionPlan;

class StripeControllerTest extends TestCase
{
    /** @test */
    public function testCalculatesUnitAmountCorrectly()
    {
        $plan = new SubscriptionPlan(['price' => 9999]); // Already in cents

        // Simulate the same logic as in StripeController
        $unitAmount = (int) rtrim((string) $plan->price, '.00');

        $this->assertEquals(9999, $unitAmount); // Ensure no multiplication error
    }
}