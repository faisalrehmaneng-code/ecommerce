const router = require('express').Router();

const authRoutes = require('./auth');
const userRoutes = require('./user');
const addressRoutes = require('./address');
const newsletterRoutes = require('./newsletter');
const productRoutes = require('./product');
const categoryRoutes = require('./category');
const brandRoutes = require('./brand');
const contactRoutes = require('./contact');
const merchantRoutes = require('./merchant');
const cartRoutes = require('./cart');
const orderRoutes = require('./order');
const reviewRoutes = require('./review');
const wishlistRoutes = require('./wishlist');
const policyRoutes = require('./policy');
const bannerRoutes = require('./banner');
const promoCardRoutes = require('./promoCards');
const shippingRoutes = require('./shipping');
const bankRoutes = require('./bank');
const discount = require('./discount');
// auth routes
router.use('/auth', authRoutes);

// user routes
router.use('/user', userRoutes);

// address routes
router.use('/address', addressRoutes);

// newsletter routes
router.use('/newsletter', newsletterRoutes);

// product routes
router.use('/product', productRoutes);

// category routes
router.use('/category', categoryRoutes);

// brand routes
router.use('/brand', brandRoutes);

// contact routes
router.use('/contact', contactRoutes);

// merchant routes
router.use('/merchant', merchantRoutes);

// cart routes
router.use('/cart', cartRoutes);

// order routes
router.use('/order', orderRoutes);

// Review routes
router.use('/review', reviewRoutes);

// Wishlist routes
router.use('/wishlist', wishlistRoutes);
// Policy routes
router.use('/policy', policyRoutes);
// banners
router.use('/banner', bannerRoutes);
// promo cards
router.use('/promo-cards', promoCardRoutes);
// shipping
router.use('/shipping', shippingRoutes);
// bank
router.use('/bank', bankRoutes);
// discount
router.use('/discount', discount);

module.exports = router;
