import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document} from 'mongoose';

@Schema({collection: "feedbacks"})
export class Friend extends Document {
  @Prop()
  username: string;

  @Prop()
  topic: string;

  @Prop()
  content: string;

  @Prop ()
  systemInfo: any;
}

export const FriendSchema = SchemaFactory.createForClass(Friend);