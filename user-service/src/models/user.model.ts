import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema} from 'mongoose';
import { Habit } from './habit.model';

@Schema({collection: "users"})
export class User extends Document {
  @Prop({ unique: true, sparse: true })
  username: string;

  @Prop()
  password: string;

  @Prop({ unique: true, sparse: true })
  email: string;

  @Prop({ unique: true, sparse: true })
  phone: string;

  @Prop ()
  bio: string;
  
  @Prop([String])
  roles: string[];

  @Prop()
  isOauth: boolean;

  @Prop({ unique: true, sparse: true })
  googleId: string;

  @Prop({ unique: true, sparse: true })
  yandexId: string;

  @Prop()
  avatar: string;

  @Prop()
  balance: number;

  @Prop()
  rating: number;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Habit' }] })
  habits: Habit[];
  
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  subscriptions: User[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  subscribers: User[];

  @Prop()
  isDeleted: boolean
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.pre('find', function(next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

UserSchema.pre('findOne', function(next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});