import React, { useState, useEffect } from 'react';
import { Container, Tab, Tabs } from 'react-bootstrap';
import { fetchShippingPolicy } from '../api'; // Import the API function
import '../styles/main.scss';

const ProductTabs = ({ product }) => {
    const [shippingPolicy, setShippingPolicy] = useState("");
    const [loading, setLoading] = useState(true);

    // --- FETCH SHIPPING POLICY ---
    useEffect(() => {
        const getPolicy = async () => {
            try {
                const content = await fetchShippingPolicy();
                setShippingPolicy(content);
            } catch (error) {
                console.error("Failed to load shipping policy", error);
            } finally {
                setLoading(false);
            }
        };
        getPolicy();
    }, []);

    return (
        <Container fluid="lg" className="py-2">
            <Tabs
                defaultActiveKey="description"
                id="product-details-tabs"
                className="mb-4 custom-tabs"
            >
                {/* --- TAB 1: PRODUCT DESCRIPTION --- */}
                <Tab eventKey="description" title="Product Description" className='tabs' >
                    <div className="tab-content-wrapper">
                        {/* Description Text */}
                        <p className="mb-4 text-muted" style={{ whiteSpace: 'pre-wrap' }}>
                            {product.description}
                        </p>

                        {/* Size Details Heading */}
                        <h4 className="text-uppercase fw-bold mb-3">SIZE DETAILS :</h4>

                        {/* Bullet Points */}
                        <ul className="text-muted product-details-list">
                            <li className="mb-2">Measurements : <strong>Height :</strong> {product.height} " , <strong>Width :</strong> {product.width} " , <strong>Depth :</strong> {product.depth} "</li>
                            <li className="mb-2">Compartments : {product.compartments}</li>
                            <li className="mb-2">Small Pocket Inside : {product.innerPocket}</li>
                            <li className="mb-2">{product.baseDetails}</li>
                        </ul>
                    </div>
                </Tab>

                {/* --- TAB 2: SHIPPING POLICY (DYNAMIC) --- */}
                <Tab eventKey="shipping" title="Shipping Policy" className='tabs'>
                    <div className="tab-content-wrapper text-muted">

                        {loading ? (
                            <p>Loading policy...</p>
                        ) : shippingPolicy ? (
                            /* Display Dynamic Policy from Backend */
                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                                {shippingPolicy}
                            </div>
                        ) : (
                            /* Fallback if no policy set in backend */
                            <div>
                                <p className="mb-4">
                                    At BagsVerse, we are committed to providing a seamless and reliable shipping experience.
                                </p>
                                <h4 className="text-dark fw-bold mb-3">Order Processing Time</h4>
                                <ul className="mb-4">
                                    <li>All orders are processed within <strong>24-48 hours</strong> of confirmation.</li>
                                </ul>
                                <h4 className="text-dark fw-bold mb-3">Shipping Duration</h4>
                                <ul className="mb-4">
                                    <li>Delivery times vary based on your location (typically 3-5 business days).</li>
                                </ul>
                            </div>
                        )}

                    </div>
                </Tab>
            </Tabs>
        </Container>
    );
};

export default ProductTabs;