import pool from '../config/db.js';
import AuthService from '../services/authService.js';
import dotenv from 'dotenv';

dotenv.config();

async function initializeSystem() {
    try {
        console.log('🏨 Initializing Hotel Management System RBAC...');

        // Check if super admin role exists
        const roleCheck = await pool.query('SELECT id FROM roles WHERE name = $1', ['super_admin']);

        if (roleCheck.rows.length === 0) {
            console.error('❌ RBAC system not found. Please run database migrations first:');
            console.log('   npm run migrate up');
            process.exit(1);
        }

        const superAdminRoleId = roleCheck.rows[0].id;

        // Check if any super admin exists
        const adminCheck = await pool.query(
            'SELECT id FROM users WHERE role_id = $1 AND is_active = true',
            [superAdminRoleId]
        );

        if (adminCheck.rows.length > 0) {
            console.log('✅ Super admin already exists. System initialized.');
            console.log('📧 Use existing super admin credentials to access the system.');
            process.exit(0);
        }

        // Create default super admin
        const defaultAdmin = {
            firstName: 'System',
            lastName: 'Administrator',
            email: process.env.ADMIN_EMAIL || 'admin@hotel.com',
            phone: '+1234567890',
            password: process.env.ADMIN_PASSWORD || 'AdminPass123!',
            roleId: superAdminRoleId,
            isActive: true,
            emailVerified: true
        };

        console.log('👤 Creating default super admin account...');

        const admin = await AuthService.createUser(defaultAdmin);

        console.log('✅ System initialization completed successfully!');
        console.log('');
        console.log('🔑 Default Super Admin Credentials:');
        console.log(`   Email: ${defaultAdmin.email}`);
        console.log(`   Password: ${defaultAdmin.password}`);
        console.log('');
        console.log('⚠️  IMPORTANT SECURITY NOTICE:');
        console.log('   1. Login immediately and change the default password');
        console.log('   2. Create additional admin accounts as needed');
        console.log('   3. Consider deactivating this default account after setup');
        console.log('');
        console.log('🚀 Your Hotel Management System is ready to use!');
        console.log(`   API Base URL: http://localhost:${process.env.PORT || 5000}/api`);
        console.log('   Health Check: /health');
        console.log('   Login Endpoint: /api/auth/login');
        console.log('');

    } catch (error) {
        console.error('❌ System initialization failed:', error.message);

        if (error.message.includes('already exists')) {
            console.log('💡 An admin account with this email already exists.');
            console.log('   Use the existing credentials or reset the password.');
        } else {
            console.error('   Please check your database connection and migrations.');
        }

        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run initialization
initializeSystem();