// About.js
import React from 'react';
import styled from 'styled-components';

// Importing images
import img1 from './images/1.jpg';
import img2 from './images/2.jpg';
import img3 from './images/3.jpg';
import img4 from './images/4.jpg';
import img5 from './images/5.jpg';
import img6 from './images/6.jpg';
import img7 from './images/7.jpg';
import img8 from './images/8.jpg';
import img9 from './images/9.jpg';
import img10 from './images/10.jpg';
import img11 from './images/11.jpg';
import img12 from './images/12.jpg';
import img13 from './images/13.jpg';

// Styled components
const AboutContainer = styled.div`
  padding: 50px;
  background-color: #ebdbae; /* Updated background color */
  display: flex;
  justify-content: center;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 columns per row */
  gap: 15px; /* Spacing between blocks */
  max-width: 1200px;
  width: 100%;
`;

const TextBlock = styled.div`
  background-color: #333;
  color: #fff;
  padding: 20px;
  font-size: 16px;
  line-height: 1.6;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
`;

const ImageBlock = styled.div`
  background-image: url(${(props) => props.bgImage});
  background-size: cover;
  background-position: center;
  height: 200px; /* Set a consistent height */
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
`;

// Quotes and Images for the chessboard
const About = () => {
    const quotes = [
        "The best view of success only happens when you climb the mountain with hard work",
        "Work hard but stay humble.",
        "Hard work always goes farther than talent.",
        "If opportunities don't happen, you create your own opportunities.",
        "A daily reminder: You are capable, resilient, and stronger than you think.",
        "Go the extra mile than everyone else.",
        "Do something that you are passionate about.",
        "Remember no matter what, you are still trying your best.",
        "Create your own legacy so that it is worth to remember",
        "Force on the change and you will see results.",
        "If you want something, you need to conquer it.",
        "Be different from everybody else.",
        "There is no price on kind words.",
        "Always aim for progress, not perfection." // New quote added
    ];

  const images = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10, img11, img12, img13];

  // Combine text and image into one alternating list
  const chessboardItems = [];
  for (let i = 0; i < Math.max(quotes.length, images.length); i++) {
    if (i < quotes.length) chessboardItems.push({ type: "text", content: quotes[i] });
    if (i < images.length) chessboardItems.push({ type: "image", content: images[i] });
  }

  return (
    <AboutContainer>
      <GridContainer>
        {chessboardItems.map((item, index) =>
          item.type === "text" ? (
            <TextBlock key={index}>{item.content}</TextBlock>
          ) : (
            <ImageBlock key={index} bgImage={item.content} />
          )
        )}
      </GridContainer>
    </AboutContainer>
  );
};

export default About;