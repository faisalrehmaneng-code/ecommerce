const express = require('express');
const router = express.Router();
const passport = require('passport');
const multer = require('multer');
const Category = require('../../models/category');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const store = require('../../utils/store');
const { ROLES } = require('../../constants');
const { s3Upload, s3Delete } = require('../../utils/storage');
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});
router.post(
  '/add',
  auth,
  role.check(ROLES.Admin),
  upload.fields([{ name: 'image', maxCount: 1 }]),
  async (req, res) => {
    const name = req.body.name;
    const description = req.body.description;
    const products = req.body.products;
    const isActive = req.body.isActive;

    if (!description || !name) {
      return res
        .status(400)
        .json({ error: 'You must enter description & name.' });
    }
    const uploadedImages = [];

    if (req.files?.image?.length) {
      for (const file of req.files.image) {
        try {
          console.log(`Uploading: ${file.originalname}`);
          const { imageUrl, imageKey } = await s3Upload(file);

          uploadedImages.push({ imageUrl, imageKey });
        } catch (err) {
          console.error('S3 Upload Failed:', err);
          return res.status(500).json({
            error: 'Image upload failed. Please try again.'
          });
        }
      }
    }
    const category = new Category({
      name,
      description,
      products,
      isActive,
      images: uploadedImages
    });

    category.save((err, data) => {
      if (err) {
        return res.status(400).json({
          error: 'Your request could not be processed. Please try again.'
        });
      }

      res.status(200).json({
        success: true,
        message: `Category has been added successfully!`,
        category: data
      });
    });
  }
);

// fetch store categories api
router.get('/list', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.status(200).json({
      categories
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// fetch categories api
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({});
    res.status(200).json({
      categories
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// fetch category api
router.get('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;

    const categoryDoc = await Category.findOne({ _id: categoryId }).populate({
      path: 'products',
      select: 'name'
    });

    if (!categoryDoc) {
      return res.status(404).json({
        message: 'No Category found.'
      });
    }

    res.status(200).json({
      category: categoryDoc
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.put(
  '/:id',
  auth,
  role.check(ROLES.Admin),
  upload.fields([{ name: 'category[image]', maxCount: 1 }]),
  async (req, res) => {
    try {
      const categoryId = req.params.id;
      const update = req.body.category || {};
      const { slug } = update;

      // 1️⃣ Check if slug is unique
      if (slug) {
        const foundCategory = await Category.findOne({ slug });
        if (foundCategory && foundCategory._id.toString() !== categoryId) {
          return res.status(400).json({ error: 'Slug is already in use.' });
        }
      }

      // 2️⃣ Handle products array
      if (update.products) {
        try {
          if (typeof update.products === 'string') {
            update.products = JSON.parse(update.products);
          }
          if (!Array.isArray(update.products)) {
            update.products = [update.products];
          }
        } catch {
          update.products = [];
        }
      }

      console.log('Update payload:', update);

      // 3️⃣ Handle images to delete
      let imagesToDelete = [];
      if (update.imagesToDelete) {
        try {
          imagesToDelete = JSON.parse(update.imagesToDelete);
        } catch (err) {
          console.error('Error parsing imagesToDelete:', err);
        }
      }

      if (imagesToDelete.length > 0) {
        for (let url of imagesToDelete) {
          try {
            const imageKey = url.split('/').pop();
            await s3Delete(imageKey);
          } catch (err) {
            console.error('Error deleting from S3:', err);
          }
        }

        try {
          await Category.updateOne(
            { _id: categoryId },
            { $pull: { images: { imageKey: { $in: imagesToDelete } } } }
          );
        } catch (err) {
          console.error('Error removing images from DB:', err);
        }
      }

      // 4️⃣ Handle new image upload
      if (req.files && req.files['category[image]']) {
        const file = req.files['category[image]'][0];
        const { imageUrl, imageKey } = await s3Upload(file);

        try {
          await Category.updateOne(
            { _id: categoryId },
            { $set: { images: [{ imageUrl, imageKey }] } }
          );
        } catch (err) {
          console.error('Error saving new image to DB:', err);
        }
      }

      // 5️⃣ Update the category with other fields
      const updatedCategory = await Category.findOneAndUpdate(
        { _id: categoryId },
        update,
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: 'Category has been updated successfully!',
        category: updatedCategory
      });
    } catch (error) {
      console.error('Error updating category:', error);
      return res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }
);

router.put('/:id/active', auth, role.check(ROLES.Admin), async (req, res) => {
  try {
    const categoryId = req.params.id;
    const update = req.body.category;
    const query = { _id: categoryId };

    // disable category(categoryId) products
    if (!update.isActive) {
      const categoryDoc = await Category.findOne(
        { _id: categoryId, isActive: true },
        'products -_id'
      ).populate('products');

      store.disableProducts(categoryDoc.products);
    }

    await Category.findOneAndUpdate(query, update, {
      new: true
    });

    res.status(200).json({
      success: true,
      message: 'Category has been updated successfully!'
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.delete(
  '/delete/:id',
  auth,
  role.check(ROLES.Admin),
  async (req, res) => {
    try {
      const product = await Category.deleteOne({ _id: req.params.id });

      res.status(200).json({
        success: true,
        message: `Category has been deleted successfully!`,
        product
      });
    } catch (error) {
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }
);

module.exports = router;
