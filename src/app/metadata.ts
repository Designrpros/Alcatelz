// src/app/metadata.ts
import type { Metadata } from 'next';

// Define your metadata here
export const metadata: Metadata = {
  title: 'Alcatelz | Vegar Berentsen - Portfolio',
  description: 'Explore the portfolio of Vegar Berentsen, a designer and developer specializing in mobile, web, and creative solutions.',
  keywords: 'Vegar Berentsen, portfolio, design, development, mobile apps, web apps, iOS, macOS, visionOS, React, Next.js, Styled Components',
  // CORRECTED: Changed 'author' to 'authors' and used the array of objects format
  authors: [{ name: 'Vegar Berentsen', url: 'https://www.alcatelz.com/' }], // Or your specific author URL
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: 'Alcatelz | Vegar Berentsen - Portfolio',
    description: 'Explore the portfolio of Vegar Berentsen, a designer and developer specializing in mobile, web, and creative solutions.',
    url: 'https://www.alcatelz.com/',
    siteName: 'Alcatelz',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Vegar Berentsen Portfolio',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alcatelz | Vegar Berentsen - Portfolio',
    description: 'Explore the portfolio of Vegar Berentsen, a designer and developer specializing in mobile, web, and creative solutions.',
    creator: '@yourtwitterhandle', // Remember to replace with your actual Twitter handle
    images: ['/images/twitter-image.jpg'],
  },
};