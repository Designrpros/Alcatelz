// src/components/Navbar.tsx
"use client"; // This component uses client-side features (Link, styled-components)

import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';

// ---
// Analytics setup
// ---

// Declare gtag on the Window interface for TypeScript.
// For larger projects, this should ideally be in a global declaration file (e.g., `src/types/global.d.ts`).
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Helper function to safely send GA4 events.
const sendGaEvent = (eventName: string, eventParams: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

// ---
// Styled Components for the toolbar and tabs (no changes here)
// ---

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

// ---
// Navbar Component with Analytics
// ---

const Navbar: React.FC = () => {
  // Function to handle the click and send the GA4 event
  const handleTabClick = (linkName: string, linkPath: string) => {
    sendGaEvent('alcatelz_nav_click', { // Custom event name for this project's navbar
      link_text: linkName,              // Text of the link, e.g., "Alcatelz"
      link_url: linkPath,               // Destination URL of the link
      navigation_location: 'alcatelz_toolbar', // Specific context for this toolbar
    });
  };

  return (
    <Toolbar>
      <StyledLink href="/">
        {/* Add onClick handler to the Tab component */}
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