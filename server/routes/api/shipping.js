const express = require('express');
const router = express.Router();
const Shipping = require('../../models/shipping');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const { ROLES } = require('../../constants');

// GET Config
router.get('/', async (req, res) => {
    try {
        let config = await Shipping.findOne({ configType: 'default' });

        // If no config exists yet, return defaults
        if (!config) {
            config = {
                shippingMode: 'fixed',
                shippingCost: 250,
                isThresholdActive: true,
                thresholdValue: 7999,
                bankDepositMessage: ''
            };
        }

        res.status(200).json({ config });
    } catch (error) {
        res.status(400).json({ error: 'Your request could not be processed.' });
    }
});

// UPDATE Config (Admin Only)
router.post('/', auth, role.check(ROLES.Admin), async (req, res) => {
    try {
        const update = {
            shippingMode: req.body.shippingMode,
            shippingCost: req.body.shippingCost,
            isThresholdActive: req.body.isThresholdActive,
            thresholdValue: req.body.thresholdValue,
            bankDepositMessage: req.body.bankDepositMessage,
            updated: Date.now()
        };

        const config = await Shipping.findOneAndUpdate(
            { configType: 'default' },
            update,
            { new: true, upsert: true }
        );

        res.status(200).json({
            success: true,
            message: 'Shipping configuration updated!',
            config
        });
    } catch (error) {
        res.status(400).json({ error: 'Your request could not be processed.' });
    }
});

module.exports = router;