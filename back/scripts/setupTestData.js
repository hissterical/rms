import { TestDataHelper } from '../helpers/testDataHelper.js';
import { testPool } from '../setup.js';
import dotenv from 'dotenv';

// Load test environment
dotenv.config({ path: '.env.test' });

async function setupTestData() {
    try {
        console.log('🧪 Setting up test data...');

        // Ensure we're in test mode
        if (process.env.NODE_ENV !== 'test') {
            console.error('❌ This script must run with NODE_ENV=test');
            process.exit(1);
        }

        // Clean existing data
        console.log('🧹 Cleaning existing test data...');
        await TestDataHelper.cleanAll();

        // Ensure roles exist
        console.log('👥 Setting up roles and permissions...');
        await TestDataHelper.ensureRolesExist();

        // Create sample test users for manual testing
        console.log('👤 Creating sample users...');

        const superAdmin = await TestDataHelper.createUser({
            firstName: 'Super',
            lastName: 'Admin',
            email: 'superadmin@test.com',
            roleName: 'super_admin',
            password: 'SuperAdmin123!'
        });

        const propertyOwner = await TestDataHelper.createUser({
            firstName: 'Property',
            lastName: 'Owner',
            email: 'owner@test.com',
            roleName: 'property_owner',
            password: 'PropertyOwner123!'
        });

        const hotelManager = await TestDataHelper.createUser({
            firstName: 'Hotel',
            lastName: 'Manager',
            email: 'manager@test.com',
            roleName: 'hotel_manager',
            password: 'HotelManager123!'
        });

        const frontDesk = await TestDataHelper.createUser({
            firstName: 'Front',
            lastName: 'Desk',
            email: 'frontdesk@test.com',
            roleName: 'front_desk',
            password: 'FrontDesk123!'
        });

        const housekeeping = await TestDataHelper.createUser({
            firstName: 'House',
            lastName: 'Keeping',
            email: 'housekeeping@test.com',
            roleName: 'housekeeping',
            password: 'Housekeeping123!'
        });

        const guest = await TestDataHelper.createUser({
            firstName: 'Guest',
            lastName: 'User',
            email: 'guest@test.com',
            roleName: 'guest',
            password: 'Guest123!'
        });

        // Create sample properties
        console.log('🏨 Creating sample properties...');

        const grandHotel = await TestDataHelper.createProperty({
            name: 'Grand Test Hotel',
            address: '123 Grand Avenue, Test City',
            description: 'A luxurious test hotel',
            property_type: 'Hotel'
        });

        const budgetInn = await TestDataHelper.createProperty({
            name: 'Budget Test Inn',
            address: '456 Budget Street, Test City',
            description: 'Affordable accommodation for testing',
            property_type: 'Hostel'
        });

        // Assign users to properties
        console.log('🔗 Assigning users to properties...');

        await TestDataHelper.assignUserToProperty(propertyOwner.id, grandHotel.id, 'owner');
        await TestDataHelper.assignUserToProperty(propertyOwner.id, budgetInn.id, 'owner');
        await TestDataHelper.assignUserToProperty(hotelManager.id, grandHotel.id, 'manager');
        await TestDataHelper.assignUserToProperty(frontDesk.id, grandHotel.id, 'staff');
        await TestDataHelper.assignUserToProperty(housekeeping.id, grandHotel.id, 'staff');

        // Create room types
        console.log('🛏️ Creating room types...');

        const standardRoom = await TestDataHelper.createRoomType(grandHotel.id, {
            room_type_name: 'Standard Room',
            description: 'Comfortable standard room with modern amenities',
            capacity: 2,
            price: 99.99
        });

        const deluxeRoom = await TestDataHelper.createRoomType(grandHotel.id, {
            room_type_name: 'Deluxe Room',
            description: 'Spacious deluxe room with premium features',
            capacity: 3,
            price: 149.99
        });

        const suiteRoom = await TestDataHelper.createRoomType(grandHotel.id, {
            room_type_name: 'Executive Suite',
            description: 'Luxurious suite with separate living area',
            capacity: 4,
            price: 299.99
        });

        const budgetRoom = await TestDataHelper.createRoomType(budgetInn.id, {
            room_type_name: 'Budget Room',
            description: 'Clean and comfortable budget accommodation',
            capacity: 2,
            price: 49.99
        });

        // Create rooms
        console.log('🚪 Creating rooms...');

        // Grand Hotel rooms
        for (let floor = 1; floor <= 3; floor++) {
            for (let room = 1; room <= 10; room++) {
                const roomNumber = `${floor}${room.toString().padStart(2, '0')}`;
                let roomTypeId = standardRoom.id;

                // Assign different room types
                if (room >= 9) roomTypeId = suiteRoom.id;
                else if (room >= 7) roomTypeId = deluxeRoom.id;

                await TestDataHelper.createRoom(grandHotel.id, roomTypeId, {
                    room_number: roomNumber,
                    floor: floor,
                    status: 'available'
                });
            }
        }

        // Budget Inn rooms
        for (let room = 1; room <= 20; room++) {
            await TestDataHelper.createRoom(budgetInn.id, budgetRoom.id, {
                room_number: room.toString(),
                floor: Math.ceil(room / 10),
                status: 'available'
            });
        }

        console.log('✅ Test data setup completed successfully!');
        console.log('');
        console.log('🔑 Test User Credentials:');
        console.log(`Super Admin: superadmin@test.com / SuperAdmin123!`);
        console.log(`Property Owner: owner@test.com / PropertyOwner123!`);
        console.log(`Hotel Manager: manager@test.com / HotelManager123!`);
        console.log(`Front Desk: frontdesk@test.com / FrontDesk123!`);
        console.log(`Housekeeping: housekeeping@test.com / Housekeeping123!`);
        console.log(`Guest: guest@test.com / Guest123!`);
        console.log('');
        console.log('🏨 Test Properties:');
        console.log(`Grand Test Hotel: ${grandHotel.id}`);
        console.log(`Budget Test Inn: ${budgetInn.id}`);
        console.log('');
        console.log('📊 Statistics:');
        console.log(`Users created: 6`);
        console.log(`Properties created: 2`);
        console.log(`Room types created: 4`);
        console.log(`Rooms created: 50`);

    } catch (error) {
        console.error('❌ Test data setup failed:', error);
        throw error;
    } finally {
        await testPool.end();
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    setupTestData()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

export default setupTestData;