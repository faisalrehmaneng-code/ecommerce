import toast from 'react-hot-toast';

// Retrieve initial state from localStorage
const getInitialCart = () => {
  const storedCart = localStorage.getItem('cart');
  return storedCart ? JSON.parse(storedCart) : [];
};

const handleCart = (state = getInitialCart(), action) => {
  const product = action.payload;

  switch (action.type) {
    case 'ADDITEM':
      // 1. Normalize ID
      const productId = product.id || product._id;

      // 2. Check if product exists
      const exist = state.find(x => (x.id || x._id) === productId);

      // 3. Get the quantity being added (Use payload qty, or default to 1)
      const qtyToAdd = product.qty || 1;

      let updatedCartAdd;

      if (exist) {
        // Increase quantity by the specific amount requested (1, or 5, etc.)
        updatedCartAdd = state.map(x => {
          if ((x.id || x._id) === productId) {
            const newQty = x.qty + qtyToAdd;

            if (newQty > x?.maxQuantity) {
              toast.error(
                `You can only add up to ${x.maxQuantity} of this item.`
              );
              return { ...x, qty: x.maxQuantity }; // cap at maxQuantity
            }
            toast.success('Product added to cart!');

            return { ...x, qty: newQty };
          }
          return x;
        });
      } else {
        // Add new product
        updatedCartAdd = [
          ...state,
          {
            ...product,
            id: productId,
            qty: qtyToAdd
          }
        ];
      }

      localStorage.setItem('cart', JSON.stringify(updatedCartAdd));
      return updatedCartAdd;

    case 'DELITEM':
      const delId = product.id || product._id;
      const exist2 = state.find(x => (x.id || x._id) === delId);

      let updatedCartDel;

      if (exist2.qty === 1) {
        updatedCartDel = state.filter(x => (x.id || x._id) !== delId);
      } else {
        updatedCartDel = state.map(x =>
          (x.id || x._id) === delId ? { ...x, qty: x.qty - 1 } : x
        );
      }

      localStorage.setItem('cart', JSON.stringify(updatedCartDel));
      return updatedCartDel;
    case 'RESETCART':
      localStorage.setItem('cart', JSON.stringify([]));
      // toast.success('Cart has been cleared!');
      return [];

    default:
      return state;
  }
};

export default handleCart;
