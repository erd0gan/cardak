const express = require('express');
const router = express.Router();
const { Poll, PollVote } = require('../models/Poll');
const User = require('../models/User');

// Get all polls
router.get('/', async(req, res) => {
    try {
        const polls = await Poll.findAll({
            include: [{
                model: User,
                attributes: ['id', 'firstName', 'lastName']
            }],
            order: [
                ['createdAt', 'DESC']
            ]
        });

        // Get vote counts for each poll
        const pollsWithVotes = await Promise.all(polls.map(async(poll) => {
            const voteCount = await PollVote.count({ where: { pollId: poll.id } });
            return {
                ...poll.toJSON(),
                totalVotes: voteCount
            };
        }));

        res.json({ success: true, data: pollsWithVotes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get poll details with votes
router.get('/:id', async(req, res) => {
    try {
        const poll = await Poll.findByPk(req.params.id, {
            include: [{
                model: User,
                attributes: ['id', 'firstName', 'lastName']
            }]
        });

        if (!poll) {
            return res.status(404).json({
                success: false,
                message: 'Poll not found'
            });
        }

        // Get all votes for this poll
        const votes = await PollVote.findAll({
            where: { pollId: req.params.id },
            include: [{
                model: User,
                attributes: ['id', 'firstName', 'lastName', 'buildingBlock', 'apartmentNumber']
            }]
        });

        const totalVotes = votes.length;

        res.json({
            success: true,
            data: {
                ...poll.toJSON(),
                totalVotes,
                votes: poll.isAnonymous ? [] : votes
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create new poll

router.post('/', async(req, res) => {
    try {
        const { title, description, options, allowMultipleVotes, isAnonymous, startDate, endDate, status, targetAudience, createdBy } = req.body;

        // Validation
        if (!title || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Title, start date, and end date are required'
            });
        }

        if (!options || !Array.isArray(options) || options.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'At least 2 options are required'
            });
        }

        const poll = await Poll.create({
            title,
            description: description || null,
            options, // Sequelize setter will handle JSON conversion
            allowMultipleVotes: allowMultipleVotes || false,
            isAnonymous: isAnonymous || false,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            status: status || 'active',
            targetAudience: targetAudience || 'all',
            createdBy: createdBy || null
        });

        res.status(201).json({ success: true, data: poll });
    } catch (error) {
        console.error('Poll creation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});


// Vote on a poll
router.post('/:id/vote', async(req, res) => {
    try {
        const { userId, selectedOptions } = req.body;
        const pollId = req.params.id;

        if (!userId || !selectedOptions || !Array.isArray(selectedOptions)) {
            return res.status(400).json({
                success: false,
                message: 'User ID and selected options are required'
            });
        }

        // Check if user already voted
        const existingVote = await PollVote.findOne({
            where: { pollId, userId }
        });

        if (existingVote) {
            return res.status(400).json({
                success: false,
                message: 'You have already voted on this poll'
            });
        }

        // Get the poll
        const poll = await Poll.findByPk(pollId);
        if (!poll) {
            return res.status(404).json({
                success: false,
                message: 'Poll not found'
            });
        }

        // Update vote counts in poll options
        const options = poll.options;
        selectedOptions.forEach(optionId => {
            const option = options.find(opt => opt.id === optionId.toString());
            if (option) {
                option.votes = (option.votes || 0) + 1;
            }
        });

        // Save updated poll
        poll.options = options;
        await poll.save();

        // Create vote record
        const vote = await PollVote.create({
            pollId,
            userId,
            selectedOptions
        });

        res.status(201).json({
            success: true,
            data: vote,
            poll: poll
        });
    } catch (error) {
        console.error('Vote error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete poll
router.delete('/:id', async(req, res) => {
    try {
        const poll = await Poll.findByPk(req.params.id);
        if (!poll) {
            return res.status(404).json({
                success: false,
                message: 'Poll not found'
            });
        }

        await poll.destroy();
        res.json({ success: true, message: 'Poll deleted successfully' });
    } catch (error) {
        console.error('Poll deletion error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;