import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationStatus } from '../common/entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async sendSMS(smsDto: any) {
    const { to, message, template, restaurantId } = smsDto;

    // Mock SMS sending
    const notification = this.notificationRepository.create({
      type: NotificationType.SYSTEM_ALERT,
      title: 'SMS Notification',
      message,
      recipientPhone: to,
      status: NotificationStatus.SENT,
      restaurantId,
      sentAt: new Date()
    });

    await this.notificationRepository.save(notification);

    return {
      message: 'SMS sent successfully',
      to,
      template
    };
  }

  async sendPushNotification(pushDto: any) {
    const { tokens, title, body, data, restaurantId } = pushDto;

    // Mock push notification sending
    const notification = this.notificationRepository.create({
      type: NotificationType.SYSTEM_ALERT,
      title,
      message: body,
      deviceToken: tokens.join(','),
      status: NotificationStatus.SENT,
      metadata: data,
      restaurantId,
      sentAt: new Date()
    });

    await this.notificationRepository.save(notification);

    return {
      message: 'Push notification sent successfully',
      tokens: tokens.length,
      title
    };
  }

  async sendOrderNotification(orderId: number, type: NotificationType, restaurantId: number) {
    const notification = this.notificationRepository.create({
      type,
      title: 'Order Update',
      message: `Order ${orderId} status updated`,
      status: NotificationStatus.PENDING,
      restaurantId,
      metadata: { orderId }
    });

    return this.notificationRepository.save(notification);
  }
} 