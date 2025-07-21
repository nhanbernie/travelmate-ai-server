import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AIController } from './ai.controller';
import { ItineraryController } from './controllers/itinerary.controller';
import { OpenRouterService } from './services/openrouter.service';
import { TravelAIService } from './services/travel-ai.service';
import { ItineraryAIService } from './services/itinerary-ai.service';
import { Itinerary, ItinerarySchema } from './schemas/itinerary.schema';
import {
  ItineraryDay,
  ItineraryDaySchema,
} from './schemas/itinerary-day.schema';
import { Activity, ActivitySchema } from './schemas/activity.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Itinerary.name, schema: ItinerarySchema },
      { name: ItineraryDay.name, schema: ItineraryDaySchema },
      { name: Activity.name, schema: ActivitySchema },
    ]),
  ],
  controllers: [AIController, ItineraryController],
  providers: [OpenRouterService, TravelAIService, ItineraryAIService],
  exports: [OpenRouterService, TravelAIService, ItineraryAIService],
})
export class AIModule {}
