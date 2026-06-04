import React, { useState, useEffect } from 'react';
import { Container, Button, Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { addReview, fetchReviewsBySlug } from '../api';
import toast from 'react-hot-toast';
import '../styles/main.scss';

const ProductReviews = ({ productId, productSlug }) => {
    const user = useSelector(state => state.handleUser.user); // Get logged in user

    const [reviews, setReviews] = useState([]);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [title, setTitle] = useState("");
    const [review, setReview] = useState("");
    const [loading, setLoading] = useState(false);

    // --- FETCH REVIEWS ---
    useEffect(() => {
        const loadReviews = async () => {
            if (productSlug) {
                try {
                    const data = await fetchReviewsBySlug(productSlug);
                    setReviews(data);
                } catch (error) {
                    console.error("Error loading reviews", error);
                }
            }
        };
        loadReviews();
    }, [productSlug]);

    // --- SUBMIT REVIEW ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error("You must be logged in to write a review.");
            return;
        }

        if (rating === 0) {
            toast.error("Please select a rating.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                product: productId,
                title,
                review,
                rating,
                isRecommended: rating >= 3
            };

            const response = await addReview(payload);
            toast.success(response.message || "Review submitted for approval!");

            // Reset Form
            setTitle("");
            setReview("");
            setRating(0);
            setShowForm(false);

        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Helper to render stars
    const renderStars = (count) => {
        return [...Array(5)].map((_, i) => (
            <i key={i} className={`fa ${i < count ? 'fa-star' : 'fa-star-o'} text-danger`}></i>
        ));
    };

    // Helper to format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <Container className="py-5 border-top" id="reviews">
            {/* --- HEADER --- */}
            <h3 className="text-center mb-4 text-dark fw-normal">Customer Reviews</h3>

            {/* --- SUMMARY SECTION --- */}
            <div className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-4 mb-5">
                <div className="text-center">
                    <div className="text-danger fs-4 mb-1">
                        {/* Show average rating if available, else empty stars */}
                        {reviews.length > 0 ? (
                            renderStars(Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length))
                        ) : (
                            renderStars(0)
                        )}
                    </div>
                    <p className="text-muted mb-0">
                        {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                    </p>
                </div>

                <div className="d-none d-md-block" style={{ borderRight: '1px solid #ddd', height: '50px' }}></div>

                <div>
                    <Button
                        className="btn-red px-5 py-2 fw-bold"
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? 'Cancel review' : 'Write a review'}
                    </Button>
                </div>
            </div>

            {/* --- REVIEW FORM --- */}
            {showForm && (
                <div className="review-form-container mx-auto p-4 border rounded-3 bg-white mb-5" style={{ maxWidth: '600px' }}>
                    <h4 className="text-center mb-1">Write a review</h4>
                    <p className="text-center text-muted mb-3">Rating</p>

                    <div className="text-center mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <i
                                key={star}
                                className={`fa ${star <= (hoverRating || rating) ? 'fa-star' : 'fa-star-o'} fs-3 mx-1 cursor-pointer text-danger`}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                                style={{ cursor: 'pointer' }}
                            ></i>
                        ))}
                    </div>

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="small text-muted">Review Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Give your review a title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="small text-muted">Review content</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                placeholder="Start writing here..."
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <div className="d-flex justify-content-center gap-3">
                            <Button
                                variant="outline-danger"
                                className="px-4 fw-bold rounded-0"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel review
                            </Button>
                            <Button
                                className="btn-red px-4 fw-bold"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Submitting...' : 'Submit Review'}
                            </Button>
                        </div>
                    </Form>
                </div>
            )}

            {/* --- REVIEWS LIST --- */}
            <div className="reviews-list mx-auto" style={{ maxWidth: '800px' }}>
                {reviews.length > 0 ? (
                    reviews.map((rev) => (
                        <div key={rev._id} className="border-bottom py-4">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <div className="text-danger mb-2" style={{ fontSize: '0.9rem' }}>
                                        {renderStars(rev.rating)}
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <i className="fa fa-user-circle fs-4 text-muted"></i>
                                        <span className="fw-bold text-danger">
                                            {rev.user ? rev.user.firstName : 'Anonymous'}
                                        </span>
                                    </div>
                                </div>
                                <small className="text-muted">{formatDate(rev.created)}</small>
                            </div>

                            <h5 className="fw-bold" style={{ fontSize: '1rem' }}>{rev.title}</h5>
                            <p className="text-muted mb-0" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                                {rev.review}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-muted">No reviews yet. Be the first to write one!</p>
                )}
            </div>

        </Container>
    );
};

export default ProductReviews;