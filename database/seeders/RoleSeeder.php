<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Crear roles
        $superadminRole = Role::firstOrCreate(['name' => 'superadmin']);
        $adminRole = Role::firstOrCreate(['name' => 'admin']);

        // Crear permisos
        $permissions = [
            'view-all-businesses',
            'manage-transfer-settings',
            'manage-leads',
            'view-own-business',
            'manage-own-orders',
            'manage-own-sales'
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Asignar permisos al superadmin
        $superadminRole->syncPermissions([
            'view-all-businesses',
            'manage-transfer-settings',
            'manage-leads',
            'view-own-business',
            'manage-own-orders',
            'manage-own-sales'
        ]);

        // Asignar permisos al admin
        $adminRole->syncPermissions([
            'view-own-business',
            'manage-own-orders',
            'manage-own-sales'
        ]);

        // Asignar rol superadmin al usuario ID 1
        $user = User::find(1);
        if ($user) {
            $user->assignRole('superadmin');
        }
    }
}
