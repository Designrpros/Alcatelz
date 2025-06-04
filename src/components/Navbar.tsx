// src/components/Navbar.tsx
"use client"; // This component uses client-side features (Link, styled-components)

import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';

// Styled Components for the toolbar and tabs
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
  return (
    <Toolbar>
      <StyledLink href="/">
        <Tab>Alcatelz</Tab>
      </StyledLink>
      <StyledLink href="/philosophy">
        <Tab>Philosophy</Tab>
      </StyledLink>
      <StyledLink href="/projects">
        <Tab>Projects</Tab>
      </StyledLink>
    </Toolbar>
  );
};

export default Navbar;