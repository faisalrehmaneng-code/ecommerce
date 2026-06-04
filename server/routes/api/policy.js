const express = require('express');
const router = express.Router();

// Bring in Models & Helpers
const Policy = require('../../models/policy');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const { ROLES } = require('../../constants');

// GET Shipping Policy (Public or Admin)
router.get('/shipping', async (req, res) => {
    try {
        const policy = await Policy.findOne({ type: 'shipping' });
        res.status(200).json({
            success: true,
            policy: policy ? policy.content : ''
        });
    } catch (error) {
        res.status(400).json({
            error: 'Your request could not be processed. Please try again.'
        });
    }
});

// ADD/UPDATE Shipping Policy (Admin Only)
router.post('/shipping', auth, role.check(ROLES.Admin), async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Policy content is required.' });
        }

        // Upsert: Find by type 'shipping', update content, or create if new
        const policy = await Policy.findOneAndUpdate(
            { type: 'shipping' },
            { content, updated: Date.now() },
            { new: true, upsert: true }
        );

        res.status(200).json({
            success: true,
            message: 'Shipping policy updated successfully!',
            policy
        });
    } catch (error) {
        res.status(400).json({
            error: 'Your request could not be processed. Please try again.'
        });
    }
});

module.exports = router;