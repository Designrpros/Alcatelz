import React from 'react';
import styled from 'styled-components';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const GallerySection = ({ images = [], title = "Gallery", settings = {} }) => {
  const defaultSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 1 } },
      { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
    ...settings, // Merge with user-defined settings
  };

  // Fallback for empty images array
  const safeImages = images.length > 0 ? images : [
    { src: '/images/placeholder1.jpg', alt: 'Placeholder 1' },
    { src: '/images/placeholder2.jpg', alt: 'Placeholder 2' },
  ];

  return (
    <GalleryContainer>
      {title && <GalleryTitle>{title}</GalleryTitle>}
      <Slider {...defaultSettings}>
        {safeImages.map((image, index) => (
          <div key={index}>
            <GalleryImage
              src={image.src}
              alt={image.alt}
              onError={(e) => (e.target.src = '/images/default.jpg')}
            />
          </div>
        ))}
      </Slider>
    </GalleryContainer>
  );
};

const GalleryContainer = styled.div`
  padding: 20px;
  width: 100%;
`;

const GalleryTitle = styled.h2`
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
`;

const GalleryImage = styled.img`
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 5px;
`;

export default GallerySection;