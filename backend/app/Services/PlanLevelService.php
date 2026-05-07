<?php

declare(strict_types=1);

namespace App\Services;

final readonly class PlanLevelService
{
    public function canAccess(string $planName, string $courseLevel): bool
    {
        return in_array(strtolower($courseLevel), $this->getAllowedLevels($planName), true);
    }

    public function getAllowedLevels(string $planName): array
    {
        $plan = strtolower($planName);

        if (str_contains($plan, 'enterprise') || str_contains($plan, 'premium')) {
            return ['beginner', 'intermediate', 'advanced'];
        }

        if (str_contains($plan, 'pro') || str_contains($plan, 'professional')) {
            return ['beginner', 'intermediate'];
        }

        return ['beginner'];
    }
}
