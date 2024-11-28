import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document} from 'mongoose';

@Schema({collection: "friends"})
export class Friend extends Document {
  @Prop()
  userId: string;

  @Prop()
  friendId: string;

  @Prop()
  status: string;

  @Prop ()
  createdAt: Date;
  
  @Prop()
  updatedAt: Date;
}

export const FriendSchema = SchemaFactory.createForClass(Friend);