import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ItineraryDayDocument = ItineraryDay & Document;

@Schema({
  timestamps: true,
  collection: 'itinerary_days',
})
export class ItineraryDay {
  @Prop({ type: Types.ObjectId, auto: true })
  dayId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Itinerary', required: true })
  itineraryId: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  dayNumber: number;

  @Prop({ required: true })
  date: Date;

  @Prop()
  weatherSummary: string;

  @Prop({ default: 20 })
  temperatureMin: number;

  @Prop({ default: 30 })
  temperatureMax: number;

  @Prop({ default: 0 })
  chanceOfRain: number;
}

export const ItineraryDaySchema = SchemaFactory.createForClass(ItineraryDay);

// Indexes
ItineraryDaySchema.index({ itineraryId: 1, dayNumber: 1 });
ItineraryDaySchema.index({ date: 1 });
