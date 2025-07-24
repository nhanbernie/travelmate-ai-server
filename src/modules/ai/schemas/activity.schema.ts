import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ActivityDocument = Activity & Document;

@Schema({
  timestamps: true,
  collection: 'activities',
})
export class Activity {
  @Prop({ type: Types.ObjectId, auto: true })
  activityId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ItineraryDay', required: true })
  dayId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({ 
    type: String, 
    enum: ['sightseeing', 'dining', 'shopping', 'entertainment', 'transport', 'accommodation', 'other'],
    default: 'other'
  })
  category: string;

  @Prop({ default: 0 })
  estimatedCost: number;

  @Prop({ default: 1 })
  priority: number;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  notes: string;

  @Prop()
  bookingUrl: string;

  @Prop()
  contactInfo: string;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);

// Indexes
ActivitySchema.index({ dayId: 1, startTime: 1 });
ActivitySchema.index({ category: 1 });
ActivitySchema.index({ location: 1 });
