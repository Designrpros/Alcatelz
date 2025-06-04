// src/app/layout.tsx
"use client"; // Keep this directive

import React from 'react';
import { createGlobalStyle } from 'styled-components';
import StyledComponentsRegistry from './registry';
import Navbar from '../components/Navbar'; // Import the Navbar component
import styled from 'styled-components'; // Keep styled for AppContainer

// --- REMOVED: import type { Metadata } from 'next';
// --- REMOVED: export const metadata: Metadata = { ... };


// Global Styles (no change)
const GlobalStyle = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6, p, ul, ol, dl {
    margin-block-start: 0;
    margin-block-end: 0;
  }

  .slick-slider {
    .slick-list {
      overflow: hidden;
    }
  }
`;

// The main container for content below the toolbar (no change, it's still needed here)
const AppContainer = styled.div`
  margin-top: 60px; // Adjust margin to account for fixed toolbar
  min-height: calc(100vh - 60px); // Fill remaining viewport height
  display: flex;
  flex-direction: column;
`;

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>
          <GlobalStyle />
          <Navbar />
          <AppContainer>
            {children}
          </AppContainer>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}