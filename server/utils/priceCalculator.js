const calculateFinalPrice = (product, storeDiscount) => {
  let finalPrice = product.price;

  if (storeDiscount && storeDiscount.isActive) {
    if (storeDiscount.discountType === 'percent') {
      finalPrice -= (product.price * storeDiscount.discountValue) / 100;
    } else {
      finalPrice -= storeDiscount.discountValue;
    }
  } else if (product.discountType) {
    if (product.discountType === 'percent') {
      finalPrice -= (product.price * product.discountValue) / 100;
    } else {
      finalPrice -= product.discountValue;
    }
  }

  return Math.max(finalPrice, 0);
};

module.exports = { calculateFinalPrice };
