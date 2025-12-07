import { Module } from '@nestjs/common';
import { GatewayGateway } from './gateway.gateway';
import { NotificationsModule } from '../notifications/notifications.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    NotificationsModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'rms_super_secret_key_2024_secure_jwt_token_for_restaurant_management_system',
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') || '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [GatewayGateway],
  exports: [GatewayGateway],
})
export class GatewayModule {}

