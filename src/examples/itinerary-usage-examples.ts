/**
 * Itinerary AI Service Usage Examples
 *
 * This file contains examples of how to use the new structured itinerary AI services
 * in the TravelMate AI application.
 */

import { ItineraryAIService } from '@/modules/ai/services/itinerary-ai.service';
import {
  GenerateItineraryDto,
  TripType,
  ItineraryResponseDto,
} from '@/modules/ai/dto/itinerary.dto';

export class ItineraryUsageExamples {
  constructor(private readonly itineraryAIService: ItineraryAIService) {}

  /**
   * Example 1: Generate a basic itinerary
   */
  async basicItineraryExample(userId: string): Promise<ItineraryResponseDto> {
    const generateDto: GenerateItineraryDto = {
      destination: 'Tokyo, Japan',
      startDate: '2024-03-15',
      endDate: '2024-03-20',
      numberOfTravelers: 2,
      preferences: ['culture', 'food', 'technology', 'temples'],
      tripType: TripType.MID_RANGE,
      budget: '$2000-3000',
      model: 'google/gemini-2.0-flash-001',
    };

    console.log('Generating basic itinerary for Tokyo...');
    const result = await this.itineraryAIService.generateItinerary(
      userId,
      generateDto,
    );

    console.log('Generated Itinerary:');
    console.log(`- Destination: ${result.destination}`);
    console.log(`- Duration: ${result.startDate} to ${result.endDate}`);
    console.log(`- Travelers: ${result.numberOfTravelers}`);
    console.log(`- Trip Type: ${result.tripType}`);
    console.log(`- Summary: ${result.aiSummary}`);
    console.log(`- Total Days: ${result.days.length}`);
    console.log(`- Total Estimated Cost: $${result.totalEstimatedCost}`);

    return result;
  }

  /**
   * Example 2: Generate a budget trip
   */
  async budgetTripExample(userId: string): Promise<ItineraryResponseDto> {
    const generateDto: GenerateItineraryDto = {
      destination: 'Bangkok, Thailand',
      startDate: '2024-04-01',
      endDate: '2024-04-07',
      numberOfTravelers: 1,
      preferences: ['street food', 'temples', 'markets', 'budget activities'],
      tripType: TripType.BUDGET,
      budget: '$500-800',
      specialRequests:
        'Focus on free or low-cost activities, street food, and public transportation',
    };

    console.log('Generating budget trip for Bangkok...');
    const result = await this.itineraryAIService.generateItinerary(
      userId,
      generateDto,
    );

    console.log('Budget Trip Details:');
    console.log(`- Total Cost: $${result.totalEstimatedCost}`);
    console.log(
      `- Activities per day: ${result.days.map((d) => d.activities.length).join(', ')}`,
    );

    return result;
  }

  /**
   * Example 3: Generate a luxury trip
   */
  async luxuryTripExample(userId: string): Promise<ItineraryResponseDto> {
    const generateDto: GenerateItineraryDto = {
      destination: 'Paris, France',
      startDate: '2024-05-10',
      endDate: '2024-05-17',
      numberOfTravelers: 2,
      preferences: [
        'fine dining',
        'luxury shopping',
        'art museums',
        'wine tasting',
      ],
      tripType: TripType.LUXURY,
      budget: '$5000-8000',
      specialRequests:
        'Include Michelin-starred restaurants, luxury hotels, private tours, and premium experiences',
    };

    console.log('Generating luxury trip for Paris...');
    const result = await this.itineraryAIService.generateItinerary(
      userId,
      generateDto,
    );

    console.log('Luxury Trip Details:');
    console.log(`- Total Cost: $${result.totalEstimatedCost}`);
    console.log('- High-priority activities:');
    result.days.forEach((day) => {
      const highPriorityActivities = day.activities.filter(
        (a) => (a.priority || 3) <= 2,
      );
      console.log(
        `  Day ${day.dayNumber}: ${highPriorityActivities.length} must-do activities`,
      );
    });

    return result;
  }

  /**
   * Example 4: Generate a family trip
   */
  async familyTripExample(userId: string): Promise<ItineraryResponseDto> {
    const generateDto: GenerateItineraryDto = {
      destination: 'Orlando, Florida',
      startDate: '2024-06-15',
      endDate: '2024-06-22',
      numberOfTravelers: 4,
      preferences: [
        'theme parks',
        'family activities',
        'kid-friendly restaurants',
      ],
      tripType: TripType.MID_RANGE,
      budget: '$3000-4000',
      specialRequests:
        'Family with 2 children (ages 8 and 12). Include theme park tickets, family-friendly accommodations, and activities suitable for kids.',
    };

    console.log('Generating family trip for Orlando...');
    const result = await this.itineraryAIService.generateItinerary(
      userId,
      generateDto,
    );

    console.log('Family Trip Details:');
    console.log(`- Family size: ${result.numberOfTravelers} travelers`);
    console.log('- Family-friendly activities:');
    result.days.forEach((day) => {
      const familyActivities = day.activities.filter((a) =>
        (a.tags || []).some((tag) =>
          ['family', 'kids', 'children'].includes(tag.toLowerCase()),
        ),
      );
      console.log(
        `  Day ${day.dayNumber}: ${familyActivities.length} family activities`,
      );
    });

    return result;
  }

