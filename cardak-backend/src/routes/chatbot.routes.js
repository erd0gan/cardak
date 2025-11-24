const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const geminiService = require('../services/gemini.service');
const { authenticateToken } = require('../middleware/auth.middleware');
const { v4: uuidv4 } = require('uuid');

// Send message to AI chatbot
router.post('/chat', authenticateToken, async(req, res) => {
    try {
        const { message, sessionId } = req.body;
        const userId = req.user.id;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get or create session ID
        const chatSessionId = sessionId || uuidv4();

        // Save user message
        const userMessage = await ChatMessage.create({
            userId,
            sessionId: chatSessionId,
            message,
            sender: 'user'
        });

        // Get user context for better AI responses
        const userContext = {
            userName: req.user.name,
            buildingBlock: req.user.buildingBlock,
            apartmentNumber: req.user.apartmentNumber
        };

        // Get AI response
        const aiResponse = await geminiService.chat(message, userContext);

        // Save AI response
        const aiMessage = await ChatMessage.create({
            userId,
            sessionId: chatSessionId,
            message: aiResponse.message,
            sender: 'ai',
            intent: aiResponse.intent,
            sentiment: aiResponse.sentiment,
            context: {
                userIntent: aiResponse.intent,
                sentiment: aiResponse.sentiment
            }
        });

        res.json({
            sessionId: chatSessionId,
            userMessage: {
                id: userMessage.id,
                message: userMessage.message,
                sender: 'user',
                createdAt: userMessage.createdAt
            },
            aiMessage: {
                id: aiMessage.id,
                message: aiMessage.message,
                sender: 'ai',
                intent: aiMessage.intent,
                sentiment: aiMessage.sentiment,
                createdAt: aiMessage.createdAt
            }
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Failed to process chat message' });
    }
});

// Get chat history
router.get('/history', authenticateToken, async(req, res) => {
    try {
        const userId = req.user.id;
        const { sessionId, limit = 50 } = req.query;

        const whereClause = { userId };
        if (sessionId) {
            whereClause.sessionId = sessionId;
        }

        const messages = await ChatMessage.findAll({
            where: whereClause,
            order: [
                ['createdAt', 'DESC']
            ],
            limit: parseInt(limit)
        });

        res.json(messages.reverse());

    } catch (error) {
        console.error('Get chat history error:', error);
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
});

// Get chat sessions
router.get('/sessions', authenticateToken, async(req, res) => {
    try {
        const userId = req.user.id;

        const sessions = await ChatMessage.findAll({
            where: { userId },
            attributes: [
                'sessionId', [require('sequelize').fn('MAX', require('sequelize').col('createdAt')), 'lastMessageAt'],
                [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'messageCount']
            ],
            group: ['sessionId'],
            order: [
                [require('sequelize').fn('MAX', require('sequelize').col('createdAt')), 'DESC']
            ]
        });

        res.json(sessions);

    } catch (error) {
        console.error('Get chat sessions error:', error);
        res.status(500).json({ error: 'Failed to fetch chat sessions' });
    }
});

// Delete chat session
router.delete('/session/:sessionId', authenticateToken, async(req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        await ChatMessage.destroy({
            where: { userId, sessionId }
        });

        res.json({ success: true, message: 'Chat session deleted' });

    } catch (error) {
        console.error('Delete chat session error:', error);
        res.status(500).json({ error: 'Failed to delete chat session' });
    }
});

module.exports = router;