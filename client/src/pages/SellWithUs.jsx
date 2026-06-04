import React from "react";

const SellWithUs = () => {
    return (
        <>


            {/* --- SECTION 1: HERO BANNER --- */}
            <div className="sell-hero">
                <div className="hero-content">
                    <h1 className="display-4 fw-bold">Sell on BagsVerse</h1>
                    <p className="lead fs-5 mb-0">
                        Reach millions of customers and grow your business with Pakistan's premium fashion marketplace.
                    </p>
                </div>
            </div>

            <div className="container">

                {/* --- SECTION 2: WHY CHOOSE US (Benefits) --- */}
                <div className="row mb-5 pb-4">
                    <div className="col-12 text-center mb-5">
                        <h2 className="fw-bold">Why Sell With Us?</h2>
                        <div className="bg-dark mx-auto mt-3" style={{ width: '60px', height: '3px' }}></div>
                    </div>

                    <div className="col-md-4 mb-4">
                        <div className="benefit-card">
                            <div className="icon-wrapper">
                                <i className="fa fa-users"></i>
                            </div>
                            <h5>Massive Reach</h5>
                            <p>Get access to a growing database of fashion-conscious customers looking for premium bags and accessories.</p>
                        </div>
                    </div>

                    <div className="col-md-4 mb-4">
                        <div className="benefit-card">
                            <div className="icon-wrapper">
                                <i className="fa fa-money"></i>
                            </div>
                            <h5>Low Commission</h5>
                            <p>Enjoy competitive commission rates and transparent pricing. You only pay when you make a sale.</p>
                        </div>
                    </div>

                    <div className="col-md-4 mb-4">
                        <div className="benefit-card">
                            <div className="icon-wrapper">
                                <i className="fa fa-truck"></i>
                            </div>
                            <h5>Easy Logistics</h5>
                            <p>We handle the shipping or partner with top courier services to ensure your products reach customers safely.</p>
                        </div>
                    </div>
                </div>

                <hr className="my-5 opacity-25" />

                {/* --- SECTION 3: REGISTRATION FORM --- */}
                <div className="row justify-content-center mb-5 pb-5">
                    <div className="col-lg-8">
                        <div className="text-center mb-5">
                            <h2 className="fw-bold">Become a Seller</h2>
                            <p className="text-muted">Fill out the form below and our vendor team will contact you within 24 hours.</p>
                        </div>

                        {/* Reusing 'contact-card' style for consistency */}
                        <div className="contact-card">
                            <form onSubmit={(e) => e.preventDefault()}>

                                {/* Business Info */}
                                <h5 className="mb-4 pb-2 border-bottom">Business Information</h5>
                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3 mb-md-0">
                                        <label className="form-label">Brand / Business Name*</label>
                                        <input type="text" className="form-control" placeholder="e.g. Luxe Leather" required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Business Type*</label>
                                        <select className="form-select" required>
                                            <option value="" disabled selected>Select type</option>
                                            <option value="manufacturer">Manufacturer</option>
                                            <option value="retailer">Retailer / Reseller</option>
                                            <option value="wholesaler">Wholesaler</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Personal Info */}
                                <h5 className="mb-4 pb-2 border-bottom mt-4">Contact Details</h5>
                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3 mb-md-0">
                                        <label className="form-label">Contact Person Name*</label>
                                        <input type="text" className="form-control" placeholder="Full Name" required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Phone Number (WhatsApp)*</label>
                                        <input type="tel" className="form-control" placeholder="+92 300 0000000" required />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Email Address*</label>
                                    <input type="email" className="form-control" placeholder="name@business.com" required />
                                </div>

                                {/* Product Info */}
                                <h5 className="mb-4 pb-2 border-bottom mt-4">Product Details</h5>
                                <div className="mb-3">
                                    <label className="form-label">Which category do you sell?*</label>
                                    <select className="form-select" required>
                                        <option value="" disabled selected>Select category</option>
                                        <option value="handbags">Handbags & Totes</option>
                                        <option value="backpacks">Backpacks</option>
                                        <option value="travel">Travel & Luggage</option>
                                        <option value="accessories">Wallets & Accessories</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label">Portfolio / Social Media Link (Optional)</label>
                                    <input type="url" className="form-control" placeholder="Instagram or Website Link" />
                                </div>

                                <div className="mb-4">
                                    <label className="form-label">Tell us about your brand</label>
                                    <textarea className="form-control" rows="4" placeholder="Briefly describe your products and pricing range..."></textarea>
                                </div>

                                {/* Submit */}
                                <button className="btn-submit-contact mt-3" type="submit">
                                    Submit Application
                                </button>

                            </form>
                        </div>
                    </div>
                </div>

            </div>

        </>
    );
};

export default SellWithUs;