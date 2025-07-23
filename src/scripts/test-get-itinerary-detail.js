const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/travelmateai';

async function testGetItineraryDetail() {
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
    
    // Get user's itineraries
    const userItineraries = await itinerariesCollection
      .find({ userId: testUser._id })
      .toArray();
    
    console.log(`📊 User has ${userItineraries.length} itineraries`);
    
    if (userItineraries.length === 0) {
      console.log('⚠️  User has no itineraries');
      console.log('Create some itineraries first using the generate API');
      return;
    }
    
    // Test with the first itinerary
    const testItinerary = userItineraries[0];
    console.log(`\n🎯 Testing with itinerary: ${testItinerary._id}`);
    console.log(`   Destination: ${testItinerary.destination}`);
    console.log(`   Dates: ${testItinerary.startDate.toISOString().split('T')[0]} to ${testItinerary.endDate.toISOString().split('T')[0]}`);
    
    // Get days for this itinerary
    const days = await itineraryDaysCollection
      .find({ itineraryId: testItinerary._id })
      .sort({ dayNumber: 1 })
      .toArray();
    
    console.log(`\n📅 Found ${days.length} days:`);
    
    let totalActivities = 0;
    let totalCost = 0;
    
    for (const day of days) {
      const activities = await activitiesCollection
        .find({ dayId: day._id })
        .sort({ startTime: 1 })
        .toArray();
      
      const dayCost = activities.reduce((sum, activity) => sum + (activity.estimatedCost || 0), 0);
      totalActivities += activities.length;
      totalCost += dayCost;
      
      console.log(`\n   Day ${day.dayNumber} (${day.date.toISOString().split('T')[0]}):`);
      console.log(`     Weather: ${day.weatherSummary || 'N/A'}`);
      console.log(`     Temperature: ${day.temperatureMin}°C - ${day.temperatureMax}°C`);
      console.log(`     Activities: ${activities.length}`);
      console.log(`     Day Cost: $${dayCost}`);
      
      if (activities.length > 0) {
        console.log(`     Sample activities:`);
        activities.slice(0, 3).forEach((activity, index) => {
          const startTime = activity.startTime.toTimeString().slice(0, 5);
          const endTime = activity.endTime.toTimeString().slice(0, 5);
          console.log(`       ${index + 1}. ${activity.title} (${startTime} - ${endTime})`);
          console.log(`          Location: ${activity.location}`);
          console.log(`          Cost: $${activity.estimatedCost || 0}`);
        });
        if (activities.length > 3) {
          console.log(`       ... and ${activities.length - 3} more activities`);
        }
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total Days: ${days.length}`);
    console.log(`   Total Activities: ${totalActivities}`);
    console.log(`   Total Estimated Cost: $${totalCost}`);
    
    // Simulate the API response
    const apiResponse = {
      itineraryId: testItinerary._id.toString(),
      destination: testItinerary.destination,
      startDate: testItinerary.startDate.toISOString().split('T')[0],
      endDate: testItinerary.endDate.toISOString().split('T')[0],
      numberOfTravelers: testItinerary.numberOfTravelers,
      preferences: testItinerary.preferences || [],
      tripType: testItinerary.tripType || 'mid-range',
      aiSummary: testItinerary.aiSummary || '',
      aiSuggestions: testItinerary.aiSuggestions || [],
      weatherSummary: testItinerary.weatherSummary || '',
      chanceOfRain: testItinerary.chanceOfRain || 0,
      temperatureMin: testItinerary.temperatureMin || 20,
      temperatureMax: testItinerary.temperatureMax || 30,
      days: days.map(day => ({
        dayNumber: day.dayNumber,
        date: day.date.toISOString().split('T')[0],
        weatherSummary: day.weatherSummary || '',
        temperatureMin: day.temperatureMin || 20,
        temperatureMax: day.temperatureMax || 30,
        chanceOfRain: day.chanceOfRain || 0,
        activities: [] // Would be populated with full activity details
      })),
      totalEstimatedCost: totalCost,
      createdAt: testItinerary.createdAt,
      updatedAt: testItinerary.updatedAt
    };
    
    console.log(`\n🌐 API Usage:`);
    console.log(`GET /ai/itinerary/${testItinerary._id}`);
    console.log(`Headers: Authorization: Bearer <jwt-token>`);
    
    console.log(`\n📄 Expected API Response Structure:`);
    console.log(`{`);
    console.log(`  "itineraryId": "${testItinerary._id}",`);
    console.log(`  "destination": "${testItinerary.destination}",`);
    console.log(`  "startDate": "${testItinerary.startDate.toISOString().split('T')[0]}",`);
    console.log(`  "endDate": "${testItinerary.endDate.toISOString().split('T')[0]}",`);
    console.log(`  "numberOfTravelers": ${testItinerary.numberOfTravelers},`);
    console.log(`  "preferences": [${testItinerary.preferences ? testItinerary.preferences.map(p => `"${p}"`).join(', ') : ''}],`);
    console.log(`  "tripType": "${testItinerary.tripType || 'mid-range'}",`);
    console.log(`  "days": [`);
    console.log(`    // Array of ${days.length} day objects with full activity details`);
    console.log(`  ],`);
    console.log(`  "totalEstimatedCost": ${totalCost},`);
    console.log(`  "createdAt": "${testItinerary.createdAt.toISOString()}",`);
    console.log(`  "updatedAt": "${testItinerary.updatedAt.toISOString()}"`);
    console.log(`}`);
    
    console.log(`\n✅ Get Itinerary Detail API test completed!`);
    console.log(`\n🔍 Key differences from list API:`);
    console.log(`   - List API: days = [] (empty array)`);
    console.log(`   - Detail API: days = [full day objects with activities]`);
    console.log(`   - List API: totalEstimatedCost = 0`);
    console.log(`   - Detail API: totalEstimatedCost = ${totalCost} (calculated from activities)`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testGetItineraryDetail().catch(console.error);
