import React, { useEffect, useState } from 'react';
import { fetchAllReviews, approveReview, rejectReview, deleteReview } from '../api'; // Adjust path to api.js
import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';

const ReviewList = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // --- FETCH DATA ---
    const loadReviews = async () => {
        setLoading(true);
        try {
            const data = await fetchAllReviews(currentPage);
            setReviews(data.reviews || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error("Failed to load reviews", error);
            toast.error("Failed to load reviews");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReviews();
    }, [currentPage]);

    // --- HANDLERS ---
    const handleApprove = async (id) => {
        try {
            await approveReview(id);
            toast.success("Review Approved");
            loadReviews(); // Refresh list
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleReject = async (id) => {
        try {
            await rejectReview(id);
            toast.success("Review Rejected");
            loadReviews();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this review?")) {
            try {
                await deleteReview(id);
                toast.success("Review Deleted");
                loadReviews();
            } catch (error) {
                toast.error(error.message);
            }
        }
    };

    // Helper for status badge color
    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Rejected': return 'danger';
            default: return 'warning text-dark'; // Waiting Approval
        }
    };

    return (
        <div className="admin-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold">Reviews</h2>
            </div>

            <div className="table-responsive bg-white rounded shadow-sm border">
                <table className="table table-hover mb-0 align-middle">
                    <thead className="bg-light">
                        <tr>
                            <th className="py-3 ps-4">Product</th>
                            <th className="py-3">User</th>
                            <th className="py-3">Rating</th>
                            <th className="py-3">Review</th>
                            <th className="py-3">Status</th>
                            <th className="py-3 text-end pe-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            // Skeleton Loading Rows
                            [...Array(5)].map((_, i) => (
                                <tr key={i}>
                                    <td className="ps-4"><Skeleton width={120} /></td>
                                    <td><Skeleton width={100} /></td>
                                    <td><Skeleton width={80} /></td>
                                    <td><Skeleton width={200} /></td>
                                    <td><Skeleton width={80} /></td>
                                    <td className="text-end pe-4"><Skeleton width={100} /></td>
                                </tr>
                            ))
                        ) : reviews.length > 0 ? (
                            reviews.map((rev) => (
                                <tr key={rev._id}>
                                    {/* Product Name */}
                                    <td className="ps-4 fw-bold text-dark">
                                        {rev.product ? rev.product.name : <span className="text-danger">Deleted Product</span>}
                                    </td>

                                    {/* User Name */}
                                    <td>{rev.user ? rev.user.firstName : 'Anonymous'}</td>

                                    {/* Rating Stars */}
                                    <td>
                                        <div className="text-warning small">
                                            {[...Array(5)].map((_, i) => (
                                                <i key={i} className={`fa ${i < rev.rating ? 'fa-star' : 'fa-star-o'}`}></i>
                                            ))}
                                        </div>
                                    </td>

                                    {/* Review Text (Truncated) */}
                                    <td style={{ maxWidth: '300px' }} title={rev.review}>
                                        <div className="text-truncate">
                                            <strong>{rev.title}</strong> - {rev.review}
                                        </div>
                                    </td>

                                    {/* Status Badge */}
                                    <td>
                                        <span className={`badge bg-${getStatusBadge(rev.status)} rounded-pill px-3`}>
                                            {rev.status}
                                        </span>
                                    </td>

                                    {/* Actions Buttons */}
                                    <td className="text-end pe-4">
                                        <div className="d-flex gap-2 justify-content-end">
                                            {rev.status !== 'Approved' && (
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    onClick={() => handleApprove(rev._id)}
                                                    title="Approve"
                                                >
                                                    <i className="fa fa-check"></i>
                                                </button>
                                            )}

                                            {rev.status !== 'Rejected' && (
                                                <button
                                                    className="btn btn-sm btn-warning text-white"
                                                    onClick={() => handleReject(rev._id)}
                                                    title="Reject"
                                                >
                                                    <i className="fa fa-ban"></i>
                                                </button>
                                            )}

                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDelete(rev._id)}
                                                title="Delete"
                                            >
                                                <i className="fa fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-5 text-muted">
                                    No reviews found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination (Simple) */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4 gap-2">
                    <button
                        className="btn btn-outline-dark btn-sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                        Previous
                    </button>
                    <span className="align-self-center text-muted small">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        className="btn btn-outline-dark btn-sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReviewList;