import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({collection: "feedbacks"})
export class Feedback extends Document {
  @Prop()
  username: string;

  @Prop()
  topic: string;

  @Prop()
  content: string;

  @Prop({ type: Object })
  systemInfo: Object;

  @Prop()
  userId: string;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);