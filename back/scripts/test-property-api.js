async function testPropertyAPI() {
  const API_URL = 'http://localhost:5000/api';
  
  try {
    console.log('=== Testing Property API ===\n');
    
    // Get all properties
    console.log('1. Fetching all properties...');
    const response = await fetch(`${API_URL}/properties`);
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      const properties = await response.json();
      console.log(`   Found ${properties.length} properties:`);
      properties.forEach(p => {
        console.log(`   - ${p.name} (ID: ${p.id})`);
      });
      
      if (properties.length > 0) {
        const firstProperty = properties[0];
        console.log(`\n2. Fetching details for: ${firstProperty.name}`);
        const detailResponse = await fetch(`${API_URL}/properties/${firstProperty.id}`);
        
        if (detailResponse.ok) {
          const details = await detailResponse.json();
          console.log('   Property details:');
          console.log('   ', JSON.stringify(details, null, 2));
        }
      }
    } else {
      const error = await response.text();
      console.log(`   Error: ${error}`);
    }
    
  } catch (error) {
    console.error('Fetch error:', error.message);
  }
}

testPropertyAPI();
