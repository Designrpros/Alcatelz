// src/components/Philosophy.tsx
"use client"; // Mark as client component

import React from 'react';
import styled from 'styled-components';

// For images in the public directory, use direct paths.
// Make sure all these images (1.jpg to 13.jpg) are in public/images/
const getPublicImagePath = (name: string) => `/images/${name}`;

// Styled components (no changes needed for TSX here)
const AboutContainer = styled.div`
  padding: 50px;
  background-color: #ebdbae;
  display: flex;
  justify-content: center;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
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

interface ImageBlockProps {
  bgImage: string;
}

const ImageBlock = styled.div<ImageBlockProps>`
  background-image: url(${(props) => props.bgImage});
  background-size: cover;
  background-position: center;
  height: 200px;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
`;

const Philosophy: React.FC = () => {
    const quotes: string[] = [
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
        "Always aim for progress, not perfection."
    ];

  const images: string[] = [
    getPublicImagePath("1.jpg"), getPublicImagePath("2.jpg"), getPublicImagePath("3.jpg"),
    getPublicImagePath("4.jpg"), getPublicImagePath("5.jpg"), getPublicImagePath("6.jpg"),
    getPublicImagePath("7.jpg"), getPublicImagePath("8.jpg"), getPublicImagePath("9.jpg"),
    getPublicImagePath("10.jpg"), getPublicImagePath("11.jpg"), getPublicImagePath("12.jpg"),
    getPublicImagePath("13.jpg")
  ];

  type ChessboardItem = { type: "text"; content: string; } | { type: "image"; content: string; };

  const chessboardItems: ChessboardItem[] = [];
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

export default Philosophy;