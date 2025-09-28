import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Create test database pool
const testPool = new Pool({
    user: process.env.PG_USER || 'postgres',
    host: process.env.PG_HOST || 'localhost',
    database: process.env.PG_TEST_DATABASE || 'hotel_management_test',
    password: process.env.PG_PASSWORD || 'password',
    port: Number(process.env.PG_PORT) || 5432,
});

// Global test setup
beforeAll(async () => {
    console.log('🧪 Setting up test environment...');

    // Ensure we're running in test mode
    if (process.env.NODE_ENV !== 'test') {
        throw new Error('Tests must run with NODE_ENV=test');
    }

    try {
        await testPool.connect();
        console.log('✅ Connected to test database');
    } catch (error) {
        console.error('❌ Failed to connect to test database:', error.message);
        throw error;
    }
});

// Clean up after each test
afterEach(async () => {
    // Clean up test data but keep schema
    const tables = [
        'user_properties',
        'role_permissions',
        'bookings',
        'rooms',
        'room_types',
        'users',
        'properties'
    ];

    for (const table of tables) {
        try {
            await testPool.query(`DELETE FROM ${table}`);
        } catch (error) {
            // Table might not exist, that's OK
        }
    }
});

// Global test teardown
afterAll(async () => {
    console.log('🧹 Cleaning up test environment...');
    await testPool.end();
});

// Export test pool for use in tests
export { testPool };

// Set longer timeout for database operations
jest.setTimeout(30000);