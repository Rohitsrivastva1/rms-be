import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('sms')
  @ApiOperation({ summary: 'Send SMS notification' })
  @ApiResponse({ status: 200, description: 'SMS sent successfully' })
  async sendSMS(@Body() smsDto: any) {
    return this.notificationsService.sendSMS(smsDto);
  }

  @Post('push')
  @ApiOperation({ summary: 'Send push notification' })
  @ApiResponse({ status: 200, description: 'Push notification sent successfully' })
  async sendPushNotification(@Body() pushDto: any) {
    return this.notificationsService.sendPushNotification(pushDto);
  }
} 