import { testPool } from './setup.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// Test data utilities
export class TestDataHelper {
    // Create test roles (should already exist from migration)
    static async ensureRolesExist() {
        const roles = [
            { name: 'super_admin', display_name: 'Super Administrator', description: 'Full system access' },
            { name: 'property_owner', display_name: 'Property Owner', description: 'Property management' },
            { name: 'hotel_manager', display_name: 'Hotel Manager', description: 'Property operations' },
            { name: 'front_desk', display_name: 'Front Desk Staff', description: 'Guest services' },
            { name: 'housekeeping', display_name: 'Housekeeping Staff', description: 'Room maintenance' },
            { name: 'guest', display_name: 'Guest', description: 'Hotel guest' }
        ];

        for (const role of roles) {
            await testPool.query(
                `INSERT INTO roles (id, name, display_name, description) 
         VALUES (uuid_generate_v4(), $1, $2, $3) 
         ON CONFLICT (name) DO NOTHING`,
                [role.name, role.display_name, role.description]
            );
        }
    }

    // Get role ID by name
    static async getRoleId(roleName) {
        const result = await testPool.query('SELECT id FROM roles WHERE name = $1', [roleName]);
        return result.rows[0]?.id;
    }

    // Create test user
    static async createUser(userData = {}) {
        const defaultUser = {
            id: uuidv4(),
            firstName: 'Test',
            lastName: 'User',
            email: `test.${Date.now()}@example.com`,
            phone: '+1234567890',
            password: 'testpassword123',
            roleName: 'guest',
            isActive: true,
            emailVerified: true
        };

        const user = { ...defaultUser, ...userData };
        const roleId = await this.getRoleId(user.roleName);
        const hashedPassword = await bcrypt.hash(user.password, 12);

        const query = `
      INSERT INTO users (
        id, first_name, last_name, email, phone, password_hash,
        role_id, is_active, email_verified, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *
    `;

        const result = await testPool.query(query, [
            user.id,
            user.firstName,
            user.lastName,
            user.email,
            user.phone,
            hashedPassword,
            roleId,
            user.isActive,
            user.emailVerified
        ]);

        return { ...result.rows[0], plainPassword: user.password };
    }

    // Create test property
    static async createProperty(propertyData = {}) {
        const defaultProperty = {
            id: uuidv4(),
            name: `Test Property ${Date.now()}`,
            address: '123 Test Street, Test City',
            description: 'A test property',
            property_type: 'Hotel'
        };

        const property = { ...defaultProperty, ...propertyData };

        const query = `
      INSERT INTO properties (id, name, address, description, property_type, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;

        const result = await testPool.query(query, [
            property.id,
            property.name,
            property.address,
            property.description,
            property.property_type
        ]);

        return result.rows[0];
    }

    // Create test room type
    static async createRoomType(propertyId, roomTypeData = {}) {
        const defaultRoomType = {
            id: uuidv4(),
            room_type_name: 'Standard Room',
            description: 'A comfortable standard room',
            capacity: 2,
            price: 99.99
        };

        const roomType = { ...defaultRoomType, ...roomTypeData };

        const query = `
      INSERT INTO room_types (id, property_id, room_type_name, description, capacity, price)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

        const result = await testPool.query(query, [
            roomType.id,
            propertyId,
            roomType.room_type_name,
            roomType.description,
            roomType.capacity,
            roomType.price
        ]);

        return result.rows[0];
    }

    // Create test room
    static async createRoom(propertyId, roomTypeId = null, roomData = {}) {
        const defaultRoom = {
            id: uuidv4(),
            room_number: `${Math.floor(Math.random() * 900) + 100}`,
            floor: 1,
            status: 'available'
        };

        const room = { ...defaultRoom, ...roomData };

        const query = `
      INSERT INTO rooms (id, property_id, room_type_id, room_number, floor, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

        const result = await testPool.query(query, [
            room.id,
            propertyId,
            roomTypeId,
            room.room_number,
            room.floor,
            room.status
        ]);

        return result.rows[0];
    }

    // Assign user to property
    static async assignUserToProperty(userId, propertyId, roleType = 'staff') {
        const query = `
      INSERT INTO user_properties (user_id, property_id, role_type, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;

        const result = await testPool.query(query, [userId, propertyId, roleType]);
        return result.rows[0];
    }

    // Create complete test scenario (property owner with property, manager, and rooms)
    static async createTestScenario() {
        await this.ensureRolesExist();

        // Create property owner
        const propertyOwner = await this.createUser({
            firstName: 'Property',
            lastName: 'Owner',
            email: 'owner@test.com',
            roleName: 'property_owner'
        });

        // Create hotel manager
        const hotelManager = await this.createUser({
            firstName: 'Hotel',
            lastName: 'Manager',
            email: 'manager@test.com',
            roleName: 'hotel_manager'
        });

        // Create front desk staff
        const frontDeskStaff = await this.createUser({
            firstName: 'Front',
            lastName: 'Desk',
            email: 'frontdesk@test.com',
            roleName: 'front_desk'
        });

        // Create guest
        const guest = await this.createUser({
            firstName: 'Guest',
            lastName: 'User',
            email: 'guest@test.com',
            roleName: 'guest'
        });

        // Create property
        const property = await this.createProperty({
            name: 'Test Grand Hotel'
        });

        // Create room type
        const roomType = await this.createRoomType(property.id);

        // Create rooms
        const room1 = await this.createRoom(property.id, roomType.id, { room_number: '101' });
        const room2 = await this.createRoom(property.id, roomType.id, { room_number: '102' });

        // Assign users to property
        await this.assignUserToProperty(propertyOwner.id, property.id, 'owner');
        await this.assignUserToProperty(hotelManager.id, property.id, 'manager');
        await this.assignUserToProperty(frontDeskStaff.id, property.id, 'staff');

        return {
            users: {
                propertyOwner,
                hotelManager,
                frontDeskStaff,
                guest
            },
            property,
            roomType,
            rooms: [room1, room2]
        };
    }

    // Clean all test data
    static async cleanAll() {
        const tables = [
            'user_properties',
            'bookings',
            'rooms',
            'room_types',
            'users',
            'properties'
        ];

        for (const table of tables) {
            await testPool.query(`DELETE FROM ${table}`);
        }
    }
}

// JWT Test Helpers
export class JWTTestHelper {
    static async generateTokenForUser(user) {
        // Import AuthService dynamically to avoid circular dependencies
        const { default: AuthService } = await import('../services/authService.js');
        return AuthService.generateToken({ userId: user.id });
    }

    static async generateTokensForScenario(scenario) {
        const tokens = {};

        for (const [role, user] of Object.entries(scenario.users)) {
            tokens[role] = await this.generateTokenForUser(user);
        }

        return tokens;
    }
}

// API Test Helpers
export class APITestHelper {
    static getAuthHeaders(token) {
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    static async makeAuthenticatedRequest(request, method, url, token, data = null) {
        const headers = this.getAuthHeaders(token);

        let req = request[method](url).set(headers);

        if (data) {
            req = req.send(data);
        }

        return req;
    }
}

export default TestDataHelper;