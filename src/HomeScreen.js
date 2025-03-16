import React from "react";
import styled from "styled-components";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Images for react-slick (you can update this as per your image paths)
import tikisunwide from "./images/tikisunwide.png";

// Placeholder for companies (text instead of images)
const companies = [
  "Company 1", "Company 2", "Company 3", "Company 4", "Company 5", 
  "Company 6", "Company 7", "Company 8", "Company 9", "Company 10",
];

// Styled components for layout and design
const HeroContainer = styled.div`
  position: relative;
  height: 80vh;
  width: 100%;
  overflow: hidden;
`;

const SwiperImage = styled.img`
  width: 100%;
  height: 80vh;
  object-fit: cover;
`;

const CompanySliderSection = styled.div`
  background-color: #333;
  height: 30vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 10px;
  overflow: hidden; /* Prevent horizontal scrolling outside the section */
  position: relative; /* This is important for positioning the title */
`;

const SliderWrapper = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  max-width: 1200px; /* Constrain the width */
`;

const CompanySliderTitle = styled.h2`
  text-align: center;
  font-size: 36px; /* Title font size */
  color: #fff; /* Title color */
  font-weight: bold;
  position: absolute; /* Position the title absolutely */
  top: 5px; /* Adjust the top position to make it closer to the top of the section */
  left: 50%;
  transform: translateX(-50%); /* Center it horizontally */
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

function HomeScreen() {
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
        <Slider dots infinite speed={500} slidesToShow={1} slidesToScroll={1} autoplay autoplaySpeed={5000}>
          <div>
            <SwiperImage src={tikisunwide} alt="Background 1" />
          </div>
        </Slider>
      </HeroContainer>

      {/* Company Slider Section */}
      <CompanySliderSection>
        <CompanySliderTitle>Collaborators</CompanySliderTitle>

        <SliderWrapper>
          <CompanySlider {...settings}>
            {companies.map((company, index) => (
              <CompanyCard key={index}>{company}</CompanyCard>
            ))}
          </CompanySlider>
        </SliderWrapper>
      </CompanySliderSection>
    </>
  );
}

export default HomeScreen;