const express = require('express');
const router = express.Router();
const Bank = require('../../models/bank');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const { ROLES } = require('../../constants');

// GET All Banks (Public or Admin)
router.get('/', async (req, res) => {
    try {
        const banks = await Bank.find({}).sort('-created');
        res.status(200).json({ banks });
    } catch (error) {
        res.status(400).json({ error: 'Your request could not be processed.' });
    }
});

// ADD Bank (Admin)
router.post('/add', auth, role.check(ROLES.Admin), async (req, res) => {
    try {
        const bank = new Bank(req.body);
        const savedBank = await bank.save();

        res.status(200).json({
            success: true,
            message: 'Bank account added successfully!',
            bank: savedBank
        });
    } catch (error) {
        res.status(400).json({ error: 'Your request could not be processed.' });
    }
});

// UPDATE Bank (Admin)
router.put('/:id', auth, role.check(ROLES.Admin), async (req, res) => {
    try {
        const bankId = req.params.id;
        const update = req.body;
        const query = { _id: bankId };

        const bankDoc = await Bank.findOneAndUpdate(query, update, { new: true });

        res.status(200).json({
            success: true,
            message: 'Bank details updated successfully!',
            bank: bankDoc
        });
    } catch (error) {
        res.status(400).json({ error: 'Your request could not be processed.' });
    }
});

// DELETE Bank (Admin)
router.delete('/delete/:id', auth, role.check(ROLES.Admin), async (req, res) => {
    try {
        await Bank.deleteOne({ _id: req.params.id });
        res.status(200).json({
            success: true,
            message: 'Bank account deleted successfully!'
        });
    } catch (error) {
        res.status(400).json({ error: 'Your request could not be processed.' });
    }
});

module.exports = router;