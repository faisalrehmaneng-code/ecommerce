const express = require('express');
const router = express.Router();

const Product = require('../../models/product');
const StoreDiscount = require('../../models/StoreDiscount');
const auth = require('../../middleware/auth');
const { calculateFinalPrice } = require('../../utils/priceCalculator');

router.post('/store', auth, async (req, res) => {
  try {
    const { discountType, discountValue, isActive } = req.body;

    let storeDiscount = await StoreDiscount.findOne({});

    if (!storeDiscount) {
      storeDiscount = new StoreDiscount({
        discountType,
        discountValue,
        isActive
      });
    } else {
      storeDiscount.discountType = discountType;
      storeDiscount.discountValue = discountValue;
      storeDiscount.isActive = isActive;
    }

    await storeDiscount.save();

    if (isActive) {
      await Product.updateMany(
        {},
        {
          $set: {
            discountType: discountType,
            discountValue: discountValue
          }
        }
      );
    } else {
      await Product.updateMany(
        {},
        {
          $set: {
            discountType: '',
            discountValue: 0
          }
        }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Store discount saved',
      storeDiscount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

router.put('/product/:id', auth, async (req, res) => {
  try {
    const { discountType, discountValue } = req.body;

    const storeDiscount = await StoreDiscount.findOne({ isActive: true });

    if (storeDiscount) {
      return res.status(400).json({
        success: false,
        message: 'Store discount is active. Product discounts are disabled.'
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.discountType = discountType;
    product.discountValue = discountValue;

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product discount updated',
      product
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

router.get('/products', auth, async (req, res) => {
  try {
    const products = await Product.find();
    const storeDiscount = await StoreDiscount.findOne();

    const finalProducts = products.map(product => ({
      ...product._doc,
      finalPrice: calculateFinalPrice(product, storeDiscount)
    }));

    res.status(200).json({
      success: true,
      storeDiscount,
      products: finalProducts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

module.exports = router;
