const express = require('express');
const router = express.Router();
const Mongoose = require('mongoose');
const sendAdminNotification = require('../../utils/telegram');

// Bring in Models & Utils
const Order = require('../../models/order');
const Cart = require('../../models/cart');
const Product = require('../../models/product');
const auth = require('../../middleware/auth');
const mailgun = require('../../services/mailgun');
const store = require('../../utils/store');
const { ROLES, CART_ITEM_STATUS } = require('../../constants');

router.post('/add', async (req, res) => {
  try {
    const cart = req.body.cartId;
    const total = req.body.total;
    // const user = req.user._id;

    const order = new Order({
      cart,
      // user,
      total,
      shippingAddress: req.body.shippingAddress
      // userRead: true
    });

    const orderDoc = await order.save();
    // const populatedOrder = await Order.findById(orderDoc._id).populate({
    //   path: 'user',
    //   select: 'firstName lastName email'
    // });
    const cartDoc = await Cart.findById(orderDoc.cart._id).populate({
      path: 'products.product',
      populate: {
        path: 'brand'
      }
    });

    const newOrder = {
      _id: orderDoc._id,
      created: orderDoc.created,
      // user: populatedOrder.user,
      total: orderDoc.total,
      products: cartDoc.products
    };
    // await mailgun.sendEmail(order.user.email, 'order-confirmation', newOrder);
    const productList = newOrder.products
      .map((item, index) => {
        return `   ${index + 1}. ${item.product.name} × ${item.quantity}`;
      })
      .join('\n');
    const message = `
                  📦 <b>NEW INCOMING ORDER</b>
                  ───────────────────────
                  🆔 <b>Order Reference:</b> <code>#${newOrder._id}</code>
    }
                  💰 <b>Order Summary:</b>
                  ━━━━━━━━━━━━━━━━━━━━━━━
                  <b>Total Payable:</b> ₹${newOrder.total.toLocaleString()}
                  <b>Payment Status:</b> Pending

                  🛒 <b>Product Details:</b>
                  ${productList}

                  📅 <b>Timestamp:</b> ${new Date(
                    newOrder.created
                  ).toLocaleString('en-IN', { timeZone: 'Asia/Karachi' })}
                  ───────────────────────
                  ✅ <i>Please process this order in the admin dashboard.</i>
                      `;

    sendAdminNotification(message);
    res.status(200).json({
      success: true,
      message: `Your order has been placed successfully!`,
      order: { _id: orderDoc._id }
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// search orders api
router.get('/search', async (req, res) => {
  try {
    const { search } = req.query;

    if (!Mongoose.Types.ObjectId.isValid(search)) {
      return res.status(200).json({
        orders: []
      });
    }

    let ordersDoc = null;

    if (req.user.role === ROLES.Admin) {
      ordersDoc = await Order.find({
        _id: Mongoose.Types.ObjectId(search)
      }).populate({
        path: 'cart',
        populate: {
          path: 'products.product',
          populate: {
            path: 'brand'
          }
        }
      });
    } else {
      const user = req.user._id;
      ordersDoc = await Order.find({
        _id: Mongoose.Types.ObjectId(search),
        user
      }).populate({
        path: 'cart',
        populate: {
          path: 'products.product',
          populate: {
            path: 'brand'
          }
        }
      });
    }

    ordersDoc = ordersDoc.filter(order => order.cart);

    if (ordersDoc.length > 0) {
      const newOrders = ordersDoc.map(o => {
        return {
          _id: o._id,
          total: parseFloat(Number(o.total.toFixed(2))),
          created: o.created,
          products: o.cart?.products
        };
      });

      let orders = newOrders.map(o => store.caculateTaxAmount(o));
      orders.sort((a, b) => b.created - a.created);
      res.status(200).json({
        orders
      });
    } else {
      res.status(200).json({
        orders: []
      });
    }
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// fetch orders api
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const ordersDoc = await Order.find()
      .sort('-created')
      .populate({
        path: 'cart',
        populate: {
          path: 'products.product',
          populate: {
            path: 'brand'
          }
        }
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Order.countDocuments();
    const orders = store.formatOrders(ordersDoc);
    res.status(200).json({
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      count
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// fetch my orders api
router.get('/me', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const user = req.user._id;
    const query = { user };

    const ordersDoc = await Order.find(query)
      .sort('-created')
      .populate({
        path: 'cart',
        populate: {
          path: 'products.product',
          populate: {
            path: 'brand'
          }
        }
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Order.countDocuments(query);
    const orders = store.formatOrders(ordersDoc);

    res.status(200).json({
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      count
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// fetch order api
router.get('/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;

    let orderDoc = null;

    if (req.user.role === ROLES.Admin) {
      orderDoc = await Order.findOne({ _id: orderId }).populate({
        path: 'cart',
        populate: {
          path: 'products.product',
          populate: {
            path: 'brand'
          }
        }
      });
    } else {
      const user = req.user._id;
      orderDoc = await Order.findOne({ _id: orderId, user }).populate({
        path: 'cart',
        populate: {
          path: 'products.product',
          populate: {
            path: 'brand'
          }
        }
      });
    }

    if (!orderDoc || !orderDoc.cart) {
      return res.status(404).json({
        message: `Cannot find order with the id: ${orderId}.`
      });
    }

    let order = {
      _id: orderDoc._id,
      total: orderDoc.total,
      shippingAddress: orderDoc.shippingAddress,
      status: orderDoc.status,
      userRead: orderDoc.userRead,
      adminRead: orderDoc.adminRead,
      created: orderDoc.created,
      totalTax: 0,
      products: orderDoc?.cart?.products,
      cartId: orderDoc.cart._id
    };

    order = store.caculateTaxAmount(order);
    res.status(200).json({
      order
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.delete('/cancel/:orderId', auth, async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const order = await Order.findOne({ _id: orderId });
    const foundCart = await Cart.findOne({ _id: order.cart });

    increaseQuantity(foundCart.products);

    await Order.deleteOne({ _id: orderId });
    await Cart.deleteOne({ _id: order.cart });

    res.status(200).json({
      success: true
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.put('/status/item/:itemId', auth, async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const orderId = req.body.orderId;
    const cartId = req.body.cartId;
    const status = req.body.status || CART_ITEM_STATUS.Cancelled;

    const foundCart = await Cart.findOne({ 'products._id': itemId });
    const foundCartProduct = foundCart.products.find(p => p._id == itemId);

    await Cart.updateOne(
      { 'products._id': itemId },
      {
        'products.$.status': status
      }
    );

    if (status === CART_ITEM_STATUS.Cancelled) {
      await Product.updateOne(
        { _id: foundCartProduct.product },
        { $inc: { quantity: foundCartProduct.quantity } }
      );

      const cart = await Cart.findOne({ _id: cartId });
      const items = cart.products.filter(
        item => item.status === CART_ITEM_STATUS.Cancelled
      );

      // All items are cancelled => Cancel order
      if (cart.products.length === items.length) {
        await Order.deleteOne({ _id: orderId });
        await Cart.deleteOne({ _id: cartId });

        return res.status(200).json({
          success: true,
          orderCancelled: true,
          message: `${
            req.user.role === ROLES.Admin ? 'Order' : 'Your order'
          } has been cancelled successfully`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Item has been cancelled successfully!'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item status has been updated successfully!'
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

const increaseQuantity = products => {
  let bulkOptions = products.map(item => {
    return {
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: item.quantity } }
      }
    };
  });

  Product.bulkWrite(bulkOptions);
};
// update order status apirole
router.put('/status/:orderId', auth, async (req, res) => {
  if (req.user.role !== ROLES.Admin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const { status } = req.body;
    // update user read status to false when admin updates order status
    await Order.updateOne({ _id: req.params.orderId }, { userRead: false });
    await Order.updateOne({ _id: req.params.orderId }, { status });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update status' });
  }
});
// update read status api
router.put('/read-status/:orderId', auth, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const userRole = req.user.role; // Get role securely from token

    let update = {};

    // If Admin is viewing, mark adminRead as true
    if (userRole === ROLES.Admin) {
      update = { adminRead: true };
    }
    // If User is viewing, mark userRead as true
    else {
      update = { userRead: true };
    }

    await Order.updateOne({ _id: orderId }, update);

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});
module.exports = router;
