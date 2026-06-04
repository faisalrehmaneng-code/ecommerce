import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { subscribeToNewsletter } from '../api'; // Import the new API
import toast from 'react-hot-toast'; // For notifications

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const infoLinks = [
    { id: 0, name: 'Contact Us', to: '/contact' },
    // { id: 1, name: 'Sell With Us', to: '/sell' },
    { id: 2, name: 'Shipping', to: '/shipping' }
  ];

  const accountLinks = [
    { id: 0, name: 'Account Details', to: '/account-details' },
    { id: 1, name: 'Orders', to: '/orders' }
  ];

  // --- API HANDLER ---
  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await subscribeToNewsletter(email);
      toast.success(response.message || "Subscribed successfully!");
      setEmail(""); // Clear input on success
    } catch (error) {
      console.error("Newsletter Error:", error);
      toast.error(error.message || "Subscription failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- STYLES ---
  const footerStyle = {
    position: 'relative',
    backgroundImage:
      "url('https://media.istockphoto.com/id/2174548176/photo/fashionable-multi-colored-trendy-womens-bags-on-a-white-background-fashion-and-beauty-concept.jpg?s=612x612&w=0&k=20&c=hO_gtB60RBTHWM6MXG19XdEmZ9oocdKYK8K_X_h0i8k=')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: 'white',
    paddingTop: '2rem',
    paddingBottom: '2rem',
    zIndex: 0
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.89)',
    zIndex: 1
  };

  const contentStyle = {
    position: 'relative',
    zIndex: 2
  };

  const columnStyle = {
    borderRight: '1px solid rgba(255, 255, 255, 0.3)',
    paddingRight: '1rem'
  };

  const lastColumnStyle = {
    paddingRight: '0'
  };

  const linkStyle = {
    display: 'block',
    padding: '0.5rem 0',
    color: 'white',
    textDecoration: 'none'
  };

  const inputStyle = {
    height: '45px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '0.95rem',
    boxShadow: 'none'
  };

  const buttonStyle = {
    backgroundColor: '#121212',
    color: '#ffffff',
    border: '1px solid #ffffff',
    padding: '10px 24px',
    borderRadius: '4px',
    fontWeight: '600',
    fontSize: '0.95rem',
    marginTop: '10px',
    transition: 'all 0.3s ease',
    opacity: loading ? 0.7 : 1,
    cursor: loading ? 'not-allowed' : 'pointer'
  };

  return (
    <footer style={footerStyle}>
      <div style={overlayStyle}></div>
      <div className='container text-center text-md-start' style={contentStyle}>
        <div className='row'>

          {/* Customer Service Links */}
          <div className='col-md-6 mb-4' style={columnStyle}>
            <h5 className='text-uppercase'>Customer Service</h5>
            <ul className='list-unstyled'>
              {infoLinks.map(link => (
                <li key={link.id}>
                  <Link to={link.to} style={linkStyle}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links */}
          {/* <div className='col-md-4 mb-4' style={columnStyle}>
            <h5 className='text-uppercase'>Account</h5>
            <ul className='list-unstyled'>
              {accountLinks.map(link => (
                <li key={link.id}>
                  <Link to={link.to} style={linkStyle}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}

          {/* Newsletter Section */}
          <div className='col-md-6 mb-4' style={lastColumnStyle}>
            <h5 className='text-uppercase mb-3'>Newsletter</h5>

            <p style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '1.2rem', lineHeight: '1.6' }} className='px-3 px-sm-0'>
              Sign up to get updates on new arrivals, discounts, exclusive content, events and more!
            </p>

            {/* API Integration Form */}
            <form onSubmit={handleSubscribe}>
              <div className="mb-2 px-3 px-sm-0">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                  style={inputStyle}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <button type="submit" className="btn" style={buttonStyle} disabled={loading}>
                {loading ? 'Subscribing...' : 'Subscribe now'}
              </button>
            </form>
          </div>
        </div>

        {/* Logo & Social */}
        <div className='d-flex justify-content-center align-items-center my-3'>
          <Link to='/'>
            <img
              src='/assets/1-removebg-preview (1).png'
              alt='BagsVerse'
              style={{ width: '200px', objectFit: 'contain' }}
            />
          </Link>
        </div>

        {/* Copyright */}
        <div className='text-center pb-3'>
          <p className='mb-0'>
            © {new Date().getFullYear()} BagsVerse. Made with ❤️
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;