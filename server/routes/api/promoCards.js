const express = require('express');
const router = express.Router();
const multer = require('multer');
const PromoCard = require('../../models/PromoCard');
const auth = require('../../middleware/auth');
const { s3Upload } = require('../../utils/storage');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// ------------------------
// GET ALL CARDS
// ------------------------
router.get('/', async (req, res) => {
  try {
    const cards = await PromoCard.find().sort({ createdAt: 1 });
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------
// CREATE / UPDATE SINGLE CARD
// ------------------------
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { id, title, subtitle } = req.body;
    const file = req.file;

    let imageUrl = '';
    let imageKey = '';

    // Upload new image if provided
    if (file) {
      const uploadResult = await s3Upload(file);
      imageUrl = uploadResult.imageUrl;
      imageKey = uploadResult.imageKey;
    }

    let card;
    if (id) {
      // Update existing card
      card = await PromoCard.findById(id);
      if (!card) {
        return res.status(404).json({ error: 'Card not found' });
      }

      card.title = title || card.title;
      card.subtitle = subtitle || card.subtitle;
      if (imageUrl) {
        card.imageUrl = imageUrl;
        card.imageKey = imageKey;
      }
      await card.save();
    } else {
      // Create new card
      card = await PromoCard.create({ title, subtitle, imageUrl, imageKey });
    }

    res.json(card);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
