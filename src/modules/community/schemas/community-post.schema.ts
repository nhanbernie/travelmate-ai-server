import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum Visibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  FRIENDS_ONLY = 'FRIENDS_ONLY',
}

@Schema({ timestamps: true })
export class CommunityPost extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Itinerary', required: true })
  itineraryId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: false, maxlength: 500 })
  caption?: string;

  @Prop({ 
    type: String, 
    enum: Object.values(Visibility), 
    default: Visibility.PUBLIC 
  })
  visibility: Visibility;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const CommunityPostSchema = SchemaFactory.createForClass(CommunityPost);

// Add indexes for better performance
CommunityPostSchema.index({ userId: 1, createdAt: -1 });
CommunityPostSchema.index({ visibility: 1, createdAt: -1 });
CommunityPostSchema.index({ itineraryId: 1 });
