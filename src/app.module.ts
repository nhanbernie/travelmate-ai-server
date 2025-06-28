import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from '@/app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '@/database/database.module';
import { LoggerMiddleware } from '@/middlewares/logger.middleware';
import configuration from '@/config/configuration';
import { UsersModule, AuthModule, HealthModule } from '@/modules'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: [`.env.${process.env.NODE_ENV!}`, '.env'],
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
