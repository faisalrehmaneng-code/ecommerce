// For Add Item to Cart
export const addCart = product => {
  return {
    type: 'ADDITEM',
    payload: product
  };
};
export const resetCart = () => {
  return {
    type: 'RESETCART'
  };
};

// For Delete Item to Cart
export const delCart = product => {
  return {
    type: 'DELITEM',
    payload: product
  };
};
