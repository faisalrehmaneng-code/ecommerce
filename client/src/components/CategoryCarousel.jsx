import React, { useState, useEffect } from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { fetchCategories } from "../api"; // Importing your API
import '../styles/main.scss';

// 1. Configuration for Responsiveness
const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 1200 },
    items: 6
  },
  desktop: {
    breakpoint: { max: 1200, min: 992 },
    items: 5
  },
  tablet: {
    breakpoint: { max: 992, min: 576 },
    items: 3
  },
  mobile: {
    breakpoint: { max: 576, min: 0 },
    items: 2
  }
};


const CollectionCard = ({ image, title, onClick }) => {
  return (
    <div className="collection-card text-center mx-2" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="img-wrapper" style={{ border: '1px solid #d7d7d7' }}>
        <img src={image} alt={title} draggable={false} />
      </div>
      <h5 className="mt-3 collection-title">{title}</h5>
    </div>
  );
};

// 4. Main Section Component
const CategoryCarousel = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          console.error("API did not return an array:", data);
        }
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    };

    loadCategories();
  }, []);

  // If API returns empty or is loading, show nothing (or a skeleton if preferred)
  // if (categories.length === 0) return null;

  return (
    <Container fluid="lg" className="py-3">
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
            CURATED SELECTION
          </p>

          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2.8rem',
            color: '#1a1a1a',
            fontWeight: '700',
            lineHeight: '1'
          }}>
            Shop by <span style={{ fontStyle: 'italic', fontWeight: '400', color: 'orange' }}>COLLECTION</span>
          </h2>

          {/* Modern Accent: A dot and a line */}
          <div className="d-flex align-items-center mt-3">
            <div style={{ width: '40px', height: '1px', background: '#ddd' }}></div>
            <div style={{ width: '6px', height: '6px', background: 'orange', borderRadius: '50%', margin: '0 10px' }}></div>
            <div style={{ width: '40px', height: '1px', background: '#ddd' }}></div>
          </div>
        </div>
      </div>

      <Carousel
        responsive={responsive}
        infinite={true}
        autoPlay={true}
        autoPlaySpeed={3000}
        keyBoardControl={true}
        customTransition="transform 500ms ease-in-out"
        transitionDuration={500}
        containerClass="carousel-container"
        removeArrowOnDeviceType={["tablet", "mobile"]}
        itemClass="carousel-item-padding-40-px"
      >
        {categories.map((cat, index) => {
          // Use modulo operator (%) to cycle through the 10 images repeatedly 
          // if there are more categories than images.
          const imgUrl = cat.images[0]?.imageUrl || `data:image/png;base64,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`;

          return (
            <CollectionCard
              key={cat._id || index}
              image={imgUrl}
              title={cat.name} // Assuming API returns { name: "..." }
              onClick={() => navigate('/product', { state: { category: cat.name } })}
            />
          );
        })}
      </Carousel>
    </Container>
  );
};

export default CategoryCarousel;