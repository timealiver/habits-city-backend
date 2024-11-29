import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, model } from 'mongoose';

@Schema({ collection: 'user_stats' })
export class UserStats extends Document {
  @Prop()
  userId: string;

  @Prop()
  date: Date;

  @Prop()
  followersAmount: number;

  @Prop()
  followingAmount: number;

  @Prop()
  friendsAmount: number;

  @Prop()
  lastUpdated: Date;
}

export const UserStatsSchema = SchemaFactory.createForClass(UserStats);
