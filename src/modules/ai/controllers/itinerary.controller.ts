import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Param,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ItineraryAIService } from '../services/itinerary-ai.service';
import {
  GenerateItineraryDto,
  ItineraryResponseDto,
} from '../dto/itinerary.dto';

@Controller('ai/itinerary')
@UseGuards(JwtAuthGuard)
export class ItineraryController {
  constructor(private readonly itineraryAIService: ItineraryAIService) {}

  @Post('generate')
  async generateItinerary(
    @Request() req,
    @Body() generateDto: GenerateItineraryDto,
  ): Promise<ItineraryResponseDto> {
    try {
      const userId = req.user.id;

      // Validate dates
      const startDate = new Date(generateDto.startDate);
      const endDate = new Date(generateDto.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // For testing purposes, allow any reasonable date
      // In production, you might want to restrict to future dates only
      const minDate = new Date('2020-01-01'); // Very flexible for testing

      if (startDate < minDate) {
        throw new BadRequestException(
          'Start date must be a valid date after 2020-01-01',
        );
      }

      if (endDate <= startDate) {
        throw new BadRequestException('End date must be after start date');
      }

      const daysDifference = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysDifference > 30) {
        throw new BadRequestException('Maximum trip duration is 30 days');
      }

      return await this.itineraryAIService.generateItinerary(
        userId,
        generateDto,
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to generate itinerary: ${error.message}`,
      );
    }
  }

  @Get('my-itineraries')
  async getUserItineraries(@Request() req): Promise<ItineraryResponseDto[]> {
    try {
      const userId = req.user.id;
      return await this.itineraryAIService.getUserItineraries(userId);
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch itineraries: ${error.message}`,
      );
    }
  }

  @Get(':itineraryId')
  async getItinerary(
    @Request() req,
    @Param('itineraryId') itineraryId: string,
  ): Promise<ItineraryResponseDto> {
    try {
      const userId = req.user.id;
      const itineraries =
        await this.itineraryAIService.getUserItineraries(userId);

      const itinerary = itineraries.find(
        (it) => it.itineraryId === itineraryId,
      );
      if (!itinerary) {
        throw new NotFoundException('Itinerary not found');
      }

      return itinerary;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to fetch itinerary: ${error.message}`,
      );
    }
  }

  @Post('quick-generate')
  async quickGenerateItinerary(
    @Request() req,
    @Body()
    quickDto: {
      destination: string;
      days: number;
      tripType?: 'budget' | 'mid-range' | 'luxury';
      preferences?: string[];
    },
  ): Promise<ItineraryResponseDto> {
    try {
      const userId = req.user.id;

      if (quickDto.days < 1 || quickDto.days > 30) {
        throw new BadRequestException('Days must be between 1 and 30');
      }

      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + 7); // Start next week

      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + quickDto.days - 1);

      const generateDto: GenerateItineraryDto = {
        destination: quickDto.destination,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        numberOfTravelers: 2,
        tripType: (quickDto.tripType as any) || 'mid-range',
        preferences: quickDto.preferences || [],
      };

      return await this.itineraryAIService.generateItinerary(
        userId,
        generateDto,
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to generate quick itinerary: ${error.message}`,
      );
    }
  }

  @Post('regenerate/:itineraryId')
  async regenerateItinerary(
    @Request() req,
    @Param('itineraryId') itineraryId: string,
    @Body()
    options?: {
      changePreferences?: string[];
      changeTripType?: 'budget' | 'mid-range' | 'luxury';
      specialRequests?: string;
    },
  ): Promise<ItineraryResponseDto> {
    try {
      const userId = req.user.id;

      // Get existing itinerary
      const existingItineraries =
        await this.itineraryAIService.getUserItineraries(userId);
      const existingItinerary = existingItineraries.find(
        (it) => it.itineraryId === itineraryId,
      );

      if (!existingItinerary) {
        throw new NotFoundException('Itinerary not found');
      }

      // Create new generation request based on existing itinerary
      const generateDto: GenerateItineraryDto = {
        destination: existingItinerary.destination,
        startDate: existingItinerary.startDate,
        endDate: existingItinerary.endDate,
        numberOfTravelers: existingItinerary.numberOfTravelers,
        tripType:
          (options?.changeTripType as any) || existingItinerary.tripType,
        preferences:
          options?.changePreferences || existingItinerary.preferences,
        specialRequests: options?.specialRequests,
      };

      return await this.itineraryAIService.generateItinerary(
        userId,
        generateDto,
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to regenerate itinerary: ${error.message}`,
      );
    }
  }

  @Get('destination/:destination/suggestions')
  async getDestinationSuggestions(
    @Param('destination') destination: string,
  ): Promise<{
    popularActivities: string[];
    bestTimeToVisit: string;
    averageCosts: {
      budget: number;
      midRange: number;
      luxury: number;
    };
    weatherInfo: string;
    culturalTips: string[];
  }> {
    // This could be enhanced with a separate AI call or cached data
    return {
      popularActivities: [
        'City walking tours',
        'Local food experiences',
        'Historical site visits',
        'Cultural performances',
        'Shopping districts',
      ],
      bestTimeToVisit: 'Spring and Fall for pleasant weather',
      averageCosts: {
        budget: 50,
        midRange: 100,
        luxury: 200,
      },
      weatherInfo: 'Varies by season, check current forecasts',
      culturalTips: [
        'Learn basic local phrases',
        'Respect local customs',
        'Try traditional cuisine',
        'Dress appropriately for religious sites',
      ],
    };
  }
}
