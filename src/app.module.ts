import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import configuration from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './modules/health/health.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => ({
    //     type: 'postgres',
    //     host: configService.get('database.host'),
    //     port: configService.get('database.port'),
    //     username: configService.get('database.username'),
    //     password: configService.get('database.password'),
    //     database: configService.get('database.database'),
    //     entities: [__dirname + '/**/*.entity{.ts,.js}'],
    //     synchronize: process.env.NODE_ENV !== 'production',
    //   }),
    //   inject: [ConfigService],
    // }),
    // UsersModule,
    // AuthModule,
    DatabaseModule,
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
