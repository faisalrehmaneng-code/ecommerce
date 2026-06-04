import React from "react";
import { Link } from "react-router-dom";


const OrderPlaced = () => {
    // Generate a random order ID for display
    const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);

    return (
        <>


            <div className="container my-5 py-5 text-center">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6">

                        {/* Success Icon */}
                        <div className="success-icon-wrapper">
                            <i className="fa fa-check"></i>
                        </div>

                        <h1 className="display-5 fw-bold mb-3">Order Placed Successfully!</h1>
                        <p className="lead text-muted mb-4">
                            Thank you for your purchase. Your order has been received and is being processed.
                        </p>

                        <div className="bg-light p-4 rounded mb-4 border">
                            <p className="mb-1 text-muted">Order Number</p>
                            <h4 className="fw-bold text-dark">{orderId}</h4>
                            <p className="small text-muted mb-0 mt-2">
                                You will receive an order confirmation email shortly with the expected delivery date.
                            </p>
                        </div>

                        <div className="d-flex justify-content-center gap-3">
                            <Link to="/orders" className="btn btn-outline-dark px-4">
                                View Order
                            </Link>
                            <Link to="/product" className="btn btn-dark px-4">
                                Continue Shopping
                            </Link>
                        </div>

                    </div>
                </div>
            </div>

        </>
    );
};

export default OrderPlaced;