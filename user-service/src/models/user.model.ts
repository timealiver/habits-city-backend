import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
}

export const UserSchema = SchemaFactory.createForClass(User);