  /**
   * Example 5: Get user's saved itineraries
   */
  async getUserItinerariesExample(
    userId: string,
  ): Promise<ItineraryResponseDto[]> {
    console.log('Fetching user itineraries...');
    const itineraries =
      await this.itineraryAIService.getUserItineraries(userId);

    console.log(`Found ${itineraries.length} saved itineraries:`);
    itineraries.forEach((itinerary, index) => {
      console.log(
        `${index + 1}. ${itinerary.destination} (${itinerary.startDate} to ${itinerary.endDate})`,
      );
      console.log(
        `   - ${itinerary.days.length} days, $${itinerary.totalEstimatedCost} estimated cost`,
      );
      console.log(
        `   - Created: ${new Date(itinerary.createdAt).toLocaleDateString()}`,
      );
    });

    return itineraries;
  }

  /**
   * Example 6: Analyze itinerary structure
   */
  async analyzeItineraryStructure(
    itinerary: ItineraryResponseDto,
  ): Promise<void> {
    console.log('\n=== Itinerary Analysis ===');
    console.log(`Destination: ${itinerary.destination}`);
    console.log(`Duration: ${itinerary.days.length} days`);
    console.log(`Trip Type: ${itinerary.tripType}`);
    console.log(`Weather: ${itinerary.weatherSummary}`);
    console.log(
      `Temperature Range: ${itinerary.temperatureMin}°C - ${itinerary.temperatureMax}°C`,
    );
    console.log(`Rain Chance: ${itinerary.chanceOfRain}%`);

    console.log('\n--- Daily Breakdown ---');
    itinerary.days.forEach((day) => {
      console.log(`\nDay ${day.dayNumber} (${day.date}):`);
      console.log(`  Weather: ${day.weatherSummary}`);
      console.log(
        `  Temperature: ${day.temperatureMin}°C - ${day.temperatureMax}°C`,
      );
      console.log(`  Activities: ${day.activities.length}`);

      const categoryCounts = day.activities.reduce(
        (acc, activity) => {
          const category = activity.category || 'other';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      console.log(
        '  Categories:',
        Object.entries(categoryCounts)
          .map(([cat, count]) => `${cat}(${count})`)
          .join(', '),
      );

      const dailyCost = day.activities.reduce(
        (sum, activity) => sum + (activity.estimatedCost || 0),
        0,
      );
      console.log(`  Daily Cost: $${dailyCost}`);

      const timeRange =
        day.activities.length > 0
          ? `${day.activities[0].startTime} - ${day.activities[day.activities.length - 1].endTime}`
          : 'No activities';
      console.log(`  Time Range: ${timeRange}`);
    });

    console.log('\n--- Cost Analysis ---');
    const totalCost = itinerary.totalEstimatedCost;
    const dailyAverage = totalCost / itinerary.days.length;
    console.log(`Total Estimated Cost: $${totalCost}`);
    console.log(`Daily Average: $${dailyAverage.toFixed(2)}`);
    console.log(
      `Cost per Traveler: $${(totalCost / itinerary.numberOfTravelers).toFixed(2)}`,
    );

    console.log('\n--- Activity Categories ---');
    const allActivities = itinerary.days.flatMap((day) => day.activities);
    const categoryTotals = allActivities.reduce(
      (acc, activity) => {
        const category = activity.category || 'other';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .forEach(([category, count]) => {
        const percentage = ((count / allActivities.length) * 100).toFixed(1);
        console.log(`  ${category}: ${count} activities (${percentage}%)`);
      });

    console.log('\n--- AI Suggestions ---');
    itinerary.aiSuggestions.forEach((suggestion, index) => {
      console.log(`${index + 1}. ${suggestion}`);
    });
  }

  /**
   * Run all examples
   */
  async runAllExamples(userId: string): Promise<void> {
    console.log('=== Itinerary AI Service Examples ===\n');

    try {
      console.log('1. Basic Itinerary Example:');
      const basicItinerary = await this.basicItineraryExample(userId);
      await this.analyzeItineraryStructure(basicItinerary);
      console.log('\n');

      console.log('2. Budget Trip Example:');
      const budgetItinerary = await this.budgetTripExample(userId);
      console.log('\n');

      console.log('3. Luxury Trip Example:');
      const luxuryItinerary = await this.luxuryTripExample(userId);
      console.log('\n');

      console.log('4. Family Trip Example:');
      const familyItinerary = await this.familyTripExample(userId);
      console.log('\n');

      console.log('5. User Itineraries Example:');
      await this.getUserItinerariesExample(userId);
      console.log('\n');

      console.log('=== All examples completed successfully! ===');
    } catch (error) {
      console.error('Example failed:', error.message);
    }
  }
}
