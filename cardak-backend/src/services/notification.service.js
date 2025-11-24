const Notification = require('../models/Notification');
const User = require('../models/User');
const Payment = require('../models/Payment');

class NotificationService {
    // Create notification
    async createNotification(userId, title, body, type = 'general', priority = 'medium', data = {}) {
        try {
            const notification = await Notification.create({
                userId,
                title,
                body,
                type,
                priority,
                data,
                isSent: false
            });

            return notification;
        } catch (error) {
            console.error('Create notification error:', error);
            throw error;
        }
    }

    // Send bulk notifications
    async sendBulkNotifications(userIds, title, body, type = 'general', priority = 'medium', data = {}) {
        try {
            const notifications = await Promise.all(
                userIds.map(userId =>
                    this.createNotification(userId, title, body, type, priority, data)
                )
            );

            return notifications;
        } catch (error) {
            console.error('Send bulk notifications error:', error);
            throw error;
        }
    }

    // Schedule notification
    async scheduleNotification(userId, title, body, scheduledFor, type = 'general', data = {}) {
        try {
            const notification = await Notification.create({
                userId,
                title,
                body,
                type,
                priority: 'medium',
                data,
                scheduledFor,
                isSent: false
            });

            return notification;
        } catch (error) {
            console.error('Schedule notification error:', error);
            throw error;
        }
    }

    // Check overdue payments and send reminders
    async sendPaymentReminders() {
        try {
            const now = new Date();
            const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

            // Find payments due in 3 days that are not paid
            const upcomingPayments = await Payment.findAll({
                where: {
                    status: 'pending',
                    dueDate: {
                        [require('sequelize').Op.lte]: threeDaysFromNow,
                        [require('sequelize').Op.gte]: now
                    }
                },
                include: [{ model: User }]
            });

            const notifications = [];
            for (const payment of upcomingPayments) {
                // Check if reminder already sent today
                const existingReminder = await Notification.findOne({
                    where: {
                        userId: payment.userId,
                        type: 'payment',
                        createdAt: {
                            [require('sequelize').Op.gte]: new Date(now.setHours(0, 0, 0, 0))
                        }
                    }
                });

                if (!existingReminder) {
                    const daysUntilDue = Math.ceil((payment.dueDate - now) / (1000 * 60 * 60 * 24));
                    const notification = await this.createNotification(
                        payment.userId,
                        '💰 Aidat Ödeme Hatırlatması',
                        `${payment.description} için ${daysUntilDue} gün içinde ödeme yapmanız gerekmektedir. Tutar: ${payment.amount} ₺`,
                        'payment',
                        'high', { paymentId: payment.id, amount: payment.amount }
                    );
                    notifications.push(notification);
                }
            }

            // Find overdue payments
            const overduePayments = await Payment.findAll({
                where: {
                    status: 'overdue'
                },
                include: [{ model: User }]
            });

            for (const payment of overduePayments) {
                // Send weekly reminder for overdue
                const lastReminder = await Notification.findOne({
                    where: {
                        userId: payment.userId,
                        type: 'payment',
                        'data.paymentId': payment.id
                    },
                    order: [
                        ['createdAt', 'DESC']
                    ]
                });

                const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                if (!lastReminder || lastReminder.createdAt < oneWeekAgo) {
                    const notification = await this.createNotification(
                        payment.userId,
                        '⚠️ Geciken Aidat Ödemesi',
                        `${payment.description} ödemesi gecikmiştir. Lütfen en kısa sürede ödeme yapınız. Tutar: ${payment.amount} ₺`,
                        'payment',
                        'critical', { paymentId: payment.id, amount: payment.amount }
                    );
                    notifications.push(notification);
                }
            }

            console.log(`✅ Sent ${notifications.length} payment reminders`);
            return notifications;

        } catch (error) {
            console.error('Send payment reminders error:', error);
            throw error;
        }
    }

    // Get user notifications
    async getUserNotifications(userId, limit = 50) {
        try {
            const notifications = await Notification.findAll({
                where: { userId },
                order: [
                    ['createdAt', 'DESC']
                ],
                limit
            });

            return notifications;
        } catch (error) {
            console.error('Get user notifications error:', error);
            throw error;
        }
    }

    // Mark notification as read
    async markAsRead(notificationId, userId) {
        try {
            const notification = await Notification.findOne({
                where: { id: notificationId, userId }
            });

            if (!notification) {
                throw new Error('Notification not found');
            }

            notification.isRead = true;
            notification.readAt = new Date();
            await notification.save();

            return notification;
        } catch (error) {
            console.error('Mark as read error:', error);
            throw error;
        }
    }

    // Mark all as read
    async markAllAsRead(userId) {
        try {
            await Notification.update({ isRead: true, readAt: new Date() }, { where: { userId, isRead: false } });

            return { success: true };
        } catch (error) {
            console.error('Mark all as read error:', error);
            throw error;
        }
    }

    // Get unread count
    async getUnreadCount(userId) {
        try {
            const count = await Notification.count({
                where: { userId, isRead: false }
            });

            return count;
        } catch (error) {
            console.error('Get unread count error:', error);
            throw error;
        }
    }
}

module.exports = new NotificationService();