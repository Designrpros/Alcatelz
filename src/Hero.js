import React from "react";
import styled from "styled-components";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Images for react-slick (you can update this as per your image paths)
import tikisunwide from "./images/tikisunwide.png";

// Placeholder for companies (text instead of images)
const companies = [
  "Mapr", "Prima", "Akthe", "Lydhagen", "Studio 51", "Høl i CVen", "Designr.pro",
];

// Styled components for layout and design
const HeroContainer = styled.div`
  position: relative;
  height: 100vh; /* Set the height to 100vh */
  width: 100%;
  display: flex;
  flex-direction: column; /* Stack the image and slider vertically */
  overflow: hidden;
`;

const SwiperImage = styled.img`
  width: 100%;
  height: 70vh; /* Hero image takes 70% of the height */
  object-fit: cover;
`;

const CompanySliderSection = styled.div`
  background-color: #333;
  height: 30vh; /* Increased height to give more room */
  display: flex;
  flex-direction: column; /* Stack title and slider vertically */
  justify-content: flex-start; /* Align content to top */
  padding: 0 10px;
  overflow: hidden;
  position: relative;
`;

const CompanySliderTitle = styled.h2`
  text-align: center;
  font-size: 36px; /* Title font size */
  color: #fff; /* Title color */
  font-weight: bold;
  position: absolute; /* Position the title absolutely */
  top: 10px; /* Title stays at the top of the section */
  left: 50%;
  transform: translateX(-50%); /* Center it horizontally */
`;

const SliderWrapper = styled.div`
  display: flex;
  flex: 1; /* Take up remaining space */
  width: 100%;
  align-items: center;
  justify-content: center;
  margin-top: 100px; /* Add space between title and slider */
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
    display: flex; /* Ensures that items are placed in a row */
  }

  .slick-slide > div {
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

// New styled component for the footer text at the bottom
const FooterText = styled.div`
  position: absolute;
  bottom: 20px; /* Position the footer text at the bottom of the page */
  width: 100%;
  text-align: center;
  font-size: 18px;
  color: #fff;
  font-weight: bold;
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

  // Prevent horizontal scrolling on the entire page by setting overflow-x to hidden in global styles
  React.useEffect(() => {
    document.body.style.overflowX = "hidden";
    return () => {
      document.body.style.overflowX = "auto"; // Cleanup when component unmounts
    };
  }, []);

  return (
    <>
      {/* Hero Section */}
      <HeroContainer>
        <SwiperImage src={tikisunwide} alt="Background 1" />

        {/* Company Slider Section */}
        <CompanySliderSection>
          <CompanySliderTitle>Projects</CompanySliderTitle>

          {/* Space between the title and the slider */}
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