import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [UserModule,
    ConfigModule.forRoot({
      isGlobal: true, // Это позволяет использовать ConfigService в любом модуле
    }),
    MongooseModule.forRoot(process.env.MONGODB_CONNECTION_STRING, {serverSelectionTimeoutMS: 5000}),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
