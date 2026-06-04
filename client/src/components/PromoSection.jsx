import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import '../styles/main.scss';
import { useNavigate } from 'react-router-dom';
import { getPromoCards } from '../api'; // Import the API function

// 1. The Reusable Single Card Component
const PromoCard = ({ image, subtitle, title }) => {
  const navigate = useNavigate();

  // Extract numeric value only
  const priceValue = title.replace('Under ', '');

  const handleClick = () => {
    navigate('/product', {
      state: { price: priceValue }
    });
  };

  return (
    <div
      className='promo-card d-flex align-items-center'
      onClick={handleClick}
      style={{ backgroundImage: `url(${image})` }}
    >
      <div className='promo-content'>
        <span className='promo-subtitle'>{subtitle}</span>
        <h3 className='promo-title'>{title}</h3>
      </div>
    </div>
  );
};

// 2. The Section Component (Parent)
const PromoSection = () => {
  const [cardData, setCardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch promo cards from API on component mount
  useEffect(() => {
    const fetchPromoCards = async () => {
      try {
        setLoading(true);
        const data = await getPromoCards();
        console.log(data);

        // Map the API response to the format needed for the component
        const formattedCards = data.map(card => ({
          id: card._id,
          subtitle: card.subtitle,
          title: card.title,
          image: card.imageUrl || '/assets/image.png' // Fallback to default image
        }));

        setCardData(formattedCards);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch promo cards:', err);
        setError('Failed to load promo cards');

        // Fallback to default cards if API fails
        setCardData([
          {
            id: 1,
            subtitle: 'Handbags',
            title: 'Under 1500',
            image: '/assets/image.png'
          },
          {
            id: 2,
            subtitle: 'Handbags',
            title: 'Under 2000',
            image: '/assets/image.png'
          },
          {
            id: 3,
            subtitle: 'Handbags',
            title: 'Under 2500',
            image: '/assets/image.png'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPromoCards();
  }, []);

  // Loading state
  if (loading) {
    return (
      <Container fluid='lg' className='py-3'>
        <div className='text-center py-5'>
          <div className='spinner-border' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  // Error state (still shows fallback cards)
  if (error) {
    console.warn(error);
  }

  return (
    <Container fluid='lg' className='py-3'>
      <div className="text-center my-2 py-4">
        <div className="d-flex flex-column align-items-center">
          {/* Elegant Top Label */}
          <p className="mb-2" style={{
            letterSpacing: '5px',
            textTransform: 'uppercase',
            fontSize: '0.7rem',
            fontWeight: '600',
            color: 'orange'
          }}>
            Tailored Prices
          </p>

          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2.8rem',
            color: '#1a1a1a',
            fontWeight: '700',
            lineHeight: '1'
          }}>
            Shop by <span style={{ fontStyle: 'italic', fontWeight: '400', color: 'orange' }}>Budget</span>
          </h2>

          {/* Modern Accent: A dot and a line */}
          <div className="d-flex align-items-center mt-3">
            <div style={{ width: '40px', height: '1px', background: '#ddd' }}></div>
            <div style={{ width: '6px', height: '6px', background: 'orange', borderRadius: '50%', margin: '0 10px' }}></div>
            <div style={{ width: '40px', height: '1px', background: '#ddd' }}></div>
          </div>
        </div>
      </div>
      <Row className='g-2'>
        {cardData.map(card => (
          // RESPONSIVENESS LOGIC:
          // xs={12} -> Mobile: Full Width (1 per row)
          // lg={4}  -> Large Screen: 33% Width (3 per row)
          <Col xs={12} lg={4} key={card.id}>
            <PromoCard
              image={card.image}
              subtitle={card.subtitle}
              title={card.title}
            />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default PromoSection;
