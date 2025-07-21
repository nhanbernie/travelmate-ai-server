import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  IsEnum,
  IsDateString,
  Min,
  Max,
  ValidateNested,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TripType {
  BUDGET = 'budget',
  MID_RANGE = 'mid-range',
  LUXURY = 'luxury',
}

export enum ActivityCategory {
  SIGHTSEEING = 'sightseeing',
  DINING = 'dining',
  SHOPPING = 'shopping',
  ENTERTAINMENT = 'entertainment',
  TRANSPORT = 'transport',
  ACCOMMODATION = 'accommodation',
  OTHER = 'other',
}

export class CreateItineraryDto {
  @IsNotEmpty()
  @IsString()
  destination: string;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @IsNumber()
  @Min(1)
  @Max(50)
  numberOfTravelers: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferences?: string[];

  @IsOptional()
  @IsEnum(TripType)
  tripType?: TripType;

  @IsOptional()
  @IsString()
  budget?: string;

  @IsOptional()
  @IsString()
  specialRequests?: string;
}

export class ActivityDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsString()
  startTime: string; // Format: "HH:MM"

  @IsNotEmpty()
  @IsString()
  endTime: string; // Format: "HH:MM"

  @IsOptional()
  @IsEnum(ActivityCategory)
  category?: ActivityCategory;

  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  priority?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  bookingUrl?: string;

  @IsOptional()
  @IsString()
  contactInfo?: string;
}

export class ItineraryDayDto {
  @IsNumber()
  @Min(1)
  dayNumber: number;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  weatherSummary?: string;

  @IsOptional()
  @IsNumber()
  temperatureMin?: number;

  @IsOptional()
  @IsNumber()
  temperatureMax?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  chanceOfRain?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActivityDto)
  activities: ActivityDto[];
}

export class GenerateItineraryDto {
  @IsNotEmpty()
  @IsString()
  destination: string;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @IsNumber()
  @Min(1)
  @Max(50)
  numberOfTravelers: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferences?: string[];

  @IsOptional()
  @IsEnum(TripType)
  tripType?: TripType;

  @IsOptional()
  @IsString()
  budget?: string;

  @IsOptional()
  @IsString()
  specialRequests?: string;

  @IsOptional()
  @IsString()
  model?: string;
}

export class ItineraryResponseDto {
  itineraryId: string;
  destination: string;
  startDate: string;
  endDate: string;
  numberOfTravelers: number;
  preferences: string[];
  tripType: TripType;
  aiSummary: string;
  aiSuggestions: string[];
  weatherSummary: string;
  chanceOfRain: number;
  temperatureMin: number;
  temperatureMax: number;
  days: ItineraryDayDto[];
  totalEstimatedCost: number;
  createdAt: Date;
  updatedAt: Date;
}

export class UpdateItineraryDto {
  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  numberOfTravelers?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferences?: string[];

  @IsOptional()
  @IsEnum(TripType)
  tripType?: TripType;

  @IsOptional()
  @IsString()
  aiSummary?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aiSuggestions?: string[];
}

export class AIItineraryStructure {
  summary: string;
  suggestions: string[];
  weatherInfo: {
    summary: string;
    chanceOfRain: number;
    temperatureMin: number;
    temperatureMax: number;
  };
  days: {
    dayNumber: number;
    date: string;
    weatherSummary: string;
    temperatureMin: number;
    temperatureMax: number;
    chanceOfRain: number;
    activities: {
      title: string;
      description: string;
      location: string;
      startTime: string;
      endTime: string;
      category: ActivityCategory;
      estimatedCost: number;
      priority: number;
      tags: string[];
      notes?: string;
      bookingUrl?: string;
      contactInfo?: string;
    }[];
  }[];
  totalEstimatedCost: number;
}
