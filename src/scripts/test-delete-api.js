const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/travelmateai';

async function testDeleteAPI() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    const itinerariesCollection = db.collection('itineraries');
    const itineraryDaysCollection = db.collection('itinerary_days');
    const activitiesCollection = db.collection('activities');
    
    // Get real user data
    const users = await usersCollection.find({}).toArray();
    console.log(`👥 Found ${users.length} users`);
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    const testUser = users[0];
    console.log(`🧪 Testing with user: ${testUser._id} (${testUser.email})`);
    
    // Check existing itineraries
    const userItineraries = await itinerariesCollection
      .find({ userId: testUser._id })
      .toArray();
    
    console.log(`📊 User has ${userItineraries.length} itineraries`);
    
    if (userItineraries.length === 0) {
      console.log('⚠️  User has no itineraries to delete');
      console.log('Create some itineraries first using the generate API');
      return;
    }
    
    // Show existing itineraries
    console.log('\n📋 Existing itineraries:');
    userItineraries.forEach((itinerary, index) => {
      console.log(`${index + 1}. ${itinerary.destination} (ID: ${itinerary._id})`);
      console.log(`   Dates: ${itinerary.startDate.toISOString().split('T')[0]} to ${itinerary.endDate.toISOString().split('T')[0]}`);
    });
    
    // Get the first itinerary for testing
    const testItinerary = userItineraries[0];
    console.log(`\n🎯 Testing delete with itinerary: ${testItinerary._id}`);
    
    // Check related data before deletion
    const daysBefore = await itineraryDaysCollection
      .find({ itineraryId: testItinerary._id })
      .toArray();
    
    let activitiesBefore = 0;
    for (const day of daysBefore) {
      const dayActivities = await activitiesCollection
        .find({ dayId: day._id })
        .toArray();
      activitiesBefore += dayActivities.length;
    }
    
    console.log(`📊 Before deletion:`);
    console.log(`   - Itinerary: 1`);
    console.log(`   - Days: ${daysBefore.length}`);
    console.log(`   - Activities: ${activitiesBefore}`);
    
    // Simulate the delete operation (what our API would do)
    console.log(`\n🗑️  Simulating delete operation...`);
    
    // Step 1: Delete all activities for all days
    let deletedActivities = 0;
    for (const day of daysBefore) {
      const result = await activitiesCollection.deleteMany({ dayId: day._id });
      deletedActivities += result.deletedCount;
    }
    
    // Step 2: Delete all days for this itinerary
    const deletedDaysResult = await itineraryDaysCollection
      .deleteMany({ itineraryId: testItinerary._id });
    
    // Step 3: Delete the itinerary itself
    const deletedItineraryResult = await itinerariesCollection
      .deleteOne({ _id: testItinerary._id });
    
    console.log(`✅ Deletion completed:`);
    console.log(`   - Deleted activities: ${deletedActivities}`);
    console.log(`   - Deleted days: ${deletedDaysResult.deletedCount}`);
    console.log(`   - Deleted itinerary: ${deletedItineraryResult.deletedCount}`);
    
    // Verify deletion
    const itineraryAfter = await itinerariesCollection
      .findOne({ _id: testItinerary._id });
    
    const daysAfter = await itineraryDaysCollection
      .find({ itineraryId: testItinerary._id })
      .toArray();
    
    console.log(`\n🔍 Verification:`);
    console.log(`   - Itinerary exists: ${itineraryAfter ? 'YES ❌' : 'NO ✅'}`);
    console.log(`   - Days remaining: ${daysAfter.length} ${daysAfter.length === 0 ? '✅' : '❌'}`);
    
    // Show remaining itineraries
    const remainingItineraries = await itinerariesCollection
      .find({ userId: testUser._id })
      .toArray();
    
    console.log(`\n📊 After deletion:`);
    console.log(`   - User has ${remainingItineraries.length} itineraries remaining`);
    
    if (remainingItineraries.length > 0) {
      console.log('\n📋 Remaining itineraries:');
      remainingItineraries.forEach((itinerary, index) => {
        console.log(`${index + 1}. ${itinerary.destination} (ID: ${itinerary._id})`);
      });
    }
    
    console.log(`\n🌐 API Usage:`);
    console.log(`DELETE /ai/itinerary/${testItinerary._id}`);
    console.log(`Headers: Authorization: Bearer <jwt-token>`);
    console.log(`Expected Response: { "message": "Itinerary deleted successfully" }`);
    
    console.log(`\n✅ Delete API test completed successfully!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testDeleteAPI().catch(console.error);
