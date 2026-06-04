import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button, Card, Container } from 'react-bootstrap';
import toast from 'react-hot-toast';
import '../styles/main.scss';
import { savePromoCard, getPromoCards } from '../api';

const Promocard = () => {
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // --- CONFIGURATION ---
  const REQUIRED_WIDTH = 533;
  const REQUIRED_HEIGHT = 213;

  // Load existing cards on mount
  useEffect(() => {
    const fetchCards = async () => {
      try {
        setInitialLoading(true);
        const response = await getPromoCards();

        if (response && response.length > 0) {
          // Map existing cards with their real MongoDB IDs
          setCards(
            response.map(card => ({
              id: card._id, // Real MongoDB ObjectId
              title: card.title,
              subtitle: card.subtitle,
              image: card.imageUrl || null,
              file: null
            }))
          );
        } else {
          // Initialize with 3 empty cards (no IDs)
          setCards([
            {
              id: null,
              title: 'Under 1500',
              subtitle: 'Handbags',
              image: null,
              file: null
            },
            {
              id: null,
              title: 'Under 2000',
              subtitle: 'Handbags',
              image: null,
              file: null
            },
            {
              id: null,
              title: 'Under 2500',
              subtitle: 'Handbags',
              image: null,
              file: null
            }
          ]);
        }
      } catch (err) {
        console.error('Failed to load cards:', err);
        toast.error('Failed to load promo cards');

        // Initialize with empty cards on error
        setCards([
          {
            id: null,
            title: 'Under 1500',
            subtitle: 'Handbags',
            image: null,
            file: null
          },
          {
            id: null,
            title: 'Under 2000',
            subtitle: 'Handbags',
            image: null,
            file: null
          },
          {
            id: null,
            title: 'Under 2500',
            subtitle: 'Handbags',
            image: null,
            file: null
          }
        ]);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchCards();
  }, []);

  // --- HANDLERS ---

  // 1. Handle Text Changes (Title/Subtitle)
  const handleTextChange = (index, field, value) => {
    const updatedCards = [...cards];
    updatedCards[index][field] = value;
    setCards(updatedCards);
  };

  // 2. Handle Image Upload & Validation
  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        // STRICT VALIDATION (533x213)
        if (
          img.naturalWidth === REQUIRED_WIDTH &&
          img.naturalHeight === REQUIRED_HEIGHT
        ) {
          const updatedCards = [...cards];
          updatedCards[index].image = img.src; // For Preview
          updatedCards[index].file = file; // For API Upload
          setCards(updatedCards);
          toast.success(`Card ${index + 1} image updated!`);
        } else {
          e.target.value = null; // Reset input
          toast.error(
            `Error: Image must be ${REQUIRED_WIDTH}x${REQUIRED_HEIGHT}px. Yours: ${img.naturalWidth}x${img.naturalHeight}px`
          );
        }
      };
    };
    reader.readAsDataURL(file);
  };

  // 3. Save Handler
  const handleSave = async () => {
    setLoading(true);
    try {
      const savedCards = [];

      for (let card of cards) {
        const formData = new FormData();

        // Only send ID if it exists (for updates)
        if (card.id) {
          formData.append('id', card.id);
        }

        formData.append('title', card.title);
        formData.append('subtitle', card.subtitle);

        if (card.file) {
          formData.append('image', card.file);
        }

        const savedCard = await savePromoCard(formData);
        savedCards.push(savedCard);
      }

      toast.success('Promo Cards Updated Successfully!');

      // Refresh cards to get updated IDs and image URLs
      const response = await getPromoCards();
      if (response && response.length > 0) {
        setCards(
          response.map(card => ({
            id: card._id,
            title: card.title,
            subtitle: card.subtitle,
            image: card.imageUrl || null,
            file: null
          }))
        );
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.message || 'Failed to save promo cards');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching
  if (initialLoading) {
    return (
      <div className='admin-container'>
        <div className='text-center py-5'>
          <div className='spinner-border' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
          <p className='mt-3'>Loading promo cards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='admin-container'>
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <h2 className='fw-bold mb-0'>Promo Cards Management</h2>
        <Button
          className='btn-dark px-4'
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* ========================================= */}
      {/* 1. LIVE PREVIEW SECTION                   */}
      {/* ========================================= */}
      <Card className='border-0 shadow-sm mb-5'>
        <div className='card-header bg-white py-3'>
          <h5 className='mb-0 fw-bold'>
            <i className='fa fa-eye me-2'></i> Live Preview
          </h5>
        </div>
        <div className='card-body bg-light'>
          <Container fluid>
            <div className='text-center mb-4'>
              <h2 className='section-title' style={{ fontSize: '1.5rem' }}>
                Shop by Budget
              </h2>
            </div>
            <Row className='g-4'>
              {cards.map((card, index) => (
                <Col xs={12} md={4} key={card.id || index}>
                  <div
                    className='promo-card d-flex align-items-center shadow-sm'
                    style={{
                      backgroundImage: card.image
                        ? `url(${card.image})`
                        : 'none',
                      backgroundColor: card.image ? 'transparent' : '#e9ecef',
                      border: '1px dashed #ced4da',
                      height: '180px'
                    }}
                  >
                    {!card.image && (
                      <div className='position-absolute w-100 text-center text-muted small'>
                        No Image
                      </div>
                    )}

                    <div className='promo-content position-relative z-1 ps-3'>
                      <span
                        className='promo-subtitle'
                        style={{ fontSize: '1rem' }}
                      >
                        {card.subtitle || 'Subtitle'}
                      </span>
                      <h3
                        className='promo-title'
                        style={{ fontSize: '1.5rem' }}
                      >
                        {card.title || 'TITLE'}
                      </h3>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Container>
        </div>
      </Card>

      {/* ========================================= */}
      {/* 2. INPUT CONTROLS SECTION                 */}
      {/* ========================================= */}
      <Row>
        {cards.map((card, index) => (
          <Col md={4} key={card.id || index}>
            <div className='p-3 bg-white rounded shadow-sm border mb-4'>
              <div className='d-flex justify-content-between align-items-center border-bottom pb-2 mb-3'>
                <h6 className='fw-bold mb-0'>Card 0{index + 1}</h6>
                <span className='badge bg-secondary'>
                  {REQUIRED_WIDTH} x {REQUIRED_HEIGHT}
                </span>
              </div>

              {/* Subtitle Input */}
              <Form.Group className='mb-2'>
                <Form.Label className='small fw-bold text-muted'>
                  Subtitle
                </Form.Label>
                <Form.Control
                  type='text'
                  size='sm'
                  placeholder='e.g. Handbags'
                  value={card.subtitle}
                  onChange={e =>
                    handleTextChange(index, 'subtitle', e.target.value)
                  }
                />
              </Form.Group>

              {/* Title Input */}
              <Form.Group className='mb-3'>
                <Form.Label className='small fw-bold text-muted'>
                  Title
                </Form.Label>
                <Form.Control
                  type='text'
                  size='sm'
                  placeholder='e.g. Under 1500'
                  value={card.title}
                  onChange={e =>
                    handleTextChange(index, 'title', e.target.value)
                  }
                />
              </Form.Group>

              {/* Image Input */}
              <Form.Group>
                <Form.Label className='small fw-bold text-muted'>
                  Background Image
                </Form.Label>
                <Form.Control
                  type='file'
                  accept='image/*'
                  size='sm'
                  onChange={e => handleImageChange(e, index)}
                />
                <Form.Text
                  className='text-muted'
                  style={{ fontSize: '0.75rem' }}
                >
                  Must be exactly {REQUIRED_WIDTH}x{REQUIRED_HEIGHT} px
                </Form.Text>
                {card.image && (
                  <div className='mt-2'>
                    <small className='text-success'>✓ Image loaded</small>
                  </div>
                )}
              </Form.Group>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Promocard;
