import React, { useEffect, useState, useRef } from 'react';
import { Container, Card, Table, Badge, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import { useLocation } from 'react-router-dom'; // Import useLocation
import { fetchAllOrders, updateOrderStatus } from '../api';

const Orders = () => {
    const location = useLocation(); // Hook to get navigation state
    const highlightId = location.state?.highlightId; // The ID to highlight
    console.log("Highlight ID:", highlightId); // Debugging line
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Ref to scroll to the highlighted item
    const rowRefs = useRef({});

    const loadOrders = async () => {
        setLoading(true);
        try {
            const data = await fetchAllOrders(currentPage);
            const rawOrders = Array.isArray(data) ? data : (data.orders || []);

            const mappedOrders = rawOrders.map(order => ({
                _id: order._id,
                user: {
                    name: `${order.shippingAddress?.firstName || 'Guest'} ${order.shippingAddress?.lastName || ''}`,
                    email: order.shippingAddress?.email || 'N/A'
                },
                total: order.total || 0,
                status: order.status || 'Processing',
                created: order.created,
                items: order.products?.map(p => ({
                    name: p.product?.name || 'Unknown Product',
                    price: p.product?.price || 0,
                    qty: p.quantity || 0,
                    img: p.product?.imageUrl || 'https://via.placeholder.com/50'
                })) || [],
                shippingAddress: order.shippingAddress || { address: 'N/A', city: 'N/A', phone: 'N/A' }
            }));

            setOrders(mappedOrders);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error("Failed to load orders", error);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, [currentPage, highlightId]);

    // --- SCROLL TO HIGHLIGHTED ITEM ---
    useEffect(() => {
        if (highlightId && !loading && rowRefs.current[highlightId]) {
            // Scroll into view
            rowRefs.current[highlightId].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [highlightId, loading, orders]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Processing': return 'warning text-dark';
            case 'Shipped': return 'info text-dark';
            case 'Delivered': return 'success';
            case 'Cancelled': return 'danger';
            default: return 'secondary';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateOrderStatus(id, newStatus);
            toast.success(`Order status updated to ${newStatus}`);
            loadOrders();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    const filteredOrders = orders.filter(order => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        const orderId = order._id.toLowerCase();
        const displayId = order._id.substring(0, 6).toLowerCase();
        const date = formatDate(order.created).toLowerCase();
        const status = order.status.toLowerCase();

        return orderId.includes(term) || displayId.includes(term) || date.includes(term) || status.includes(term);
    });

    return (
        <div className="admin-container">
            <div className="d-flex flex-column gap-3 gap-md-0 justify-content-start flex-md-row justify-content-md-between align-items-md-center mb-4">
                <h2 className="fw-bold mb-0">Orders</h2>
                <div style={{ minWidth: '250px' }} className='align-self-end'>
                    <Form.Control
                        type="text"
                        placeholder="Search ID, Date, Status..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="shadow-sm"
                    />
                </div>
            </div>

            <Card className="border-0 shadow-sm rounded-3">
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table hover className="mb-0 align-middle">
                            <thead className="bg-light text-muted small text-uppercase">
                                <tr>
                                    <th className="ps-4 py-3">Order ID</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                    <th className="text-end pe-4">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i}>
                                            <td className="ps-4"><Skeleton width={80} /></td>
                                            <td><Skeleton width={120} /></td>
                                            <td><Skeleton width={80} /></td>
                                            <td><Skeleton width={60} /></td>
                                            <td><Skeleton width={100} /></td>
                                            <td><Skeleton width={80} /></td>
                                            <td className="text-end pe-4"><Skeleton circle width={30} height={30} /></td>
                                        </tr>
                                    ))
                                ) : filteredOrders.length > 0 ? (
                                    filteredOrders.map((order) => (
                                        <tr
                                            key={order._id}
                                            ref={el => rowRefs.current[order._id] = el} // Ref for scrolling
                                            className={order._id.toString() === highlightId?.toString() ? "bg-highlight" : ""} // Highlight Style
                                            style={order._id.toString() === highlightId?.toString() ? { boxShadow: "inset 4px 0 0 #d4b86a" } : {}}
                                        >
                                            <td className="ps-4 fw-bold">#{order._id.substring(0, 6).toUpperCase()}</td>
                                            <td>
                                                <div className="d-flex flex-column">
                                                    <span className="fw-bold text-dark">{order.user.name}</span>
                                                    <small className="text-muted">{order.user.email}</small>
                                                </div>
                                            </td>
                                            <td>{formatDate(order.created)}</td>
                                            <td className="fw-bold">Rs {(order.total || 0).toLocaleString()}</td>
                                            <td>
                                                <Form.Select
                                                    size="sm"
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                    className={`border-${getStatusBadge(order.status).split(' ')[0]} bg-white fw-bold`}
                                                    style={{ width: '130px', fontSize: '0.85rem' }}
                                                >
                                                    <option value="Processing">Processing</option>
                                                    <option value="Shipped">Shipped</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </Form.Select>
                                            </td>
                                            <td>
                                                {order.status === 'Processing' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline-primary"
                                                        className="py-0 rounded-pill px-3"
                                                        onClick={() => handleStatusChange(order._id, 'Shipped')}
                                                    >
                                                        Mark Shipped
                                                    </Button>
                                                )}
                                            </td>
                                            <td className="text-end pe-4">
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    className="rounded-circle border"
                                                    onClick={() => handleViewDetails(order)}
                                                    title="View Details"
                                                >
                                                    <i className="fa fa-eye"></i>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5 text-muted">No orders found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* --- ORDER DETAILS MODAL --- */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                {selectedOrder && (
                    <>
                        <Modal.Header closeButton className="border-0 pb-0">
                            <Modal.Title className="fw-bold h5">
                                Order Details
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="p-4 pt-2">
                            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                                <div>
                                    <span className="text-muted small text-uppercase">Order ID</span>
                                    <h5 className="mb-0">#{selectedOrder._id.toUpperCase()}</h5>
                                </div>
                                <Badge bg={getStatusBadge(selectedOrder.status).split(' ')[0]} className="px-3 py-2 fs-6">
                                    {selectedOrder.status}
                                </Badge>
                            </div>

                            <Row className="mb-4">
                                <Col md={6}>
                                    <h6 className="fw-bold text-dark mb-3">Customer Info</h6>
                                    <p className="mb-1 text-muted small">NAME</p>
                                    <p className="fw-bold mb-2">{selectedOrder.user.name}</p>
                                    <p className="mb-1 text-muted small">EMAIL</p>
                                    <p className="fw-bold mb-2">{selectedOrder.user.email}</p>
                                    <p className="mb-1 text-muted small">PHONE</p>
                                    <p className="fw-bold mb-0">{selectedOrder.shippingAddress.phone || 'N/A'}</p>
                                </Col>
                                <Col md={6}>
                                    <h6 className="fw-bold text-dark mb-3">Shipping Address</h6>
                                    <div className="bg-light p-3 rounded">
                                        <p className="mb-1 fw-bold">{selectedOrder.shippingAddress.address}</p>
                                        <p className="mb-0">
                                            {selectedOrder.shippingAddress.city} {selectedOrder.shippingAddress.zip ? `, ${selectedOrder.shippingAddress.zip}` : ''}
                                        </p>
                                    </div>
                                </Col>
                            </Row>

                            <h6 className="fw-bold text-dark mb-3">Items</h6>
                            <div className="border rounded p-3 mb-3">
                                {selectedOrder.items.map((item, idx) => (
                                    <div key={idx} className="d-flex align-items-center mb-3 last:mb-0">
                                        <img
                                            src={item.img}
                                            alt={item.name}
                                            className="rounded border bg-white"
                                            style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                                            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/60" }}
                                        />
                                        <div className="ms-3 flex-grow-1">
                                            <h6 className="mb-1 fw-bold text-dark" style={{ fontSize: '0.95rem' }}>{item.name}</h6>
                                            <small className="text-muted">Rs {(item.price || 0).toLocaleString()}</small>
                                        </div>
                                        <div className="fw-bold text-muted me-4">
                                            x{item.qty}
                                        </div>
                                        <div className="fw-bold text-end" style={{ minWidth: '80px' }}>
                                            Rs {((item.price || 0) * (item.qty || 1)).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="d-flex justify-content-end">
                                <div style={{ minWidth: '200px' }}>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Total</span>
                                        <span className="fw-bold fs-5">Rs {(selectedOrder.total || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                        </Modal.Body>
                        <Modal.Footer className="border-0 pt-0">
                            <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                        </Modal.Footer>
                    </>
                )}
            </Modal>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4 gap-2">
                    <button className="btn btn-outline-dark btn-sm" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Prev</button>
                    <span className="align-self-center small">Page {currentPage} of {totalPages}</span>
                    <button className="btn btn-outline-dark btn-sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
                </div>
            )}
        </div>
    );
};

export default Orders;