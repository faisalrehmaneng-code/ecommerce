import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import toast from 'react-hot-toast';
import '../styles/main.scss'; // Ensure we have the Hero styles
import { addBanner } from '../api';

const Banner = () => {
  // State to store preview URLs (Initialized with placeholders or empty)
  const [previews, setPreviews] = useState({
    main1: null,
    main2: null,
    left1: null,
    left2: null,
    right1: null,
    right2: null
  });

  // State to store actual files for API upload
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);

  // --- CONFIGURATION FOR SLOTS & DIMENSIONS ---
  const bannerConfig = {
    left1: { label: 'Left Top', w: 376, h: 221, key: 'left1' },
    left2: { label: 'Left Bottom', w: 376, h: 459, key: 'left2' },
    main1: { label: 'Main Top', w: 768, h: 459, key: 'main1' },
    main2: { label: 'Main Bottom', w: 768, h: 220, key: 'main2' },
    right1: { label: 'Right Top', w: 376, h: 459, key: 'right1' },
    right2: { label: 'Right Bottom', w: 376, h: 221, key: 'right2' }
  };

  // --- IMAGE VALIDATION FUNCTION ---
  const handleImageChange = (e, key) => {
    const file = e.target.files[0];
    if (!file) return;

    const config = bannerConfig[key];
    const reader = new FileReader();

    reader.onload = event => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        // STRICT VALIDATION
        if (img.naturalWidth === config.w && img.naturalHeight === config.h) {
          // Valid: Update State
          setPreviews(prev => ({ ...prev, [key]: img.src }));
          setFiles(prev => ({ ...prev, [key]: file }));
          toast.success(`${config.label} image added!`);
        } else {
          // Invalid: Reset Input & Alert
          e.target.value = null; // Clear input
          toast.error(
            `Error: Image must be exactly ${config.w}x${config.h}px. Uploaded: ${img.naturalWidth}x${img.naturalHeight}px`
          );
        }
      };
    };
    reader.readAsDataURL(file);
  };

  // --- SAVE HANDLER (Placeholder for API integration) ---
  const handleSaveBanners = async () => {
    setLoading(true);
    // Here you would wrap 'files' in FormData and send to backend
    const formData = new FormData();
    Object.keys(files).forEach(key => formData.append(key, files[key]));
    await addBanner(formData);

    setTimeout(() => {
      toast.success('Banners Updated Successfully!');
      setLoading(false);
    }, 1500);
  };

  // Helper to render placeholder if no image selected
  const renderImage = key => {
    if (previews[key]) {
      return (
        <img
          src={previews[key]}
          alt={key}
          className='img-fluid w-100 h-100 object-fit-cover'
        />
      );
    }
    return (
      <div className='d-flex align-items-center justify-content-center bg-light w-100 h-100 border text-muted'>
        <div className='text-center'>
          <small>{bannerConfig[key].label}</small>
          <br />
          <small>
            {bannerConfig[key].w} x {bannerConfig[key].h}
          </small>
        </div>
      </div>
    );
  };

  return (
    <div className='admin-container'>
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <h2 className='fw-bold mb-0'>Banner Management</h2>
        <Button
          className='btn-dark px-4'
          onClick={handleSaveBanners}
          disabled={loading || Object.keys(files).length === 0}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* ========================================= */}
      {/* 1. LIVE PREVIEW SECTION (Hero Layout)     */}
      {/* ========================================= */}
      <Card className='border-0 shadow-sm mb-5'>
        <div className='card-header bg-white py-3'>
          <h5 className='mb-0 fw-bold'>
            <i className='fa fa-eye me-2'></i> Live Preview
          </h5>
        </div>
        <div className='card-body'>
          {/* Replicating the exact structure from HeroSection.js */}
          <Container
            fluid='lg'
            className='hero-section'
            style={{ minHeight: 'auto' }}
          >
            <Row
              className='g-3 align-items-stretch'
              style={{ height: '500px' }}
            >
              {/* LEFT COLUMN (Short Top, Tall Bottom) */}
              <Col xs={4} className='d-flex flex-column gap-3'>
                <div className='hero-img-wrapper img-short flex-grow-1 overflow-hidden rounded-3'>
                  {renderImage('left1')}
                </div>
                <div className='hero-img-wrapper img-tall flex-grow-1 overflow-hidden rounded-3'>
                  {renderImage('left2')}
                </div>
              </Col>

              {/* CENTER COLUMN (Tall Top, Short Bottom) */}
              <Col xs={4} className='d-flex flex-column gap-3'>
                <div className='hero-img-wrapper img-tall flex-grow-1 overflow-hidden rounded-3'>
                  {renderImage('main1')}
                </div>
                <div className='hero-img-wrapper img-short flex-grow-1 overflow-hidden rounded-3'>
                  {renderImage('main2')}
                </div>
              </Col>

              {/* RIGHT COLUMN (Tall Top, Short Bottom) */}
              <Col xs={4} className='d-flex flex-column gap-3'>
                <div className='hero-img-wrapper img-tall flex-grow-1 overflow-hidden rounded-3'>
                  {renderImage('right1')}
                </div>
                <div className='hero-img-wrapper img-short flex-grow-1 overflow-hidden rounded-3'>
                  {renderImage('right2')}
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </Card>

      {/* ========================================= */}
      {/* 2. UPLOAD CONTROLS SECTION                */}
      {/* ========================================= */}
      <Row>
        {/* Left Column Inputs */}
        <Col md={4}>
          <div className='p-3 bg-white rounded shadow-sm border mb-3'>
            <h6 className='fw-bold border-bottom pb-2 mb-3'>Left Column</h6>

            {['left1', 'left2'].map(key => (
              <Form.Group key={key} className='mb-3'>
                <Form.Label className='small fw-bold'>
                  {bannerConfig[key].label}
                </Form.Label>
                <div className='d-flex justify-content-between align-items-center mb-1'>
                  <span className='badge bg-secondary'>
                    {bannerConfig[key].w} x {bannerConfig[key].h} px
                  </span>
                </div>
                <Form.Control
                  type='file'
                  accept='image/*'
                  size='sm'
                  onChange={e => handleImageChange(e, key)}
                />
              </Form.Group>
            ))}
          </div>
        </Col>

        {/* Main Column Inputs */}
        <Col md={4}>
          <div className='p-3 bg-white rounded shadow-sm border mb-3'>
            <h6 className='fw-bold border-bottom pb-2 mb-3'>Center Column</h6>

            {['main1', 'main2'].map(key => (
              <Form.Group key={key} className='mb-3'>
                <Form.Label className='small fw-bold'>
                  {bannerConfig[key].label}
                </Form.Label>
                <div className='d-flex justify-content-between align-items-center mb-1'>
                  <span className='badge bg-secondary'>
                    {bannerConfig[key].w} x {bannerConfig[key].h} px
                  </span>
                </div>
                <Form.Control
                  type='file'
                  accept='image/*'
                  size='sm'
                  onChange={e => handleImageChange(e, key)}
                />
              </Form.Group>
            ))}
          </div>
        </Col>

        {/* Right Column Inputs */}
        <Col md={4}>
          <div className='p-3 bg-white rounded shadow-sm border mb-3'>
            <h6 className='fw-bold border-bottom pb-2 mb-3'>Right Column</h6>

            {['right1', 'right2'].map(key => (
              <Form.Group key={key} className='mb-3'>
                <Form.Label className='small fw-bold'>
                  {bannerConfig[key].label}
                </Form.Label>
                <div className='d-flex justify-content-between align-items-center mb-1'>
                  <span className='badge bg-secondary'>
                    {bannerConfig[key].w} x {bannerConfig[key].h} px
                  </span>
                </div>
                <Form.Control
                  type='file'
                  accept='image/*'
                  size='sm'
                  onChange={e => handleImageChange(e, key)}
                />
              </Form.Group>
            ))}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Banner;
