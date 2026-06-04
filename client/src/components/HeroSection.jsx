import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import '../styles/main.scss';
import { fetchBanners } from '../api';

const HeroSections = ({ images }) => {
  if (!images || images.length < 6) return null;

  const mainImages = images.slice(0, 2);
  const leftImages = images.slice(2, 4);
  const rightImages = images.slice(4, 6);

  const renderColumnImages = (imgArray, isInverted = false) =>
    imgArray.map((img, index) => {
      let sizeClass = !isInverted
        ? index === 0
          ? 'img-tall'
          : 'img-short'
        : index === 0
        ? 'img-short'
        : 'img-tall';

      return (
        <div key={index} className={`hero-img-wrapper ${sizeClass} w-100 mb-2`}>
          <img
            src={img.url}
            alt={`Hero ${index}`}
            className='img-fluid rounded-3'
          />
        </div>
      );
    });
  return (
    <Container fluid='lg' className='py-2 hero-section'>
      <Row className='g-2 align-items-stretch'>
        {/* --- CENTER COLUMN (Main Banner 12.12 etc) --- */}
        {/* xs={12} ensures they occupy full width on mobile like the screenshot */}
        <Col xs={12} lg={6} className='d-flex flex-column order-1 order-lg-2'>
          {renderColumnImages(mainImages, false)}
        </Col>

        {/* --- LEFT COLUMN --- */}
        <Col xs={6} lg={3} className='d-flex flex-column order-2 order-lg-1'>
          {renderColumnImages(leftImages, true)}
        </Col>

        {/* --- RIGHT COLUMN --- */}
        <Col xs={6} lg={3} className='d-flex flex-column order-3 order-lg-3'>
          {renderColumnImages(rightImages, false)}
        </Col>
      </Row>
    </Container>
  );
};

// ... keep your heroImages array as it is ...

export default function HeroSection() {
  const [heroImages, setHeroImages] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchBanners();
        if (data && data.length > 0) {
          const banner = data[0]; // Taking the first banner, you can adjust as needed
          const images = [
            { url: banner.main1 || '/assets/default1.jpg' },
            { url: banner.main2 || '/assets/default2.jpg' },
            { url: banner.left1 || '/assets/default3.jpg' },
            { url: banner.left2 || '/assets/default4.jpg' },
            { url: banner.right1 || '/assets/default5.jpg' },
            { url: banner.right2 || '/assets/default6.jpg' }
          ];
          setHeroImages(images);
        }
      } catch (err) {
        console.error('Error fetching banners:', err);
      }
    };

    fetchData();
  }, []);

  return <HeroSections images={heroImages} />;
}
