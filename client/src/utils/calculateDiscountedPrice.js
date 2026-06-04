export const calculateFinalPrice = (price, discountType, discountValue) => {
  if (!discountType || !discountValue || discountValue <= 0) return price;

  if (discountType === 'percent') {
    return Math.round(price - (price * discountValue) / 100);
  } else if (discountType === 'flat') {
    return Math.max(0, price - discountValue);
  }
  return price;
};
