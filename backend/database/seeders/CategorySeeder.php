<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Desarrollo Web', 'slug' => 'desarrollo-web'],
            ['name' => 'Backend', 'slug' => 'backend'],
            ['name' => 'DevOps & Infraestructura', 'slug' => 'devops-infraestructura'],
            ['name' => 'Inteligencia Artificial', 'slug' => 'inteligencia-artificial'],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(['slug' => $cat['slug']], [
                'name' => $cat['name'],
                'is_active' => true,
            ]);
        }

        $this->command->info('Categorías creadas: ' . count($categories) . ' registros.');
    }
}
