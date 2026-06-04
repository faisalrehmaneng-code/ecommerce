import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchOrderById, fetchShippingConfig } from "../api"; // Import Shipping Config API
import Skeleton from "react-loading-skeleton";

const OrderDetails = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [shippingConfig, setShippingConfig] = useState(null); // State for config
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getData = async () => {
            setLoading(true);
            try {
                // Fetch Order and Shipping Config in parallel
                const [orderData, configData] = await Promise.all([
                    fetchOrderById(id),
                    fetchShippingConfig()
                ]);

                setOrder(orderData);
                console.log("Order Data:", orderData); // Debugging line
                setShippingConfig(configData);
                console.log("shippingConfig:", configData.shippingCost); // Debugging line
            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setLoading(false);
            }
        };
        getData();
    }, [id]);

    if (loading) {
        return (
            <>

                <div className="container my-5">
                    <Skeleton height={400} />
                </div>

            </>
        );
    }

    if (!order) {
        return (
            <>

                <div className="container my-5 text-center">
                    <h3>Order not found</h3>
                    <Link to="/orders" className="btn btn-dark mt-3">Back to Orders</Link>
                </div>

            </>
        );
    }

    // --- CALCULATIONS ---
    // 1. Calculate Subtotal (Sum of all item totalPrices)
    const itemsTotal = order.products?.reduce((acc, item) => acc + (item.totalPrice || (item.price * item.quantity)), 0) || 0;

    // 3. Check if it was free shipping (Cost approx 0)

    const TotalwithShipping = itemsTotal + (shippingConfig.shippingCost === 0 ? 0 : shippingConfig.shippingCost);
    // --- ADDRESS ---
    const address = order.shippingAddress || {};

    return (
        <>

            <div className="container my-5 py-4">

                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">Order Details</h2>
                        <p className="text-muted">Order #{order._id}</p>
                    </div>
                    <Link to="/orders" className="btn btn-outline-dark">
                        <i className="fa fa-arrow-left me-2"></i> Back
                    </Link>
                </div>

                <div className="row">

                    {/* LEFT: Items */}
                    <div className="col-lg-8">
                        <div className="detail-card">
                            <h5>Items in your order</h5>
                            {order.products?.map((item, index) => (
                                <div key={index} className="item-row">
                                    <img
                                        src={item.product?.imageUrl || (item.product?.images && item.product.images[0]?.imageUrl) || "https://via.placeholder.com/80?text=No+Image"}
                                        alt={item.product?.name || "Product"}
                                    />
                                    <div className="flex-grow-1">
                                        <h6 className="fw-bold mb-1">{item.product?.name || "Unknown Product"}</h6>
                                        <p className="text-muted small mb-0">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="fw-bold">
                                        Rs {(item.totalPrice || (item.price * item.quantity)).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Payment & Shipping Method */}
                        <div className="row">
                            <div className="col-md-6">
                                <div className="detail-card">
                                    <h5>Payment</h5>
                                    <p className="mb-1">Payment Method: <strong>Cash on Delivery</strong></p>
                                    <p className="mb-0">
                                        Payment Status:
                                        <span className={`badge ms-2 ${order.status === 'Delivered' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                            {order.status === 'Delivered' ? 'Paid' : 'Pending'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="detail-card">
                                    <h5>Shipping Status</h5>
                                    <p className="mb-1">Standard Shipping</p>
                                    <p className="mb-0">Current Status: <strong className="text-primary">{order.status || 'Processing'}</strong></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Summary & Address */}
                    <div className="col-lg-4">

                        {/* Address */}
                        <div className="detail-card">
                            <h5>Shipping Address</h5>
                            <p className="fw-bold mb-1">{address.firstName} {address.lastName}</p>
                            <p className="text-muted small mb-1">{address.address}</p>
                            <p className="text-muted small mb-1">{address.city} {address.zip}</p>
                            <p className="text-muted small mb-0">{address.phone}</p>
                        </div>

                        {/* Cost Summary */}
                        <div className="detail-card">
                            <h5>Order Summary</h5>
                            <div className="d-flex justify-content-between mb-2 text-muted">
                                <span>Subtotal</span>
                                <span>Rs {itemsTotal.toLocaleString()}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2 text-muted">
                                <span>Shipping</span>
                                {shippingConfig.shippingCost === 0 ? (
                                    <span className="text-success fw-bold">Free</span>
                                ) : (
                                    <span>Rs {shippingConfig.shippingCost}</span>
                                )}
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between fw-bold fs-5">
                                <span>Total</span>
                                <span>Rs {TotalwithShipping.toLocaleString()}</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </>
    );
};

export default OrderDetails;