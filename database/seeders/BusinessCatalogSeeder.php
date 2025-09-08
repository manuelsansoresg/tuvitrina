<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Business;
use App\Models\Product;
use Illuminate\Support\Facades\Hash;

class BusinessCatalogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Crear usuario de prueba
        $user = User::create([
            'name' => 'María González',
            'email' => 'maria@cafeteriadelcentro.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // Crear negocio de prueba
        $business = Business::create([
            'user_id' => $user->id,
            'business_name' => 'Cafetería del Centro',
            'slug' => 'cafeteria-del-centro',
            'about' => 'Somos una cafetería familiar ubicada en el corazón de la ciudad. Ofrecemos los mejores cafés artesanales, postres caseros y un ambiente acogedor para disfrutar con amigos y familia. Más de 15 años sirviendo a nuestra comunidad con productos de la más alta calidad.',
            'facebook_url' => 'https://facebook.com/cafeteriadelcentro',
            'instagram_url' => 'https://instagram.com/cafeteriadelcentro',
            'twitter_url' => 'https://twitter.com/cafedelcentro',
            'accepts_bank_transfer' => true,
            'bank_name' => 'BBVA México',
            'account_number' => '0123456789',
            'account_holder' => 'María González Pérez',
            'clabe' => '012180001234567890',
        ]);

        // Crear productos de prueba
        $products = [
            [
                'name' => 'Café Americano',
                'description' => 'Café negro tradicional preparado con granos 100% arábica de Chiapas. Perfecto para comenzar el día con energía.',
                'price' => 35.00,
                'stock' => 50,
                'category' => 'Bebidas Calientes',
                'sku' => 'CAF-AME-001',
                'is_active' => true,
            ],
            [
                'name' => 'Cappuccino',
                'description' => 'Espresso con leche vaporizada y espuma cremosa. Decorado con arte latte por nuestros baristas expertos.',
                'price' => 45.00,
                'stock' => 30,
                'category' => 'Bebidas Calientes',
                'sku' => 'CAF-CAP-002',
                'is_active' => true,
            ],
            [
                'name' => 'Frappé de Vainilla',
                'description' => 'Bebida fría refrescante con café, hielo, leche y jarabe de vainilla. Coronado con crema batida.',
                'price' => 55.00,
                'stock' => 25,
                'category' => 'Bebidas Frías',
                'sku' => 'BEB-FRA-003',
                'is_active' => true,
            ],
            [
                'name' => 'Cheesecake de Fresa',
                'description' => 'Delicioso cheesecake casero con base de galleta y topping de fresas frescas. Una experiencia única para el paladar.',
                'price' => 65.00,
                'stock' => 8,
                'category' => 'Postres',
                'sku' => 'POS-CHE-004',
                'is_active' => true,
            ],
            [
                'name' => 'Croissant de Chocolate',
                'description' => 'Croissant artesanal horneado diariamente, relleno de chocolate belga. Perfecto para acompañar tu café.',
                'price' => 40.00,
                'stock' => 15,
                'category' => 'Panadería',
                'sku' => 'PAN-CRO-005',
                'is_active' => true,
            ],
            [
                'name' => 'Sandwich Club',
                'description' => 'Sandwich triple con pollo, tocino, lechuga, tomate y mayonesa en pan tostado. Incluye papas fritas.',
                'price' => 85.00,
                'stock' => 20,
                'category' => 'Comida',
                'sku' => 'COM-SAN-006',
                'is_active' => true,
            ],
            [
                'name' => 'Té Chai Latte',
                'description' => 'Mezcla aromática de té negro con especias tradicionales y leche vaporizada. Una experiencia sensorial única.',
                'price' => 42.00,
                'stock' => 18,
                'category' => 'Bebidas Calientes',
                'sku' => 'BEB-CHA-007',
                'is_active' => true,
            ],
            [
                'name' => 'Muffin de Arándanos',
                'description' => 'Muffin esponjoso con arándanos frescos, horneado cada mañana. Perfecto para el desayuno o merienda.',
                'price' => 38.00,
                'stock' => 12,
                'category' => 'Panadería',
                'sku' => 'PAN-MUF-008',
                'is_active' => true,
            ],
        ];

        foreach ($products as $productData) {
            Product::create(array_merge($productData, ['user_id' => $user->id]));
        }
    }
}
