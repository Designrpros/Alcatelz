"use client";

import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';

// Import the global type definition for GA4 event parameters
import { GtagEventParams } from '../types/global'; // Adjust path based on your project structure

// Helper function to safely send GA4 events
const sendGaEvent = (eventName: string, eventParams: GtagEventParams) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

const Toolbar = styled.div`
  background-color: #333;
  padding: 15px;
  display: flex;
  justify-content: space-around;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const Tab = styled.div`
  color: #fff;
  font-size: 18px;
  padding: 10px 20px;
  cursor: pointer;
  text-align: center;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: #555;
    border-radius: 5px;
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
`;

const Navbar: React.FC = () => {
  const handleTabClick = (linkName: string, linkPath: string) => {
    sendGaEvent('alcatelz_nav_click', {
      link_text: linkName,
      link_url: linkPath,
      navigation_location: 'alcatelz_toolbar',
    });
  };

  return (
    <Toolbar>
      <StyledLink href="/">
        <Tab onClick={() => handleTabClick('Alcatelz (Home)', '/')}>Alcatelz</Tab>
      </StyledLink>
      <StyledLink href="/philosophy">
        <Tab onClick={() => handleTabClick('Philosophy', '/philosophy')}>Philosophy</Tab>
      </StyledLink>
      <StyledLink href="/projects">
        <Tab onClick={() => handleTabClick('Projects', '/projects')}>Projects</Tab>
      </StyledLink>
    </Toolbar>
  );
};

export default Navbar;