import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, InputGroup } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { fetchShippingConfig, saveShippingConfig } from '../api';

const CustomShipping = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // State
    const [mode, setMode] = useState('fixed'); // free, fixed, custom
    const [cost, setCost] = useState(250);
    const [thresholdActive, setThresholdActive] = useState(true);
    const [thresholdValue, setThresholdValue] = useState(7999);
    const [bankDepositMessage, setBankDepositMessage] = useState('');

    // --- FETCH DATA ---
    useEffect(() => {
        const loadConfig = async () => {
            try {
                const data = await fetchShippingConfig();
                if (data) {
                    setMode(data.shippingMode);
                    setCost(data.shippingCost);
                    setThresholdActive(data.isThresholdActive);
                    setThresholdValue(data.thresholdValue);
                    setBankDepositMessage(data.bankDepositMessage || '');
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to load shipping settings");
            } finally {
                setLoading(false);
            }
        };
        loadConfig();
    }, []);

    // --- HANDLE SAVE ---
    const handleSave = async () => {
        setSaving(true);
        try {
            // Logic: If fixed, ensure cost is 250. If free, cost is 0.
            let finalCost = cost;
            if (mode === 'fixed') finalCost = 250;
            if (mode === 'free') finalCost = 0;

            const payload = {
                shippingMode: mode,
                shippingCost: finalCost,
                isThresholdActive: thresholdActive,
                thresholdValue: thresholdValue,
                bankDepositMessage: bankDepositMessage
            };

            await saveShippingConfig(payload);
            toast.success("Shipping Settings Updated!");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="admin-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">Custom Shipping</h2>
            </div>

            <div className="row justify-content-center">
                <div className="col-lg-10">

                    {/* --- SHIPPING COST CARD --- */}
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="bg-white py-3">
                            <h5 className="mb-0 fw-bold">Base Shipping Charges</h5>
                        </Card.Header>
                        <Card.Body className="p-4">

                            {/* Option 1: Free Shipping */}
                            <div className="mb-3 p-3 border rounded d-flex align-items-center bg-light">
                                <Form.Check
                                    type="radio"
                                    id="mode-free"
                                    label={<span className="fw-bold ms-2">Free Shipping</span>}
                                    name="shippingMode"
                                    checked={mode === 'free'}
                                    onChange={() => { setMode('free'); setCost(0); }}
                                    className="mb-0"
                                />
                                <span className="ms-auto badge bg-success">Free</span>
                            </div>

                            {/* Option 2: Fixed Shipping */}
                            <div className="mb-3 p-3 border rounded d-flex align-items-center bg-light">
                                <Form.Check
                                    type="radio"
                                    id="mode-fixed"
                                    label={
                                        <span className="fw-bold ms-2">
                                            Fixed Shipping
                                            <span className="text-muted fw-normal ms-2">(Standard Rate)</span>
                                        </span>
                                    }
                                    name="shippingMode"
                                    checked={mode === 'fixed'}
                                    onChange={() => { setMode('fixed'); setCost(250); }}
                                    className="mb-0"
                                />
                                <span className="ms-auto badge bg-dark">Rs 250</span>
                            </div>

                            {/* Option 3: Custom Shipping */}
                            <div className={`mb-3 p-3 border rounded ${mode === 'custom' ? 'border-primary' : ''}`}>
                                <div className="d-flex align-items-center">
                                    <Form.Check
                                        type="radio"
                                        id="mode-custom"
                                        label={<span className="fw-bold ms-2">Custom Shipping</span>}
                                        name="shippingMode"
                                        checked={mode === 'custom'}
                                        onChange={() => setMode('custom')}
                                        className="mb-0"
                                    />
                                </div>

                                {/* Custom Input (Only shows if Custom selected) */}
                                {mode === 'custom' && (
                                    <div className="mt-3 ps-4">
                                        <InputGroup>
                                            <InputGroup.Text>Rs</InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                value={cost}
                                                onChange={(e) => setCost(Number(e.target.value))}
                                                placeholder="Enter amount"
                                            />
                                        </InputGroup>
                                        <Form.Text className="text-muted">
                                            Admin defined shipping cost applied to all orders.
                                        </Form.Text>
                                    </div>
                                )}
                            </div>

                        </Card.Body>
                    </Card>

                    {/* --- THRESHOLD CARD --- */}
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="bg-white py-3">
                            <h5 className="mb-0 fw-bold">Free Shipping Threshold</h5>
                        </Card.Header>
                        <Card.Body className="p-4">

                            <Form.Check
                                type="switch"
                                id="threshold-switch"
                                label="Enable Free Shipping on large orders"
                                checked={thresholdActive}
                                onChange={(e) => setThresholdActive(e.target.checked)}
                                className="mb-3 fw-bold"
                            />

                            <div className={!thresholdActive ? "opacity-50" : ""}>
                                <Form.Label>Free Shipping above amount:</Form.Label>
                                <InputGroup className="mb-2">
                                    <InputGroup.Text>Rs</InputGroup.Text>
                                    <Form.Control
                                        type="number"
                                        value={thresholdValue}
                                        onChange={(e) => setThresholdValue(Number(e.target.value))}
                                        disabled={!thresholdActive}
                                    />
                                </InputGroup>
                                <Form.Text className="text-muted">
                                    If cart total exceeds <strong>Rs {thresholdValue}</strong>, shipping will be free automatically.
                                </Form.Text>
                            </div>

                        </Card.Body>
                    </Card>

                    {/* --- BANK DEPOSIT MESSAGE CARD --- */}
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="bg-white py-3">
                            <h5 className="mb-0 fw-bold">Bank Deposit Message</h5>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Form.Group>
                                <Form.Label>Message for Bank Deposit / Online Payment</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={bankDepositMessage}
                                    onChange={(e) => setBankDepositMessage(e.target.value)}
                                    placeholder="e.g. If you pay online via bank deposit, shipping is free."
                                />
                                <Form.Text className="text-muted">
                                    This message will be displayed to the user during checkout if Bank Deposit is available.
                                </Form.Text>
                            </Form.Group>
                        </Card.Body>
                    </Card>

                    {/* --- SUBMIT --- */}
                    <div className="text-end">
                        <Button
                            className="btn-dark px-5 py-2 fw-bold"
                            onClick={handleSave}
                            disabled={loading || saving}
                        >
                            {saving ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CustomShipping;