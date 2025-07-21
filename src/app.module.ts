import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { AppController } from '@/app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '@/database/database.module';
import { LoggerMiddleware } from '@/middlewares/logger.middleware';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from '@/common/filters/global-exception.filter';
import configuration from '@/config/configuration';
import { UsersModule, AuthModule, HealthModule, AIModule } from '@/modules';

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
    AIModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
