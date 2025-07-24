const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/travelmateai';

async function testSimple() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    const itinerariesCollection = db.collection('itineraries');
    
    // Get real user data
    const users = await usersCollection.find({}).toArray();
    console.log(`👥 Found ${users.length} users`);
    
    if (users.length > 0) {
      const testUser = users[0];
      console.log(`🧪 Testing with user: ${testUser._id} (${testUser.email})`);
      
      // Test the exact query our API uses
      const userItineraries = await itinerariesCollection
        .find({ userId: testUser._id })
        .sort({ createdAt: -1 })
        .toArray();
      
      console.log(`📊 Found ${userItineraries.length} itineraries for this user`);
      
      if (userItineraries.length > 0) {
        console.log('\n📋 Itineraries:');
        userItineraries.forEach((itinerary, index) => {
          console.log(`${index + 1}. ${itinerary.destination}`);
          console.log(`   ID: ${itinerary._id}`);
          console.log(`   Dates: ${itinerary.startDate.toISOString().split('T')[0]} to ${itinerary.endDate.toISOString().split('T')[0]}`);
          console.log(`   Travelers: ${itinerary.numberOfTravelers}`);
          console.log(`   Trip Type: ${itinerary.tripType}`);
        });
        
        console.log(`\n🌐 Test API with:`);
        console.log(`GET /ai/itinerary/user/${testUser._id}/itineraries`);
        console.log(`✅ Expected: Array with ${userItineraries.length} itinerary(ies)`);
      } else {
        console.log(`\n🌐 Test API with:`);
        console.log(`GET /ai/itinerary/user/${testUser._id}/itineraries`);
        console.log(`✅ Expected: Empty array []`);
      }
    } else {
      console.log('❌ No users found in database');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testSimple().catch(console.error);
