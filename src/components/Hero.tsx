// src/components/Hero.tsx
"use client"; // Mark as client component

import React from "react"; // Removed 'useEffect' from import
import styled from "styled-components";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// For images in the public directory, you can reference them directly with a leading slash.
const tikisunwide = "/images/tikisunwide.png";

// Updated: Directly assigned project names to the companies array
const companies: string[] = [
  "Mapr", "QRHue", "TextClip", "Låne Lageret", "BærumKart",
  "Melodex", "Prompted", "Composition", "Layer", "Cinematographer Portfolio",
  "LIORA", "Designr.pro", "Alcatelz", "Akthe", "Studio 51",
  "Høl i CVen", "Brodrene Ervik", "Bærum Bygg Fornyelse", "Prima", "Lydhagen",
  "Sandvika Platemesse"
];


// Styled components
const HeroContainer = styled.div`
  position: relative;
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box; /* Ensure padding is included in the height calculation */
`;

const SwiperImage = styled.img`
  width: 100%;
  height: 70vh;
  object-fit: cover;
`;

const CompanySliderSection = styled.div`
  background-color: #333;
  height: 30vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 0 10px;
  overflow: hidden;
  position: relative;
  flex-grow: 1;
`;

const CompanySliderTitle = styled.h2`
  text-align: center;
  font-size: 36px;
  color: #fff;
  font-weight: bold;
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
`;

const SliderWrapper = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  align-items: center;
  justify-content: center;
  margin-top: 100px;
`;

const CompanyCard = styled.div`
  height: 100px;
  width: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 16px;
  color: white;
  margin-right: 10px;
  font-weight: bold;
`;

const CompanySlider = styled(Slider)`
  flex: 1;
  width: 100%;
  .slick-slide {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .slick-track {
    display: flex;
  }

  .slick-slide > div {
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

const FooterText = styled.div`
  position: absolute;
  bottom: 20px;
  left: 0;
  width: 100%;
  text-align: center;
  font-size: 18px;
  color: #fff;
  font-weight: bold;
  z-index: 10;
`;

function Hero() {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 1 } },
      { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  return (
    <>
      <HeroContainer>
        <SwiperImage src={tikisunwide} alt="Background 1" />

        <CompanySliderSection>
          <CompanySliderTitle>Projects</CompanySliderTitle>

          <SliderWrapper>
            <CompanySlider {...settings}>
              {companies.map((company, index) => (
                <CompanyCard key={index}>{company}</CompanyCard>
              ))}
            </CompanySlider>
          </SliderWrapper>
        </CompanySliderSection>

        {/* Footer Text */}
        <FooterText>
          Vegar Lee Berentsen
        </FooterText>
      </HeroContainer>
    </>
  );
}

export default Hero;