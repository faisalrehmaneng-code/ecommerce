import React, { useState, useEffect } from "react";
import { Collapse } from 'react-bootstrap';

import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { placeOrder, syncCartToDB, fetchShippingConfig, fetchBanks } from "../api"; // Added fetchBanks
import toast from "react-hot-toast";

const Checkout = () => {
  const state = useSelector((state) => state.handleCart);
  const navigate = useNavigate();

  // --- STATE FOR FORM DATA ---
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    phone: "",
    zip: ""
  });

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' or 'Bank Deposit'
  const [bankList, setBankList] = useState([]); // Store fetched banks

  // --- SHIPPING STATE ---
  const [shippingCost, setShippingCost] = useState(0);
  const [isFreeShipping, setIsFreeShipping] = useState(false);

  // --- CALCULATE SUBTOTAL ---
  const subtotal = state.reduce((acc, item) => acc + (item.price * item.qty), 0);

  // --- FETCH SHIPPING & BANKS ---
  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Fetch Shipping Config
        const config = await fetchShippingConfig();
        if (config) {
          if (config.isThresholdActive && subtotal >= config.thresholdValue) {
            setShippingCost(0);
            setIsFreeShipping(true);
          } else {
            setShippingCost(config.shippingCost || 0);
            setIsFreeShipping(false);
          }
        }

        // 2. Fetch Banks (For Bank Deposit option)
        const banks = await fetchBanks();
        setBankList(banks || []);

      } catch (error) {
        console.error("Error loading checkout data", error);
        setShippingCost(250); // Fallback
      }
    };

    loadData();
  }, [subtotal]);

  const totalAmount = subtotal + shippingCost;
  const totalItems = state.reduce((acc, item) => acc + item.qty, 0);

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Prepare Products
      const productsPayload = state.map((item) => ({
        product: item.id || item._id,
        quantity: item.qty,
        price: item.price,
        totalPrice: item.price * item.qty
      }));

      // 2. Sync Cart
      const cartResponse = await syncCartToDB({ products: productsPayload });

      if (!cartResponse.success || !cartResponse.cartId) {
        throw new Error("Failed to generate Cart ID");
      }

      // 3. Place Order
      const orderPayload = {
        cartId: cartResponse.cartId,
        total: totalAmount,
        paymentMethod: paymentMethod, // Send selected method
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          phone: formData.phone,
          zip: formData.zip
        }
      };

      console.log("Order Payload:", orderPayload);
      await placeOrder(orderPayload);

      toast.success("Order Placed Successfully!");
      localStorage.removeItem("cart");
      // dispatch({ type: "CLEAR_CART" }); 

      navigate("/order-placed");

    } catch (error) {
      console.error("Order failed:", error);
      const errMsg = error.response?.data?.error || error.message || "Failed to place order.";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

      <div className="container my-3 py-3">
        <h1 className="text-center display-6 fw-bold">Checkout</h1>
        <hr />

        {state.length ? (
          <div className="container py-2">
            <div className="row my-4">

              {/* --- LEFT SIDE: BILLING FORM --- */}
              <div className="col-md-7 col-lg-8 bg-">
                <div className="checkout-card mb-4   ">
                  <h4 className="mb-3 fw-bold">Billing Address</h4>

                  <form className="needs-validation  " onSubmit={handlePlaceOrder}>
                    <div className="row g-2">
                      <div className="col-sm-6">
                        {/* <label className="form-label">First name</label> */}
                        <input type="text" className="form-control" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="First name" />
                      </div>
                      <div className="col-sm-6">
                        {/* <label className="form-label ">Last name</label> */}
                        <input type="text" className="form-control" name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Last name" />
                      </div>
                      <div className="col-6">
                        {/* <label className="form-label ">Email</label> */}
                        <input type="email" className="form-control" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                      </div>
                      <div className="col-6">
                        {/* <label className="form-label ">Address</label> */}
                        <input type="text" className="form-control" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
                      </div>
                      <div className="col-6">
                        {/* <label className="form-label ">City</label> */}
                        <input type="text" className="form-control" name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
                      </div>
                      <div className="col-md-6">
                        {/* <label className="form-label ">Zip Code</label> */}
                        <input type="text" className="form-control" name="zip" placeholder="Zip Code" value={formData.zip} onChange={handleChange} required />
                      </div>
                      <div className="col-md-12">
                        {/* <label className="form-label ">Phone (WhatsApp)</label> */}
                        <input type="tel" className="form-control" name="phone" placeholder="Phone (WhatsApp)" value={formData.phone} onChange={handleChange} required />
                      </div>

                    </div>

                    {/* <hr className="my-3" /> */}

                    <h4 className="my-3 fw-bold ">Payment Method</h4>

                    {/* --- OPTION 1: COD --- */}
                    <div
                      className={`payment-method-box mb-0 rounded-0 border-bottom ${paymentMethod === 'COD' ? 'border-0 bg-light' : 'border-light'}`}
                      onClick={() => setPaymentMethod('COD')}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex flex-column  w-100">
                        <div className="d-flex align-items-center w-100 px-4 ">
                          <div className="me-3 align-self-start">
                            <input
                              type="radio"
                              className="form-check-input"
                              checked={paymentMethod === 'COD'}
                              onChange={() => setPaymentMethod('COD')}
                              style={{ width: '20px', height: '20px' }}
                            />
                          </div>
                          <p className="method-title mb-1 flex-grow-1 ">Cash on Delivery (COD)</p>
                        </div>
                        <div className="">

                          <Collapse in={paymentMethod === 'COD'}>
                            <div>
                              <div className="small text-muted mt-2 bg-white p-2 rounded border">
                                <p className="mb-1">You will receive a WhatsApp message for order confirmation within 5 to 10 minutes.</p>
                                <p className="mb-1">Please make sure to confirm your order on WhatsApp.</p>
                                <p className="mb-0 text-danger">Orders pending confirmation will be cancelled after 3 days.</p>
                              </div>
                            </div>
                          </Collapse>
                        </div>
                      </div>
                    </div>

                    {/* --- OPTION 2: BANK DEPOSIT --- */}
                    <div
                      className={`payment-method-box mb-0 rounded-0 ${paymentMethod === 'Bank Deposit' ? 'border-0 bg-light' : 'border-light bg-gray-600'}`}
                      onClick={() => setPaymentMethod('Bank Deposit')}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex flex-column  w-100">
                        <div className="d-flex align-items-center w-100 px-4 ">
                          <div className="me-3 align-self-start">
                            <input
                              type="radio"
                              className="form-check-input "
                              checked={paymentMethod === 'Bank Deposit'}
                              onChange={() => setPaymentMethod('Bank Deposit')}
                              style={{ width: '20px', height: '20px' }}
                            />
                          </div>
                          <p className="method-title mb-1 flex-grow-1 ">Bank Deposit</p>
                        </div>
                        <div className="">
                          {/* <p className="method-title mb-1">Bank Deposit</p> */}

                          {/* BANK DETAILS SECTION (Collapsible) */}
                          <Collapse in={paymentMethod === 'Bank Deposit'}>
                            <div>
                              <div className="small text-muted mt-2 bg-white p-3 rounded border">
                                <p className="mb-3">
                                  Make your payment directly into our bank account. Please use your Order ID as the payment reference.
                                  Your order won’t be shipped until the funds have cleared in our account.
                                </p>

                                <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">BANK DETAILS</h6>

                                {bankList.length > 0 ? (
                                  bankList.map((bank) => (
                                    <div key={bank._id} className="mb-3">
                                      <p className="fw-bold text-dark mb-0">{bank.bankName}</p>
                                      <p className="mb-0">Title: {bank.accountTitle}</p>
                                      <p className="mb-0">Account No: {bank.accountNumber}</p>
                                      {bank.iban && <p className="mb-0 iban">IBAN: {bank.iban}</p>}
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-danger">No bank details available. Please contact support.</p>
                                )}

                                <div className="mt-3 p-2 bg-success bg-opacity-10 text-success rounded border border-success">
                                  <i className="fa fa-whatsapp me-2"></i>
                                  Share payment receipt: <strong>+92 316 0444071</strong>
                                </div>
                              </div>
                            </div>
                          </Collapse>
                        </div>
                        {/* </div> */}
                      </div>
                    </div>
                    {/* ----------------------------- */}

                    <button
                      className="w-100 btn btn-dark btn-lg  mt-5 fs-6 fs-md-3 rounded-pill"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <span><i className="fa fa-spinner fa-spin me-2"></i> Processing...</span>
                      ) : (
                        `Place Order (Rs ${Math.round(totalAmount)})`
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* --- RIGHT SIDE: ORDER SUMMARY --- */}
              <div className="col-md-5 col-lg-4 order-md-last">
                <div className="checkout-card">
                  <h5 className="d-flex justify-content-between align-items-center mb-3">
                    <span className="fw-bold">Your Cart</span>
                    <span className="badge bg-dark rounded-pill">{totalItems}</span>
                  </h5>
                  <ul className="list-group list-group-flush mb-3">
                    {state.map((item) => (
                      <li className="list-group-item d-flex justify-content-between lh-sm px-0" key={item.id}>
                        <div>
                          <h6 className="my-0 text-truncate" style={{ maxWidth: '180px' }}>{item.title}</h6>
                          <small className="text-muted">Qty: {item.qty}</small>
                        </div>
                        <span className="text-muted">Rs {Math.round(item.price * item.qty)}</span>
                      </li>
                    ))}

                    <li className="list-group-item d-flex justify-content-between px-0">
                      <span>Subtotal</span>
                      <strong>Rs {Math.round(subtotal)}</strong>
                    </li>

                    <li className="list-group-item d-flex justify-content-between px-0">
                      <span>Shipping</span>
                      {isFreeShipping ? (
                        <span className="text-success fw-bold">Free</span>
                      ) : (
                        <strong>Rs {shippingCost}</strong>
                      )}
                    </li>

                    {!isFreeShipping && subtotal > 0 && (
                      <li className="list-group-item px-0 border-0 pt-0 pb-2">
                        <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                          *Standard shipping rates applied.
                        </small>
                      </li>
                    )}

                    <li className="list-group-item d-flex justify-content-between px-0 border-top mt-2 pt-3">
                      <span className="fw-bold fs-5">Total</span>
                      <strong className="fw-bold fs-5">Rs {Math.round(totalAmount)}</strong>
                    </li>
                  </ul>
                </div>
              </div>

            </div>
          </div >
        ) : (
          <div className="container">
            <div className="row">
              <div className="col-md-12 py-5 text-center">
                <h4 className="p-3 display-5">No item in Cart</h4>
                <Link to="/products" className="btn btn-dark mx-4">
                  <i className="fa fa-arrow-left me-2"></i> Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div >

    </>
  );
};

export default Checkout;