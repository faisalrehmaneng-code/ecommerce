import React, { useState, useEffect } from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { fetchProducts } from '../api';
import '../styles/main.scss';
import { calculateFinalPrice } from '../utils/calculateDiscountedPrice';

const responsive = {
  superLargeDesktop: { breakpoint: { max: 4000, min: 1200 }, items: 4 },
  desktop: { breakpoint: { max: 1200, min: 992 }, items: 4 },
  tablet: { breakpoint: { max: 992, min: 576 }, items: 2 },
  mobile: { breakpoint: { max: 576, min: 0 }, items: 2 }
};

const ProductCard = ({ image, hoverImage, title, price, discountValue, discountType, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const finalPrice = calculateFinalPrice(price, discountType, discountValue);

  const discountPercentage = discountType
    ? discountType === 'percent'
      ? discountValue
      : Math.round((discountValue / price) * 100)
    : 0;

  return (
    <div
      className='product-card mb-4'
      onClick={onClick}
      style={{ cursor: 'pointer', position: 'relative' }}
    >
      {discountPercentage > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: 'red',
            color: '#fff',
            padding: '5px 8px',
            borderRadius: '5px',
            fontSize: '12px',
            fontWeight: 'bold',
            zIndex: 10
          }}
        >
          -{discountPercentage}%
        </span>
      )}

      <div
        className='product-img-wrapper mb-3'
        onMouseEnter={() => hoverImage && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ position: 'relative', overflow: 'hidden', borderRadius: '10px' }}
      >
        <img
          src={image}
          alt={title}
          style={{
            transition: 'opacity 0.4s ease-in-out',
            opacity: isHovered && hoverImage ? 0 : 1,
            width: '100%',
            display: 'block'
          }}
          onError={e => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/300?text=No+Image';
          }}
        />
        {hoverImage && (
          <img
            src={hoverImage}
            alt={`${title} - alternate view`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transition: 'opacity 0.4s ease-in-out',
              opacity: isHovered ? 1 : 0,
              pointerEvents: 'none'
            }}
            onError={e => {
              e.target.onerror = null;
              e.target.src = image;
            }}
          />
        )}
      </div>

      <div className='product-info text-start px-3 py-2'>
        <span
          className='product-category text-muted d-block mb-1 text-truncate'
          style={{ maxWidth: '150px' }}
        >
          {title}
        </span>
        <h5 className='product-price mb-0'>
          <span
            style={{
              textDecoration: discountPercentage > 0 ? 'line-through' : 'none',
              color: discountPercentage > 0 ? '#999' : '#000'
            }}
          >
            Rs {price} PKR
          </span>

          {discountPercentage > 0 && (
            <span style={{ color: '#e60000', fontWeight: 'bold', marginLeft: '5px' }}>
              Rs {finalPrice} PKR
            </span>
          )}
        </h5>
      </div>
    </div>
  );
};

const TrendingProducts = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data.products || data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    loadProducts();
  }, []);

  if (!products || products.length === 0) return null;

  return (
    <Container fluid='lg' className='py-3'>
      <div className="text-center my-2 py-4">
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.8rem', color: '#1a1a1a' }}>
          Trending on <span style={{ fontStyle: 'italic', fontWeight: '400', color: 'orange' }}>Bagsverse</span>
        </h2>
      </div>

      <Carousel
        responsive={responsive}
        infinite
        autoPlay
        autoPlaySpeed={4000}
        keyBoardControl
        customTransition='transform 500ms ease-in-out'
        transitionDuration={500}
        itemClass='px-2 mt-3'
      >
        {products.map(item => {
          const imgUrl =
            item.thumbnails && item.thumbnails.length > 0
              ? item.thumbnails[0].imageUrl
              : 'https://via.placeholder.com/300';
          const hoverImgUrl =
            item.thumbnails && item.thumbnails.length > 1
              ? item.thumbnails[1].imageUrl
              : null;

          return (
            <ProductCard
              key={item._id}
              image={imgUrl}
              hoverImage={hoverImgUrl}
              title={item.name}
              price={item.price}
              discountValue={item.discountValue || 0}
              discountType={item.discountType || ''}
              onClick={() => navigate(`/product/${item._id}`)}
            />
          );
        })}
      </Carousel>
    </Container>
  );
};

export default TrendingProducts;
