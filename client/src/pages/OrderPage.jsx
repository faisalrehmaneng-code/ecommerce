import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { fetchMyOrders } from "../api";
import Skeleton from "react-loading-skeleton";

const OrderPage = () => {
    // Sidebar Active State
    const location = useLocation();
    const currentPath = location.pathname;

    // --- STATE ---
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("All Orders");
    const [searchQuery, setSearchQuery] = useState(""); // <--- NEW STATE FOR SEARCH

    // --- FETCH ORDERS FROM API ---
    useEffect(() => {
        const loadOrders = async () => {
            setLoading(true);

            try {
                const data = await fetchMyOrders();
                console.log("Fetched Orders:", data); // Debugging line
                // Transform Backend Data to UI Structure
                const formattedOrders = data.map(order => ({
                    id: order._id,
                    // Format Date
                    date: new Date(order.created).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                    }),
                    total: order.total,
                    status: order.status === 'Not processed' ? 'Processing' : (order.status || 'Processing'),
                    itemCount: order.products.length,
                    items: order.products.map(item =>
                        item.product?.imageUrl || item.product?.images?.[0]?.imageUrl || "https://via.placeholder.com/60?text=No+Image"
                    )
                }));

                setOrders(formattedOrders.reverse());
            } catch (error) {
                console.error("Failed to load orders:", error);
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, []);

    // --- UPDATED FILTER LOGIC ---
    const filteredOrders = orders.filter(order => {
        // 1. Check Tab Match
        const matchTab = activeTab === "All Orders" || order.status === activeTab;

        // 2. Check Search Match (Case insensitive)
        const matchSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());

        // Return true only if BOTH match
        return matchTab && matchSearch;
    });

    // Status Badge Helper
    const getBadgeStyle = (status) => {
        switch (status) {
            case 'Processing': return 'bg-primary bg-opacity-10 text-primary';
            case 'Shipped': return 'bg-info bg-opacity-10 text-info';
            case 'Delivered': return 'bg-success bg-opacity-10 text-success';
            case 'Cancelled': return 'bg-danger bg-opacity-10 text-danger';
            default: return 'bg-secondary bg-opacity-10 text-secondary';
        }
    };

    // --- LOADING COMPONENT ---
    const OrderSkeleton = () => (
        <div className="order-card-modern mb-3">
            <div className="p-3">
                <Skeleton height={20} width={200} className="mb-2" />
                <Skeleton height={15} width={150} />
                <div className="d-flex mt-3 gap-3">
                    <Skeleton height={60} width={60} />
                    <Skeleton height={60} width={60} />
                </div>
            </div>
        </div>
    );

    return (
        <>


            <div className="container my-5 py-4">

                {/* Page Title Row */}
                <div className="row mb-4">
                    <div className="col-12">
                        <h2 className="display-6 fw-bold">Order History</h2>
                        <p className="text-muted">Track, return, or buy things again.</p>
                    </div>
                </div>

                <div className="row">

                    {/* --- LEFT SIDEBAR --- */}
                    <div className="col-lg-3 col-md-4 mb-4">
                        <div className="account-sidebar shadow-sm">
                            <Link
                                to="/orders"
                                className={`sidebar-link ${currentPath === '/orders' ? 'active' : ''}`}
                            >
                                <span><i className="fa fa-shopping-bag me-2"></i> Orders</span>
                                <i className="fa fa-chevron-right small"></i>
                            </Link>

                            <Link
                                to="/account-details"
                                className="sidebar-link"
                            >
                                <span><i className="fa fa-user me-2"></i> Account Details</span>
                                <i className="fa fa-chevron-right small"></i>
                            </Link>

                            <Link to="/login" className="sidebar-link text-danger">
                                <span><i className="fa fa-sign-out me-2"></i> Logout</span>
                            </Link>
                        </div>
                    </div>

                    {/* --- RIGHT CONTENT (Orders) --- */}
                    <div className="col-lg-9 col-md-8">

                        {/* Header: Tabs & Filter */}
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">

                            {/* Tabs */}
                            <div className="status-tabs-container">
                                {["All Orders", "Processing", "Shipped", "Delivered", "Cancelled"].map(tab => (
                                    <button
                                        key={tab}
                                        className={`status-tab ${activeTab === tab ? 'active' : ''}`}
                                        onClick={() => setActiveTab(tab)}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Filter Input (NOW FUNCTIONAL) */}
                            <div className="mb-3 mb-md-0">
                                <input
                                    type="text"
                                    placeholder="Filter by order #"
                                    className="order-filter-input"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* --- ORDERS LIST --- */}
                        {loading ? (
                            <>
                                <OrderSkeleton />
                                <OrderSkeleton />
                                <OrderSkeleton />
                            </>
                        ) : filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                                <div key={order.id} className="order-card-modern">

                                    {/* Top Row */}
                                    <div className="card-top">
                                        <div className="d-flex align-items-center flex-wrap gap-2">
                                            {/* Show only first 8 chars of ID visually, but search works on full ID */}
                                            <span className="order-id">Order #{order.id.substring(0, 8).toUpperCase()}</span>
                                            <span className={`badge rounded-pill ${getBadgeStyle(order.status)} px-3 py-2`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="order-total-label">Total Amount</span>
                                            <span className="order-total-amount">Rs {order.total.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Meta Row */}
                                    <div className="order-meta">
                                        Placed on {order.date} • {order.itemCount} Items
                                    </div>

                                    {/* Bottom Row */}
                                    <div className="card-bottom">

                                        {/* Images */}
                                        <div className="img-group">
                                            {order.items.slice(0, 2).map((img, i) => (
                                                <img
                                                    key={i}
                                                    src={img}
                                                    alt="Product"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/60?text=?" }}
                                                />
                                            ))}
                                            {/* Show counter if more than 2 items */}
                                            {order.items.length > 2 && (
                                                <div className="more-count">+{order.items.length - 2}</div>
                                            )}
                                        </div>

                                        {/* Buttons inside OrderPage.jsx */}
                                        <div className="d-flex gap-2">
                                            {order.status === 'Delivered' ? (
                                                <>
                                                    <Link to={`/order/${order.id}`} className="btn-outline-custom text-decoration-none">
                                                        View Details
                                                    </Link>
                                                    <Link to={`/product`} className=" text-decoration-none">
                                                        <button className="btn-gold">Buy Again</button>
                                                    </Link>

                                                </>
                                            ) : (
                                                <>
                                                    {/* View Details Link */}
                                                    <Link to={`/order/${order.id}`} className="btn-outline-custom text-decoration-none">
                                                        View Details
                                                    </Link>

                                                    {/* Track Order Link */}
                                                    <Link to={`/order/track/${order.id}`} className="btn-outline-custom text-decoration-none">
                                                        Track Order
                                                    </Link>
                                                </>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-5 border rounded bg-white">
                                <i className="fa fa-search fa-2x text-muted mb-3"></i>
                                <h5>No orders found</h5>
                                <p className="text-muted">
                                    {searchQuery ? `No orders match #${searchQuery}` : "You haven't placed any orders yet."}
                                </p>
                                {searchQuery && (
                                    <button
                                        className="btn btn-sm btn-outline-dark mt-2"
                                        onClick={() => setSearchQuery("")}
                                    >
                                        Clear Search
                                    </button>
                                )}
                                {!searchQuery && <Link to="/products" className="btn btn-dark mt-3">Start Shopping</Link>}
                            </div>
                        )}

                    </div>

                </div>
            </div>


        </>
    );
};

export default OrderPage;