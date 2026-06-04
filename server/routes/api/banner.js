const express = require('express');
const multer = require('multer');
const router = express.Router();
const Banner = require('../../models/banner');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const { s3Upload } = require('../../utils/storage');
const { ROLES } = require('../../constants');

// Multer in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route to add/update banners
router.post(
  '/add',
  auth,
  role.check(ROLES.Admin),
  upload.fields([
    { name: 'left1', maxCount: 1 },
    { name: 'left2', maxCount: 1 },
    { name: 'main1', maxCount: 1 },
    { name: 'main2', maxCount: 1 },
    { name: 'right1', maxCount: 1 },
    { name: 'right2', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
          error: 'You must upload at least one banner image.'
        });
      }

      // Get existing banner document or create new
      let banner = (await Banner.findOne()) || new Banner({});

      for (const key of Object.keys(req.files)) {
        const file = req.files[key][0];

        // Upload to AWS S3
        const { imageUrl } = await s3Upload(file);

        // Save URL to banner
        banner[key] = imageUrl;
      }

      await banner.save();

      res.status(200).json({
        success: true,
        message: 'Banner images uploaded successfully!',
        banner
      });
    } catch (error) {
      console.error('Banner upload error:', error);
      res.status(400).json({
        error: error.message || 'Your request could not be processed.'
      });
    }
  }
);

router.get(
  '/',
  // auth,
  // Optional: role.check(ROLES.Admin, ROLES.Merchant),
  async (req, res) => {
    try {
      const banners = await Banner.find();

      res.status(200).json({
        banners
      });
    } catch (error) {
      console.error('Error fetching banners:', error);
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }
);

module.exports = router;
