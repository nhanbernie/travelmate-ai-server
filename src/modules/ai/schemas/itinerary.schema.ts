import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ItineraryDocument = Itinerary & Document;

@Schema({
  timestamps: true,
  collection: 'itineraries',
})
export class Itinerary {
  @Prop({ type: Types.ObjectId, auto: true })
  itineraryId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  destination: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true, min: 1, max: 50 })
  numberOfTravelers: number;

  @Prop({ type: [String], default: [] })
  preferences: string[];

  @Prop({ 
    type: String, 
    enum: ['budget', 'mid-range', 'luxury'], 
    default: 'mid-range' 
  })
  tripType: string;

  @Prop()
  aiSummary: string;

  @Prop({ type: [String], default: [] })
  aiSuggestions: string[];

  @Prop({ default: 0 })
  chanceOfRain: number;

  @Prop({ default: 20 })
  temperatureMin: number;

  @Prop({ default: 30 })
  temperatureMax: number;

  @Prop()
  weatherSummary: string;
}

export const ItinerarySchema = SchemaFactory.createForClass(Itinerary);

// Indexes
ItinerarySchema.index({ userId: 1, createdAt: -1 });
ItinerarySchema.index({ destination: 1 });
ItinerarySchema.index({ startDate: 1, endDate: 1 });
