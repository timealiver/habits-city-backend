import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema} from 'mongoose';

@Schema({collection: "habits"})
export class Habit extends Document {
  @Prop({ unique: true, sparse: true })
  name: string;
}

export const UserSchema = SchemaFactory.createForClass(Habit);