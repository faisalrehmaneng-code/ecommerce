import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { addCart, delCart } from "../redux/action";
import { Link } from "react-router-dom";
import '../styles/main.scss';

const Cart = () => {
  const state = useSelector((state) => state.handleCart);
  const dispatch = useDispatch();

  const addItem = (product) => {
    // FIX: Force qty to 1
    dispatch(addCart({ ...product, qty: 1 }));
  };
  const removeItem = (product) => dispatch(delCart(product));

  const EmptyCart = () => (
    <div className="container py-5 text-center" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div className="mb-4">
        <i className="fa fa-shopping-basket fa-4x text-muted opacity-25"></i>
      </div>
      <h3 className="fw-bold mb-3">Your Cart is Empty</h3>
      <p className="text-muted mb-4">Looks like you haven't added anything to your cart yet.</p>
      <Link to="/" className="btn btn-dark px-5 py-2 mx-auto">
        <i className="fa fa-arrow-left me-2"></i> Continue Shopping
      </Link>
    </div>
  );

  const ShowCart = () => {
    let subtotal = 0;
    let totalItems = 0;

    state.forEach((item) => {
      subtotal += item.price * item.qty;
      totalItems += item.qty;
    });

    return (
      <div className="row">

        {/* --- LEFT COLUMN: SINGLE CARD CONTAINER --- */}
        <div className="col-lg-8">
          {/* This wrapper makes it one big white box like the screenshot */}
          <div className="cart-container-card">

            {/* Header inside the box */}
            <h4 className="fw-bold mb-3">Cart ({totalItems})</h4>
            <p className="text-muted mb-4 small">
              Store Name: <strong className="text-dark">BagsVerse</strong>
            </p>

            {/* Items List */}
            {state.map((item) => (
              <div key={item.id} className="cart-item-row">

                {/* Image */}
                <div className="cart-img-box">
                  <img src={item.image || (item.images && item.images.length > 0 ? item.images[0].imageUrl : "https://via.placeholder.com/80?text=No+Image")} alt={item.title} />
                </div>

                {/* Details */}
                <div className="cart-item-details">
                  <h5>{item.title || item.name}</h5>
                  <p>Color: <span className="text-dark">Standard</span> | Size: <span className="text-dark">One Size</span></p>
                </div>

                {/* Quantity */}
                <div className="cart-qty-selector">
                  <button onClick={() => removeItem(item)}>-</button>
                  <span>{item.qty}</span>
                  <button onClick={() => addItem(item)}>+</button>
                </div>

                {/* Remove Icon */}
                <div className="btn-remove-item" onClick={() => removeItem(item)} title="Remove Item">
                  <i className="fa fa-trash-o"></i>
                </div>

                {/* Price */}
                <div className="fw-bold fs-5 text-end" style={{ minWidth: '80px' }}>
                  Rs {item.price * item.qty}
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* --- RIGHT COLUMN: SUMMARY --- */}
        <div className="col-lg-4">
          <div className="summary-card">
            <h5>Summary</h5>

            <div className="summary-row">
              <span>Subtotal</span>
              <span className="fw-bold">Rs {subtotal}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span className="shipping-text">Calculated at checkout</span>
            </div>

            <div className="summary-row total">
              <span>Estimated Total</span>
              <span>Rs {subtotal}</span>
            </div>

            <Link to="/checkout" className="btn btn-dark w-100 py-2 fw-bold mt-3">
              Checkout
            </Link>

            <div className="trust-section">
              <div className="trust-row">
                <i className="fa fa-truck"></i>
                <div>
                  <strong>Ships in 3-7 Business Days</strong>
                  Reliable delivery across the country.
                </div>
              </div>
              <div className="trust-row mt-3">
                <i className="fa fa-shield"></i>
                <div>
                  <strong>Security & Privacy</strong>
                  Safe Payments: We use Cash on Delivery for secure and reliable transactions.
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    );
  };

  return (
    <>

      <div className="cart-container-wrapper py-5">
        <div className="container">
          {state.length > 0 ? <ShowCart /> : <EmptyCart />}
        </div>
      </div>

    </>
  );
};

export default Cart;