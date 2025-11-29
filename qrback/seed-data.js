const pool = require('./setup/db');

async function seedData() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🌱 Seeding database with sample data...\n');
    
    // Check if restaurant already exists
    const existingRestaurant = await client.query('SELECT id FROM restaurants LIMIT 1');
    
    if (existingRestaurant.rows.length > 0) {
      console.log('✅ Database already has data. Skipping seed.');
      await client.query('ROLLBACK');
      return;
    }
    
    // 1. Create a restaurant
    console.log('Creating restaurant...');
    const restaurantResult = await client.query(
      `INSERT INTO restaurants (name, contact_email, address) 
       VALUES ($1, $2, $3) 
       RETURNING id, name`,
      ['Grand Hotel Restaurant', 'info@grandhotel.com', '123 Main Street, City']
    );
    
    const restaurantId = restaurantResult.rows[0].id;
    const restaurantName = restaurantResult.rows[0].name;
    console.log(`✅ Created restaurant: ${restaurantName} (ID: ${restaurantId})\n`);
    
    // 2. Create tables
    console.log('Creating tables...');
    const tableNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    for (const tableNum of tableNumbers) {
      await client.query(
        `INSERT INTO tables (restaurant_id, table_number) 
         VALUES ($1, $2)`,
        [restaurantId, tableNum]
      );
    }
    console.log(`✅ Created ${tableNumbers.length} tables\n`);
    
    // 3. Create sample menu items
    console.log('Creating menu items...');
    const menuItems = [
      // Appetizers
      {
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with parmesan, croutons, and Caesar dressing',
        price: 12.99,
        category: 'appetizers',
        prep_time: 10,
        calories: 320,
        dietary_info: JSON.stringify(['vegetarian'])
      },
      {
        name: 'Bruschetta',
        description: 'Toasted bread topped with fresh tomatoes, basil, and olive oil',
        price: 9.99,
        category: 'appetizers',
        prep_time: 8,
        calories: 180,
        dietary_info: JSON.stringify(['vegan', 'vegetarian'])
      },
      {
        name: 'Buffalo Wings',
        description: 'Crispy chicken wings tossed in spicy buffalo sauce',
        price: 14.99,
        category: 'appetizers',
        prep_time: 15,
        calories: 450,
        dietary_info: JSON.stringify(['spicy'])
      },
      
      // Main Courses
      {
        name: 'Grilled Salmon',
        description: 'Fresh Atlantic salmon with seasonal vegetables and lemon butter sauce',
        price: 28.99,
        category: 'mains',
        prep_time: 20,
        calories: 450,
        dietary_info: JSON.stringify(['gluten-free'])
      },
      {
        name: 'Spicy Thai Curry',
        description: 'Coconut curry with vegetables, tofu, and jasmine rice',
        price: 22.99,
        category: 'mains',
        prep_time: 18,
        calories: 520,
        dietary_info: JSON.stringify(['vegan', 'vegetarian', 'spicy'])
      },
      {
        name: 'Ribeye Steak',
        description: 'Premium 12oz ribeye with mashed potatoes and grilled asparagus',
        price: 38.99,
        category: 'mains',
        prep_time: 25,
        calories: 680,
        dietary_info: JSON.stringify(['gluten-free'])
      },
      {
        name: 'Mushroom Risotto',
        description: 'Creamy arborio rice with wild mushrooms and parmesan',
        price: 24.99,
        category: 'mains',
        prep_time: 22,
        calories: 480,
        dietary_info: JSON.stringify(['vegetarian'])
      },
      
      // Desserts
      {
        name: 'Tiramisu',
        description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone',
        price: 8.99,
        category: 'desserts',
        prep_time: 5,
        calories: 380,
        dietary_info: JSON.stringify(['vegetarian'])
      },
      {
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with molten center, served with vanilla ice cream',
        price: 9.99,
        category: 'desserts',
        prep_time: 8,
        calories: 520,
        dietary_info: JSON.stringify(['vegetarian'])
      },
      {
        name: 'Fresh Fruit Platter',
        description: 'Seasonal fresh fruits beautifully arranged',
        price: 7.99,
        category: 'desserts',
        prep_time: 5,
        calories: 150,
        dietary_info: JSON.stringify(['vegan', 'vegetarian', 'gluten-free'])
      },
      
      // Beverages
      {
        name: 'Fresh Orange Juice',
        description: 'Freshly squeezed orange juice',
        price: 5.99,
        category: 'beverages',
        prep_time: 3,
        calories: 110,
        dietary_info: JSON.stringify(['vegan', 'vegetarian', 'gluten-free'])
      },
      {
        name: 'Cappuccino',
        description: 'Classic Italian coffee with steamed milk foam',
        price: 4.99,
        category: 'beverages',
        prep_time: 5,
        calories: 80,
        dietary_info: JSON.stringify(['vegetarian'])
      },
      {
        name: 'Mango Smoothie',
        description: 'Tropical mango blended with yogurt and honey',
        price: 6.99,
        category: 'beverages',
        prep_time: 4,
        calories: 200,
        dietary_info: JSON.stringify(['vegetarian'])
      }
    ];
    
    for (const item of menuItems) {
      await client.query(
        `INSERT INTO menu_items 
         (restaurant_id, name, description, price, category) 
         VALUES ($1, $2, $3, $4, $5)`,
        [
          restaurantId,
          item.name,
          item.description,
          item.price,
          item.category
        ]
      );
    }
    console.log(`✅ Created ${menuItems.length} menu items\n`);
    
    await client.query('COMMIT');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Database seeded successfully!\n');
    console.log('📝 Restaurant Details:');
    console.log(`   Name: ${restaurantName}`);
    console.log(`   ID: ${restaurantId}`);
    console.log(`   Tables: 1-10`);
    console.log(`   Menu Items: ${menuItems.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔗 Test the API:');
    console.log(`   GET http://localhost:3000/api/menus/${restaurantId}/1`);
    console.log('\n💡 Use this URL in your QR codes and frontend:');
    console.log(`   /food?restaurant=${restaurantId}&table=1`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
