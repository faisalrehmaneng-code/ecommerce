const express = require('express');
const router = express.Router();
const multer = require('multer');
const Mongoose = require('mongoose');

const Product = require('../../models/product');
const Brand = require('../../models/brand');
const Category = require('../../models/category');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const checkAuth = require('../../utils/auth');
const { s3Upload, s3Delete } = require('../../utils/storage');
const {
  getStoreProductsQuery,
  getStoreProductsWishListQuery
} = require('../../utils/queries');
const { ROLES } = require('../../constants');

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// fetch product slug api
router.get('/item/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;

    const productDoc = await Product.findOne({ slug, isActive: true }).populate(
      {
        path: 'brand',
        select: 'name isActive slug'
      }
    );

    const hasNoBrand =
      productDoc?.brand === null || productDoc?.brand?.isActive === false;

    if (!productDoc || hasNoBrand) {
      return res.status(404).json({
        message: 'No product found.'
      });
    }

    res.status(200).json({
      product: productDoc
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// fetch product name search api
router.get('/list/search/:name', async (req, res) => {
  try {
    const name = req.params.name;

    const productDoc = await Product.find(
      { name: { $regex: new RegExp(name), $options: 'is' }, isActive: true },
      { name: 1, slug: 1, imageUrl: 1, price: 1, thumbnails: 1, _id: 0 }
    );

    if (productDoc.length < 0) {
      return res.status(404).json({
        message: 'No product found.'
      });
    }

    res.status(200).json({
      products: productDoc
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// fetch store products by advanced filters api
router.get('/list', async (req, res) => {
  try {
    let {
      sortOrder,
      rating,
      max,
      min,
      category,
      brand,
      page = 1,
      limit = 10
    } = req.query;
    sortOrder = JSON.parse(sortOrder);

    const categoryFilter = category ? { category } : {};
    const basicQuery = getStoreProductsQuery(min, max, rating);

    const userDoc = await checkAuth(req);
    const categoryDoc = await Category.findOne({
      slug: categoryFilter.category,
      isActive: true
    });

    if (categoryDoc) {
      basicQuery.push({
        $match: {
          isActive: true,
          _id: {
            $in: Array.from(categoryDoc.products)
          }
        }
      });
    }

    const brandDoc = await Brand.findOne({
      slug: brand,
      isActive: true
    });

    if (brandDoc) {
      basicQuery.push({
        $match: {
          'brand._id': { $eq: brandDoc._id }
        }
      });
    }

    let products = null;
    const productsCount = await Product.aggregate(basicQuery);
    const count = productsCount.length;
    const size = count > limit ? page - 1 : 0;
    const currentPage = count > limit ? Number(page) : 1;

    // paginate query
    const paginateQuery = [
      { $sort: sortOrder },
      { $skip: size * limit },
      { $limit: limit * 1 }
    ];

    if (userDoc) {
      const wishListQuery = getStoreProductsWishListQuery(userDoc.id).concat(
        basicQuery
      );
      products = await Product.aggregate(wishListQuery.concat(paginateQuery));
    } else {
      products = await Product.aggregate(basicQuery.concat(paginateQuery));
    }

    res.status(200).json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage,
      count
    });
  } catch (error) {
    console.log('error', error);
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.get('/list/select', async (req, res) => {
  try {
    const products = await Product.find({}, 'name');

    res.status(200).json({
      products
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// Add product api with thumbnail support
router.post(
  '/add',
  auth,
  role.check(ROLES.Admin, ROLES.Merchant),
  upload.fields([
    { name: 'image[]', maxCount: 10 },
    { name: 'thumbnail[]', maxCount: 2 }
  ]),
  async (req, res) => {
    try {
      const {
        sku,
        name,
        description,
        Disclaimer,
        CleaningInstruction,
        height,
        width,
        depth,
        compartments,
        innerPocket,
        baseDetails,
        quantity,
        price,
        taxable,
        isActive,
        brand
      } = req.body;

      if (!sku) return res.status(400).json({ error: 'You must enter sku.' });
      if (!name || !description || !Disclaimer || !CleaningInstruction)
        return res.status(400).json({
          error:
            'You must enter name, description, disclaimer & cleaning instruction.'
        });
      if (!height)
        return res.status(400).json({ error: 'You must enter height.' });
      if (!width)
        return res.status(400).json({ error: 'You must enter width.' });
      if (!depth)
        return res.status(400).json({ error: 'You must enter depth.' });
      if (!compartments)
        return res.status(400).json({ error: 'You must enter compartments.' });
      if (!innerPocket)
        return res.status(400).json({ error: 'You must enter inner pocket.' });
      if (!baseDetails)
        return res.status(400).json({ error: 'You must enter base details.' });
      if (!quantity)
        return res.status(400).json({ error: 'You must enter a quantity.' });
      if (!price)
        return res.status(400).json({ error: 'You must enter a price.' });

      const foundProduct = await Product.findOne({ sku });
      if (foundProduct)
        return res.status(400).json({ error: 'This sku is already in use.' });

      // Upload thumbnails sequentially to maintain order
      const uploadedThumbnails = [];
      if (req.files && req.files['thumbnail[]']) {
        const thumbnailFiles = req.files['thumbnail[]'];

        if (thumbnailFiles.length > 2) {
          return res.status(400).json({
            error: 'Maximum 2 thumbnail images allowed.'
          });
        }

        // Sequential upload to preserve order
        for (let i = 0; i < thumbnailFiles.length; i++) {
          const file = thumbnailFiles[i];
          console.log(
            `Uploading thumbnail ${i + 1}/${thumbnailFiles.length}: ${
              file.originalname
            }`
          );
          const { imageUrl, imageKey } = await s3Upload(file);
          uploadedThumbnails.push({ imageUrl, imageKey });
        }
      }

      // Upload images sequentially to maintain order
      const uploadedImages = [];
      if (req.files && req.files['image[]']) {
        const imageFiles = req.files['image[]'];

        // Sequential upload to preserve order
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          console.log(
            `Uploading image ${i + 1}/${imageFiles.length}: ${
              file.originalname
            }`
          );
          const { imageUrl, imageKey } = await s3Upload(file);
          uploadedImages.push({ imageUrl, imageKey });
        }
      }

      const product = new Product({
        sku,
        name,
        description,
        Disclaimer,
        CleaningInstruction,
        height,
        width,
        depth,
        compartments,
        innerPocket,
        baseDetails,
        quantity,
        price,
        taxable,
        isActive,
        brand,
        images: uploadedImages,
        thumbnails: uploadedThumbnails
      });

      const savedProduct = await product.save();

      res.status(200).json({
        success: true,
        message: `Product has been added successfully!`,
        product: savedProduct
      });
    } catch (error) {
      console.error('Product add error:', error);
      return res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }
);

// fetch products api
router.get(
  '/',
  // role.check(ROLES.Admin, ROLES.Merchant),
  async (req, res) => {
    try {
      let products = [];

      // if (req.user.merchant) {
      //   console.log('if');
      //   const brands = await Brand.find({
      //     merchant: req.user.merchant
      //   }).populate('merchant', '_id');

      //   const brandId = brands[0]?.['_id'];

      //   products = await Product.find({})
      //     .populate({
      //       path: 'brand',
      //       populate: {
      //         path: 'merchant',
      //         model: 'Merchant'
      //       }
      //     })
      //     .where('brand', brandId);
      // } else {
      // console.log('else');
      products = await Product.find({}).populate({
        path: 'brand',
        populate: {
          path: 'merchant',
          model: 'Merchant'
        }
      });
      // }
      // console.log('adasdasdsadsadsaddasddasdsadsad');

      res.status(200).json({
        products
      });
    } catch (error) {
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }
);

// fetch product api
router.get(
  '/:id',
  // role.check(ROLES.Admin, ROLES.Merchant),
  async (req, res) => {
    try {
      const productId = req.params.id;

      let productDoc = null;

      // if (req.user.merchant) {
      //   const brands = await Brand.find({
      //     merchant: req.user.merchant
      //   }).populate('merchant', '_id');

      //   const brandId = brands[0]['_id'];

      //   productDoc = await Product.findOne({ _id: productId })
      //     .populate({
      //       path: 'brand',
      //       select: 'name'
      //     })
      //     .where('brand', brandId);
      // } else {
      productDoc = await Product.findOne({ _id: productId }).populate({
        path: 'brand',
        select: 'name'
      });
      // }

      if (!productDoc) {
        return res.status(404).json({
          message: 'No product found.'
        });
      }

      res.status(200).json({
        product: productDoc
      });
    } catch (error) {
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }
);

// Update product api
router.put(
  '/:id',
  auth,
  role.check(ROLES.Admin, ROLES.Merchant),
  upload.fields([
    { name: 'image[]', maxCount: 10 },
    { name: 'thumbnail[]', maxCount: 2 }
  ]),
  async (req, res) => {
    try {
      const productId = req.params.id;

      let update;
      if (req.body.product) {
        update = JSON.parse(req.body.product);
      } else {
        update = { ...req.body };
      }

      const query = { _id: productId };
      const { sku, slug } = update;

      const foundProduct = await Product.findOne({
        $or: [{ slug }, { sku }]
      });

      if (foundProduct && foundProduct._id != productId) {
        return res
          .status(400)
          .json({ error: 'Sku or slug is already in use.' });
      }

      const existingProduct = await Product.findById(productId);
      if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found.' });
      }

      let existingImages = [];
      let existingThumbnails = [];
      let imagesToDelete = [];
      let thumbnailsToDelete = [];

      try {
        if (req.body.existingImages) {
          existingImages = JSON.parse(req.body.existingImages);
        }
        if (req.body.existingThumbnails) {
          existingThumbnails = JSON.parse(req.body.existingThumbnails);
        }
        if (req.body.imagesToDelete) {
          imagesToDelete = JSON.parse(req.body.imagesToDelete);
        }
        if (req.body.thumbnailsToDelete) {
          thumbnailsToDelete = JSON.parse(req.body.thumbnailsToDelete);
        }
      } catch (parseError) {
        console.error('Error parsing image data:', parseError);
      }

      // Delete images from S3
      if (imagesToDelete.length > 0) {
        for (const imageKey of imagesToDelete) {
          try {
            await s3Delete(imageKey);
            console.log(`Deleted image: ${imageKey}`);
          } catch (deleteError) {
            console.error(`Failed to delete image ${imageKey}:`, deleteError);
          }
        }
      }

      // Delete thumbnails from S3
      if (thumbnailsToDelete.length > 0) {
        for (const imageKey of thumbnailsToDelete) {
          try {
            await s3Delete(imageKey);
            console.log(`Deleted thumbnail: ${imageKey}`);
          } catch (deleteError) {
            console.error(
              `Failed to delete thumbnail ${imageKey}:`,
              deleteError
            );
          }
        }
      }

      // Start with existing images (maintaining their order)
      let finalImages = [...existingImages];
      let finalThumbnails = [...existingThumbnails];

      // Upload new thumbnails sequentially to maintain order
      if (req.files && req.files['thumbnail[]']) {
        const thumbnailFiles = req.files['thumbnail[]'];

        if (finalThumbnails.length + thumbnailFiles.length > 2) {
          return res.status(400).json({
            error: 'Maximum 2 thumbnail images allowed in total.'
          });
        }

        // Sequential upload to preserve order
        for (let i = 0; i < thumbnailFiles.length; i++) {
          const file = thumbnailFiles[i];
          console.log(
            `Uploading new thumbnail ${i + 1}/${thumbnailFiles.length}: ${
              file.originalname
            }`
          );
          const { imageUrl, imageKey } = await s3Upload(file);
          finalThumbnails.push({ imageUrl, imageKey });
        }
      }

      // Upload new images sequentially to maintain order
      if (req.files && req.files['image[]']) {
        const imageFiles = req.files['image[]'];

        if (finalImages.length + imageFiles.length > 10) {
          return res.status(400).json({
            error: 'Maximum 10 images allowed in total.'
          });
        }

        // Sequential upload to preserve order
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          console.log(
            `Uploading new image ${i + 1}/${imageFiles.length}: ${
              file.originalname
            }`
          );
          const { imageUrl, imageKey } = await s3Upload(file);
          finalImages.push({ imageUrl, imageKey });
        }
      }

      // Update the product with the final arrays
      update.images = finalImages;
      update.thumbnails = finalThumbnails;

      // Clean up temporary fields
      delete update.existingImages;
      delete update.existingThumbnails;
      delete update.imagesToDelete;
      delete update.thumbnailsToDelete;

      const updatedProduct = await Product.findOneAndUpdate(query, update, {
        new: true
      });

      res.status(200).json({
        success: true,
        message: 'Product has been updated successfully!',
        product: updatedProduct
      });
    } catch (error) {
      console.error('Product update error:', error);
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }
);

// Update product active status
router.put(
  '/:id/active',
  auth,
  role.check(ROLES.Admin, ROLES.Merchant),
  async (req, res) => {
    try {
      const productId = req.params.id;
      const update = req.body.product;
      const query = { _id: productId };

      await Product.findOneAndUpdate(query, update, {
        new: true
      });

      res.status(200).json({
        success: true,
        message: 'Product has been updated successfully!'
      });
    } catch (error) {
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }
);

// Delete product api
router.delete(
  '/delete/:id',
  auth,
  role.check(ROLES.Admin, ROLES.Merchant),
  async (req, res) => {
    try {
      const productId = req.params.id;

      // Get product to retrieve image keys for deletion
      const product = await Product.findById(productId);

      if (product) {
        // Delete all images from S3
        if (product.images && product.images.length > 0) {
          for (const image of product.images) {
            if (image.imageKey) {
              try {
                await s3Delete(image.imageKey);
                console.log(`Deleted image: ${image.imageKey}`);
              } catch (deleteError) {
                console.error(
                  `Failed to delete image ${image.imageKey}:`,
                  deleteError
                );
              }
            }
          }
        }

        // Delete all thumbnails from S3
        if (product.thumbnails && product.thumbnails.length > 0) {
          for (const thumbnail of product.thumbnails) {
            if (thumbnail.imageKey) {
              try {
                await s3Delete(thumbnail.imageKey);
                console.log(`Deleted thumbnail: ${thumbnail.imageKey}`);
              } catch (deleteError) {
                console.error(
                  `Failed to delete thumbnail ${thumbnail.imageKey}:`,
                  deleteError
                );
              }
            }
          }
        }
      }

      // Delete product from database
      await Product.deleteOne({ _id: productId });

      res.status(200).json({
        success: true,
        message: `Product has been deleted successfully!`,
        product
      });
    } catch (error) {
      console.error('Product delete error:', error);
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }
);

module.exports = router;
