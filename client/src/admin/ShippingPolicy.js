import React, { useState, useEffect } from 'react';
import { fetchShippingPolicy, saveShippingPolicy } from '../api';
import toast from 'react-hot-toast';

const ShippingPolicy = () => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // --- FETCH DATA ---
    useEffect(() => {
        const loadPolicy = async () => {
            try {
                const text = await fetchShippingPolicy();
                setContent(text || ''); // Set text or empty string
            } catch (error) {
                console.error("Error loading policy", error);
                toast.error("Failed to load policy");
            } finally {
                setLoading(false);
            }
        };
        loadPolicy();
    }, []);

    // --- HANDLE SAVE ---
    const handleSave = async () => {
        if (!content.trim()) {
            toast.error("Policy content cannot be empty.");
            return;
        }

        setSaving(true);
        try {
            await saveShippingPolicy(content);
            toast.success("Shipping Policy Updated Successfully!");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="admin-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">Shipping Policy Management</h2>
            </div>

            <div className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-4">
                    <h5 className="mb-3 fw-bold">Edit Policy Content</h5>
                    <p className="text-muted small mb-4">
                        The text you enter here will be displayed on the public Shipping Policy page. You can use simple text formatting.
                    </p>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-dark" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                            <div className="mb-4">
                                <textarea
                                    className="form-control"
                                    rows="12"
                                    placeholder="Enter your shipping policy details here..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    style={{
                                        fontSize: '0.95rem',
                                        lineHeight: '1.6',
                                        resize: 'vertical',
                                        border: '1px solid #ced4da'
                                    }}
                                ></textarea>
                            </div>

                            <div className="d-flex justify-content-end">
                                <button
                                    type="submit"
                                    className="btn btn-dark px-5 py-2 fw-bold"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <span><i className="fa fa-spinner fa-spin me-2"></i> Saving...</span>
                                    ) : (
                                        <span><i className="fa fa-save me-2"></i> Save Changes</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShippingPolicy;