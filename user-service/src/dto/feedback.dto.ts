import { Expose } from 'class-transformer';

export class FeedbackDto{
  @Expose()
  username: string;

  @Expose()
  topic: string;

  @Expose()
  content: string;

  @Expose()
  systemInfo: Object;
}