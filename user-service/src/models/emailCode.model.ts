import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document} from 'mongoose';

@Schema({collection: "emailCodes"})
export class EmailCode extends Document {
  @Prop({unique: true})
  userId: string;

  @Prop()
  code: string;

  @Prop()
  expiresAt: Date;
}

export const EmailCodeSchema = SchemaFactory.createForClass(EmailCode);