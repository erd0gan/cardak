const express = require('express');
const router = express.Router();
const notificationService = require('../services/notification.service');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

// Get user notifications
router.get('/', authenticateToken, async(req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 50 } = req.query;

        const notifications = await notificationService.getUserNotifications(userId, parseInt(limit));

        res.json(notifications);

    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Get unread count
router.get('/unread-count', authenticateToken, async(req, res) => {
    try {
        const userId = req.user.id;
        const count = await notificationService.getUnreadCount(userId);

        res.json({ count });

    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ error: 'Failed to fetch unread count' });
    }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async(req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notification = await notificationService.markAsRead(id, userId);

        res.json(notification);

    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});

// Mark all as read
router.put('/read/all', authenticateToken, async(req, res) => {
    try {
        const userId = req.user.id;

        await notificationService.markAllAsRead(userId);

        res.json({ success: true, message: 'All notifications marked as read' });

    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
});

// Send notification (Admin only)
router.post('/send', authenticateToken, isAdmin, async(req, res) => {
    try {
        const { userIds, title, body, type, priority, data } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ error: 'User IDs are required' });
        }

        if (!title || !body) {
            return res.status(400).json({ error: 'Title and body are required' });
        }

        const notifications = await notificationService.sendBulkNotifications(
            userIds,
            title,
            body,
            type || 'general',
            priority || 'medium',
            data || {}
        );

        res.json({
            success: true,
            count: notifications.length,
            notifications
        });

    } catch (error) {
        console.error('Send notification error:', error);
        res.status(500).json({ error: 'Failed to send notifications' });
    }
});

// Schedule notification (Admin only)
router.post('/schedule', authenticateToken, isAdmin, async(req, res) => {
    try {
        const { userIds, title, body, scheduledFor, type, data } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ error: 'User IDs are required' });
        }

        if (!title || !body || !scheduledFor) {
            return res.status(400).json({ error: 'Title, body, and scheduled time are required' });
        }

        const notifications = await Promise.all(
            userIds.map(userId =>
                notificationService.scheduleNotification(
                    userId,
                    title,
                    body,
                    new Date(scheduledFor),
                    type || 'general',
                    data || {}
                )
            )
        );

        res.json({
            success: true,
            count: notifications.length,
            notifications
        });

    } catch (error) {
        console.error('Schedule notification error:', error);
        res.status(500).json({ error: 'Failed to schedule notifications' });
    }
});

// Trigger payment reminders manually (Admin only)
router.post('/payment-reminders', authenticateToken, isAdmin, async(req, res) => {
    try {
        const notifications = await notificationService.sendPaymentReminders();

        res.json({
            success: true,
            count: notifications.length,
            message: `Sent ${notifications.length} payment reminders`
        });

    } catch (error) {
        console.error('Payment reminders error:', error);
        res.status(500).json({ error: 'Failed to send payment reminders' });
    }
});

module.exports = router;