// src/app/page.tsx
"use client"; // This page uses client-side components (Hero uses useEffect, Slider)

import React from 'react';
import Hero from '../components/Hero';

const HomePage: React.FC = () => {
  return <Hero />;
};

export default HomePage;