import React, { useState } from "react";

import { Link } from "react-router-dom";
import { submitContact } from "../api"; // Import the API
import toast from "react-hot-toast";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await submitContact(formData);
      toast.success(response.message || "Message sent successfully!");

      // Clear form
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Contact Error:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>


      <div className="container my-5 py-4">
        <div className="row">

          {/* --- LEFT COLUMN: TEXT CONTENT --- */}
          <div className="col-md-5 mb-5 mb-md-0 d-flex flex-column justify-content-start pt-3">
            <h1 className="fw-bold display-5 mb-3">Contact Us</h1>
            <h3 className="fw-normal text-muted mb-4">How can we help you?</h3>
            <p className="lead text-muted fs-6" style={{ maxWidth: "400px", lineHeight: "1.8" }}>
              We're here to help and answer any question you might have.
              We look forward to hearing from you.
            </p>
          </div>

          {/* --- RIGHT COLUMN: THE FORM CARD --- */}
          <div className="col-md-7">
            <div className="contact-card">
              <form onSubmit={handleSubmit}>

                {/* Name (Combined to match backend 'name') */}
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Full Name*</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email*</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Message */}
                <div className="mb-4">
                  <label htmlFor="message" className="form-label">Message*</label>
                  <textarea
                    className="form-control"
                    id="message"
                    rows="5"
                    placeholder="Tell us more about your inquiry..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                {/* Button */}
                <div className="text-center">
                  <button
                    className="btn-submit-contact"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <span><i className="fa fa-spinner fa-spin me-2"></i> Sending...</span>
                    ) : (
                      <span><i className="fa fa-paper-plane me-2"></i> Send Message</span>
                    )}
                  </button>
                </div>

                {/* Disclaimer Text */}
                <p className="text-muted text-center mt-3" style={{ fontSize: "0.8rem" }}>
                  By submitting this form, you agree to our <Link to="/privacy" className="text-dark text-decoration-underline">Privacy Policy</Link>.
                </p>

              </form>
            </div>
          </div>

        </div>
      </div>


    </>
  );
};

export default ContactPage;