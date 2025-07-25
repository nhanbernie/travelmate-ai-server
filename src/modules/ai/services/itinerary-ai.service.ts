import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OpenRouterService } from './openrouter.service';
import { Itinerary, ItineraryDocument } from '../schemas/itinerary.schema';
import {
  ItineraryDay,
  ItineraryDayDocument,
} from '../schemas/itinerary-day.schema';
import { Activity, ActivityDocument } from '../schemas/activity.schema';
import {
  GenerateItineraryDto,
  ItineraryResponseDto,
  AIItineraryStructure,
  ActivityCategory,
  TripType,
} from '../dto/itinerary.dto';

@Injectable()
export class ItineraryAIService {
  private readonly logger = new Logger(ItineraryAIService.name);

  constructor(
    private readonly openRouterService: OpenRouterService,
    @InjectModel(Itinerary.name)
    private itineraryModel: Model<ItineraryDocument>,
    @InjectModel(ItineraryDay.name)
    private itineraryDayModel: Model<ItineraryDayDocument>,
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
  ) {}

  async generateItinerary(
    userId: string,
    generateDto: GenerateItineraryDto,
  ): Promise<ItineraryResponseDto> {
    try {
      this.logger.log(`Generating itinerary for ${generateDto.destination}`);

      // Calculate number of days
      const startDate = new Date(generateDto.startDate);
      const endDate = new Date(generateDto.endDate);
      const numberOfDays =
        Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        ) + 1;

      if (numberOfDays <= 0 || numberOfDays > 30) {
        throw new BadRequestException(
          'Invalid date range. Maximum 30 days allowed.',
        );
      }

      // Generate AI prompt
      const prompt = this.buildStructuredItineraryPrompt(
        generateDto,
        numberOfDays,
      );

      // Get AI response
      const aiResponse = await this.openRouterService.simpleTextCompletion(
        prompt,
        generateDto.model || 'google/gemini-2.0-flash-001',
        0.7,
      );

      // Parse AI response
      const aiData = this.parseAIResponse(aiResponse.content);

      // Save to database
      const savedItinerary = await this.saveItineraryToDatabase(
        userId,
        generateDto,
        aiData,
      );

      return savedItinerary;
    } catch (error) {
      this.logger.error('Failed to generate itinerary', error.stack);
      throw error;
    }
  }

  private buildStructuredItineraryPrompt(
    generateDto: GenerateItineraryDto,
    numberOfDays: number,
  ): string {
    const prompt = `You are a professional travel planner AI. Generate a detailed ${numberOfDays}-day itinerary for ${generateDto.destination}.

**IMPORTANT: You must respond with ONLY a valid JSON object in the exact format specified below. Do not include any other text, explanations, or markdown formatting.**

**Input Details:**
- Destination: ${generateDto.destination}
- Start Date: ${generateDto.startDate}
- End Date: ${generateDto.endDate}
- Number of Travelers: ${generateDto.numberOfTravelers}
- Trip Type: ${generateDto.tripType || 'mid-range'}
- Budget: ${generateDto.budget || 'Not specified'}
- Preferences: ${generateDto.preferences?.join(', ') || 'General sightseeing'}
- Special Requests: ${generateDto.specialRequests || 'None'}

**Required JSON Response Format:**
{
  "summary": "Brief 2-3 sentence overview of the trip",
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "weatherInfo": {
    "summary": "General weather description for the period",
    "chanceOfRain": 30,
    "temperatureMin": 20,
    "temperatureMax": 28
  },
  "days": [
    {
      "dayNumber": 1,
      "date": "2024-01-01",
      "weatherSummary": "Sunny with light clouds",
      "temperatureMin": 22,
      "temperatureMax": 28,
      "chanceOfRain": 10,
      "activities": [
        {
          "title": "Activity Name",
          "description": "Detailed description of the activity",
          "location": "Specific address or area",
          "startTime": "09:00",
          "endTime": "11:00",
          "category": "sightseeing",
          "estimatedCost": 25,
          "priority": 1,
          "tags": ["cultural", "historic"],
          "notes": "Optional tips or notes",
          "bookingUrl": "https://example.com/booking",
          "contactInfo": "+1234567890"
        }
      ]
    }
  ],
  "totalEstimatedCost": 500
}

**Activity Categories (use only these):**
- "sightseeing"
- "dining" 
- "shopping"
- "entertainment"
- "transport"
- "accommodation"
- "other"

**Guidelines:**
1. Include 2-6 activities per day
2. Consider realistic timing and travel between locations
3. Include meals (breakfast, lunch, dinner) as dining activities
4. Add transport activities for longer distances
5. Provide realistic cost estimates in USD or VND
6. Priority: 1=must-do, 2=recommended, 3=optional, 4=if-time-permits, 5=backup
7. Include practical information like booking URLs and contact info when relevant
8. Consider the trip type (budget/mid-range/luxury) for activity selection and costs
9. Weather should be realistic for the destination and season
10. Each day should have a logical flow and realistic schedule

Generate the JSON response now:`;

    return prompt;
  }

  private parseAIResponse(content: string): AIItineraryStructure {
    try {
      // Clean the response - remove any markdown formatting or extra text
      let cleanContent = content.trim();

      // Find JSON object boundaries
      const jsonStart = cleanContent.indexOf('{');
      const jsonEnd = cleanContent.lastIndexOf('}') + 1;

      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('No JSON object found in AI response');
      }

      cleanContent = cleanContent.substring(jsonStart, jsonEnd);

      const parsed = JSON.parse(cleanContent);

      // Validate required fields
      if (!parsed.summary || !parsed.days || !Array.isArray(parsed.days)) {
        throw new Error('Invalid AI response structure');
      }

      return parsed as AIItineraryStructure;
    } catch (error) {
      this.logger.error('Failed to parse AI response', error.stack);
      this.logger.error('AI Response content:', content);
      throw new BadRequestException(
        'Failed to parse AI response. Please try again.',
      );
    }
  }

  private async saveItineraryToDatabase(
    userId: string,
    generateDto: GenerateItineraryDto,
    aiData: AIItineraryStructure,
  ): Promise<ItineraryResponseDto> {
    // Create main itinerary
    const itinerary = new this.itineraryModel({
      userId: new Types.ObjectId(userId),
      destination: generateDto.destination,
      startDate: new Date(generateDto.startDate),
      endDate: new Date(generateDto.endDate),
      numberOfTravelers: generateDto.numberOfTravelers,
      preferences: generateDto.preferences || [],
      tripType: generateDto.tripType || TripType.MID_RANGE,
      aiSummary: aiData.summary,
      aiSuggestions: aiData.suggestions || [],
      chanceOfRain: aiData.weatherInfo?.chanceOfRain || 0,
      temperatureMin: aiData.weatherInfo?.temperatureMin || 20,
      temperatureMax: aiData.weatherInfo?.temperatureMax || 30,
      weatherSummary: aiData.weatherInfo?.summary || '',
    });

    const savedItinerary = await itinerary.save();

    // Create days and activities
    const days: any[] = [];
    for (const dayData of aiData.days) {
      const itineraryDay = new this.itineraryDayModel({
        itineraryId: savedItinerary._id,
        dayNumber: dayData.dayNumber,
        date: new Date(dayData.date),
        weatherSummary: dayData.weatherSummary || '',
        temperatureMin: dayData.temperatureMin || 20,
        temperatureMax: dayData.temperatureMax || 30,
        chanceOfRain: dayData.chanceOfRain || 0,
      });

      const savedDay = await itineraryDay.save();

      // Create activities for this day
      const activities: any[] = [];
      for (const activityData of dayData.activities) {
        const activity = new this.activityModel({
          dayId: savedDay._id,
          title: activityData.title,
          description: activityData.description,
          location: activityData.location,
          startTime: this.parseTimeToDate(dayData.date, activityData.startTime),
          endTime: this.parseTimeToDate(dayData.date, activityData.endTime),
          category: activityData.category || ActivityCategory.OTHER,
          estimatedCost: activityData.estimatedCost || 0,
          priority: activityData.priority || 3,
          tags: activityData.tags || [],
          notes: activityData.notes || '',
          bookingUrl: activityData.bookingUrl || '',
          contactInfo: activityData.contactInfo || '',
        });

        const savedActivity = await activity.save();
        activities.push({
          title: savedActivity.title,
          description: savedActivity.description,
          location: savedActivity.location,
          startTime: activityData.startTime,
          endTime: activityData.endTime,
          category: savedActivity.category,
          estimatedCost: savedActivity.estimatedCost,
          priority: savedActivity.priority,
          tags: savedActivity.tags,
          notes: savedActivity.notes,
          bookingUrl: savedActivity.bookingUrl,
          contactInfo: savedActivity.contactInfo,
        });
      }

      days.push({
        dayNumber: savedDay.dayNumber,
        date: dayData.date,
        weatherSummary: savedDay.weatherSummary,
        temperatureMin: savedDay.temperatureMin,
        temperatureMax: savedDay.temperatureMax,
        chanceOfRain: savedDay.chanceOfRain,
        activities,
      });
    }

    return {
      itineraryId: (savedItinerary._id as any).toString(),
      destination: savedItinerary.destination,
      startDate: generateDto.startDate,
      endDate: generateDto.endDate,
      numberOfTravelers: savedItinerary.numberOfTravelers,
      preferences: savedItinerary.preferences,
      tripType: savedItinerary.tripType as TripType,
      aiSummary: savedItinerary.aiSummary,
      aiSuggestions: savedItinerary.aiSuggestions,
      weatherSummary: savedItinerary.weatherSummary,
      chanceOfRain: savedItinerary.chanceOfRain,
      temperatureMin: savedItinerary.temperatureMin,
      temperatureMax: savedItinerary.temperatureMax,
      days,
      totalEstimatedCost: aiData.totalEstimatedCost || 0,
      createdAt: (savedItinerary as any).createdAt,
      updatedAt: (savedItinerary as any).updatedAt,
    };
  }

  private parseTimeToDate(dateStr: string, timeStr: string): Date {
    const date = new Date(dateStr);
    const [hours, minutes] = timeStr.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  async getUserItineraries(userId: string): Promise<ItineraryResponseDto[]> {
    return this.getItinerariesByUserId(userId);
  }

  /**
   * Get all itineraries for a specific user by their ID
   * @param userId The ID of the user whose itineraries to retrieve
   * @returns Array of itinerary response DTOs
   */
  async getItinerariesByUserId(
    userId: string,
  ): Promise<ItineraryResponseDto[]> {
    // Validate if userId is a valid ObjectId
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error(`Invalid userId format: ${userId}`);
    }

    // Convert string userId to ObjectId for proper querying
    const userObjectId = new Types.ObjectId(userId);
    const itineraries = await this.itineraryModel
      .find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .exec();

    // Map itineraries to response format (only basic itinerary data)
    const result: ItineraryResponseDto[] = itineraries.map((itinerary) => ({
      itineraryId: (itinerary._id as any).toString(),
      destination: itinerary.destination,
      startDate: itinerary.startDate.toISOString().split('T')[0],
      endDate: itinerary.endDate.toISOString().split('T')[0],
      numberOfTravelers: itinerary.numberOfTravelers,
      preferences: itinerary.preferences || [],
      tripType: itinerary.tripType as TripType,
      aiSummary: itinerary.aiSummary || '',
      aiSuggestions: itinerary.aiSuggestions || [],
      weatherSummary: itinerary.weatherSummary || '',
      chanceOfRain: itinerary.chanceOfRain || 0,
      temperatureMin: itinerary.temperatureMin || 20,
      temperatureMax: itinerary.temperatureMax || 30,
      days: [], // Empty array since we're not loading days
      totalEstimatedCost: 0, // Set to 0 since we're not calculating from activities
      createdAt: (itinerary as any).createdAt,
      updatedAt: (itinerary as any).updatedAt,
    }));

    return result;
  }

  /**
   * Get a single itinerary with full details (including days and activities)
   * @param itineraryId The ID of the itinerary to retrieve
   * @param userId The ID of the user (for authorization)
   * @returns Full itinerary details with days and activities
   */
  async getItineraryById(
    itineraryId: string,
    userId: string,
  ): Promise<ItineraryResponseDto> {
    // Validate if itineraryId is a valid ObjectId
    if (!Types.ObjectId.isValid(itineraryId)) {
      throw new Error(`Invalid itineraryId format: ${itineraryId}`);
    }

    // Validate if userId is a valid ObjectId
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error(`Invalid userId format: ${userId}`);
    }

    const itineraryObjectId = new Types.ObjectId(itineraryId);
    const userObjectId = new Types.ObjectId(userId);

    // Find the itinerary and check ownership
    const itinerary = await this.itineraryModel
      .findOne({ _id: itineraryObjectId, userId: userObjectId })
      .exec();

    if (!itinerary) {
      throw new Error(
        'Itinerary not found or you do not have permission to access it',
      );
    }

    // Get full days and activities data
    const days = await this.getItineraryDays(itineraryId);

    // Calculate total cost from activities
    const totalEstimatedCost = days.reduce(
      (total: number, day: any) =>
        total +
        day.activities.reduce(
          (dayTotal: number, activity: any) =>
            dayTotal + (activity.estimatedCost || 0),
          0,
        ),
      0,
    );

    return {
      itineraryId: (itinerary._id as any).toString(),
      destination: itinerary.destination,
      startDate: itinerary.startDate.toISOString().split('T')[0],
      endDate: itinerary.endDate.toISOString().split('T')[0],
      numberOfTravelers: itinerary.numberOfTravelers,
      preferences: itinerary.preferences || [],
      tripType: itinerary.tripType as TripType,
      aiSummary: itinerary.aiSummary || '',
      aiSuggestions: itinerary.aiSuggestions || [],
      weatherSummary: itinerary.weatherSummary || '',
      chanceOfRain: itinerary.chanceOfRain || 0,
      temperatureMin: itinerary.temperatureMin || 20,
      temperatureMax: itinerary.temperatureMax || 30,
      days,
      totalEstimatedCost,
      createdAt: (itinerary as any).createdAt,
      updatedAt: (itinerary as any).updatedAt,
    };
  }

  /**
   * Delete an itinerary and all related data (days and activities)
   * @param itineraryId The ID of the itinerary to delete
   * @param userId The ID of the user (for authorization)
   * @returns Success message
   */
  async deleteItinerary(
    itineraryId: string,
    userId: string,
  ): Promise<{ message: string }> {
    // Validate if itineraryId is a valid ObjectId
    if (!Types.ObjectId.isValid(itineraryId)) {
      throw new Error(`Invalid itineraryId format: ${itineraryId}`);
    }

    // Validate if userId is a valid ObjectId
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error(`Invalid userId format: ${userId}`);
    }

    const itineraryObjectId = new Types.ObjectId(itineraryId);
    const userObjectId = new Types.ObjectId(userId);

    // Check if itinerary exists and belongs to the user
    const itinerary = await this.itineraryModel
      .findOne({ _id: itineraryObjectId, userId: userObjectId })
      .exec();

    if (!itinerary) {
      throw new Error(
        'Itinerary not found or you do not have permission to delete it',
      );
    }

    // Get all days for this itinerary
    const days = await this.itineraryDayModel
      .find({ itineraryId: itineraryObjectId })
      .exec();

    // Delete all activities for all days
    for (const day of days) {
      await this.activityModel.deleteMany({ dayId: day._id }).exec();
    }

    // Delete all days for this itinerary
    await this.itineraryDayModel
      .deleteMany({ itineraryId: itineraryObjectId })
      .exec();

    // Delete the itinerary itself
    await this.itineraryModel.deleteOne({ _id: itineraryObjectId }).exec();

    return { message: 'Itinerary deleted successfully' };
  }

  private async getItineraryDays(itineraryId: string) {
    // Convert string itineraryId to ObjectId for proper querying
    const itineraryObjectId = new Types.ObjectId(itineraryId);
    const days = await this.itineraryDayModel
      .find({ itineraryId: itineraryObjectId })
      .sort({ dayNumber: 1 })
      .exec();

    const result: any[] = [];
    for (const day of days) {
      const activities = await this.activityModel
        .find({ dayId: day._id })
        .sort({ startTime: 1 })
        .exec();

      result.push({
        dayNumber: day.dayNumber,
        date: day.date.toISOString().split('T')[0],
        weatherSummary: day.weatherSummary,
        temperatureMin: day.temperatureMin,
        temperatureMax: day.temperatureMax,
        chanceOfRain: day.chanceOfRain,
        activities: activities.map((activity) => ({
          title: activity.title,
          description: activity.description,
          location: activity.location,
          startTime: activity.startTime.toTimeString().slice(0, 5),
          endTime: activity.endTime.toTimeString().slice(0, 5),
          category: activity.category,
          estimatedCost: activity.estimatedCost,
          priority: activity.priority,
          tags: activity.tags,
          notes: activity.notes,
          bookingUrl: activity.bookingUrl,
          contactInfo: activity.contactInfo,
        })),
      });
    }

    return result;
  }
}
