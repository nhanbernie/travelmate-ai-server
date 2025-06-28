import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
