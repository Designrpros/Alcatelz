// src/app/projects/page.tsx
"use client"; // This component uses client-side features (React state, browser APIs, styled-components)

import React from "react";
import styled from "styled-components";

// ---
// Analytics setup
// ---

// Declare gtag on the Window interface for TypeScript.
// (Ensure this `declare global` block is consistent across your project,
// ideally in a single, dedicated `.d.ts` file like `src/types/global.d.ts` or `next-env.d.ts`).
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
// Project Data & Types (no changes needed here)
// ---

// For images in the public directory, use direct paths.
const AvatarImage = "/images/Avatar.jpeg";
const MaprLogo = "/images/MaprLogo.png";
const QRHueLogo = "/images/QRHue.png";
const TextSnapLogo = "/images/Textsnap.png";

interface ProjectItem {
  name: string;
  url: string;
  description: string;
  image?: string; // Optional image path for projects that have a specific logo/thumbnail
}

interface ProjectCategory {
  name: string;
  description: string;
  projects: ProjectItem[];
}

// All project categories with updated data and new image assignments
// All apostrophes (') have been escaped with &apos;
const projectCategories: ProjectCategory[] = [
  {
    name: 'Mobile Apps',
    description: 'Innovative mobile applications for iOS, macOS, and visionOS, solving unique challenges with intuitive designs.',
    projects: [
      {
        name: 'Mapr',
        url: 'https://mapr-homepage.vercel.app',
        description: 'An innovative project management tool designed for tradesmen, offering a unique map-based interface for iOS, macOS, and visionOS users. Developed by Vegar Berentsen, Mapr allows users to visualize the geographical distribution of their ongoing projects, manage contacts, track time, and more.',
        image: MaprLogo, // Explicitly assign the Mapr logo
      },
      {
        name: 'QRHue',
        url: 'https://apps.apple.com/no/app/qrhue/id6746092245',
        description: 'Create stunning QR codes with ease using QRHue! Unleash your creativity with vibrant colors, transforming any link, text, or URL into a custom QR code in just a few taps. Enjoy vivid customization with a spectrum of foreground and background colors, toggle between rounded or square shapes, and fine-tune corner radius. With an intuitive interface, export and share QR codes with a transparent background. Save and revisit designs with a sleek history feature, perfect for sharing websites, contact info, or special messages in style.',
        image: QRHueLogo, // Assign the QRHue logo
      },
      {
        name: 'TextClip', // Assuming this is the app that uses Textsnap.png
        url: 'https://apps.apple.com/no/app/textclip/id6746357735?mt=12',
        description: 'A powerful Mac OCR app that effortlessly extracts text from images, PDFs, websites, or videos. TextClip&apos;s intuitive interface allows users to select screen regions for instant text recognition, copying results to the clipboard for use in any macOS app. Operating offline for privacy, it requires no special skills, making it ideal for students, professionals, and anyone needing fast, secure text extraction.',
        image: TextSnapLogo, // Assign the TextSnap logo
      },
    ],
  },
  {
    name: 'Web Apps',
    description: 'Web-based platforms fostering community collaboration and regional exploration.',
    projects: [
      {
        name: 'Låne Lageret',
        url: 'https://laanelageret.vercel.app',
        description: 'A Bua-inspired concept for Akthe, Låne Lageret is a community-driven initiative that provides a lending library for tools, equipment, and resources. Designed to promote sustainability and accessibility, this platform allows individuals to borrow items for their projects, fostering collaboration and reducing waste within the Akthe community.',
      },
      {
        name: 'BærumKart',
        url: 'https://baerumkart.vercel.app',
        description: 'Inspired by UT.no, BærumKart is a digital mapping platform tailored for the Bærum region. It offers detailed maps and guides for outdoor activities, including hiking trails, cultural landmarks, and community events, encouraging residents and visitors to explore Bærum&apos;s natural beauty and local attractions.',
      },
    ],
  },
  {
    name: 'Learning Resources',
    description: 'Interactive tools and platforms for developing creative and technical skills.',
    projects: [
      {
        name: 'Melodex',
        url: 'https://melodex-seven.vercel.app',
        description: 'Your guide to mastering music production.',
      },
      {
        name: 'Prompted',
        url: 'https://prompted-two.vercel.app',
        description: 'Enhance your creative process with Prompted. Learn prompt engineering to inspire lyrics and music ideas for Studio 51 sessions.',
      },
      {
        name: 'Composition',
        url: 'https://composition-nu.vercel.app',
        description: 'Master graphic design with Composition, perfect for Studio 51&apos;s animation workshops. Explore Figma for prototyping visuals.',
      },
      {
        name: 'Layer',
        url: 'https://layer-eight.vercel.app',
        description: 'Learn web design basics with Layer, tailored for Studio 51&apos;s digital projects. Use VSCode, Next.js, and Styled Components to build creative tools.',
      },
    ],
  },
  {
    name: 'Creative Portfolios',
    description: 'Dynamic showcases of artistic and professional work for individuals and brands.',
    projects: [
      {
        name: 'Cinematographer Portfolio',
        url: 'https://cinematographer2.vercel.app',
        description: 'A portfolio showcasing the work of a cinematographer, featuring stunning visuals and projects that highlight their expertise in filmmaking and visual storytelling.',
      },
      {
        name: 'LIORA',
        url: 'https://liora-one.vercel.app',
        description: 'An artist webpage for LIORA, designed to display her creative works, artistic vision, and personal style through an engaging and visually appealing interface.',
      },
      {
        name: 'Designr.pro',
        url: 'https://designr.pro',
        description: 'The personal brand homepage and CV of a professional designer, showcasing various design projects, work philosophy, and professional experience.',
      },
      {
        name: 'Alcatelz',
        url: 'https://www.alcatelz.com/',
        description: 'A personal portfolio page displaying various projects and outlining the creator work philosophy.',
      },
    ],
  },
  {
    name: 'Community Initiatives',
    description: 'Impactful projects promoting social engagement and well-being in local communities.',
    projects: [
      {
        name: 'Akthe',
        url: 'https://akthe.vercel.app',
        description: 'An aktivitetsbasert helsehjelp (activity-based healthcare) platform providing solutions focused on engaging individuals in meaningful activities to promote health and well-being.',
      },
      {
        name: 'Studio 51',
        url: 'https://studio51.vercel.app',
        description: 'Also known as Rap Clinic, Studio 51 is a municipal initiative in Bærum kommune that uses music as a medium for identity formation and social participation, particularly targeting individuals dealing with mental health and substance abuse challenges.',
      },
      {
        name: 'Høl i CVen',
        url: 'https://holicven.vercel.app',
        description: 'A coffee shop initiative under Akthe, providing employment opportunities and support for individuals in need, aiming to integrate them into the workforce and community.',
      },
    ],
  },
  {
    name: 'Commercial Websites',
    description: 'Professional websites for businesses, highlighting services and achievements.',
    projects: [
      {
        name: 'Brodrene Ervik',
        url: 'https://brodrene-ervik.vercel.app/',
        description: 'A project developed for a Norwegian construction company, highlighting their services and previous work.',
      },
      {
        name: 'Bærum Bygg Fornyelse',
        url: 'https://www.baerumbyggfornyelse.no/',
        description: 'A construction and renovation company based in Bærum, specializing in building renewal projects. This was one of the developer first external projects.',
      },
    ],
  },
  {
    name: 'Special Projects',
    description: 'Unique initiatives spanning virtual reality and cultural community events.',
    projects: [
      {
        name: 'Prima',
        url: 'https://prima-vr.vercel.app',
        description: 'A platform offering VR experiences aimed at enhancing the lifestyle and wellness of older adults.',
      },
      {
        name: 'Lydhagen',
        url: 'https://lydhagen.vercel.app',
        description: 'A local Norwegian music festival in Bærum kommune, dedicated to fostering community engagement through music and cultural events.',
      },
      {
        name: 'Sandvika Platemesse',
        url: 'https://sandvikaplatemesse.no',
        description: 'A vibrant vinyl record fair held on May 10-11 at Kadettangen 18, featuring music, culture, and community spirit. Organized by Høl i CV&apos;en, it offers live performances by artists like LIORA, a fresh tea stand, and an afterparty, creating a nostalgic and engaging local experience.'
      },
    ],
  },
];

const allProjects: ProjectItem[] = projectCategories.flatMap(category => category.projects);


// ---
// Styled components (no changes needed here unless for specific styling requirements)
// ---

const ScrollContainer = styled.div`
  padding: 50px;
  background-color: #ebdbae;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 50px;
`;

const AboutMeSection = styled.div`
  background-color: #333;
  color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 80%;
  max-width: 1200px;
  height: auto;
  min-height: 300px;
`;

const Avatar = styled.img`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  margin-bottom: 20px;
`;

const AboutMeTitle = styled.h2`
  font-size: 24px;
  color: #fff;
  margin: 0;
`;

const AboutMeText = styled.p`
  font-size: 16px;
  color: #fff;
`;

const ProjectsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 40px;
  width: 100%;
`;

const ProjectCard = styled.a`
  background-color: #333;
  color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  width: 100%;
  max-width: 400px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ProjectMediaContainer = styled.div`
  width: 100%;
  height: 300px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  overflow: hidden;
  margin-bottom: 0px;
`;

const ProjectPreview = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  background-color: #fff;
  display: block;
`;

const ProjectImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover; /* Allows stretching, fills container */
  display: block;
  background-color: #f0f0f0;
`;

const ProjectContent = styled.div`
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ProjectTitle = styled.h2`
  font-size: 24px;
  color: #fff;
  margin: 0;
`;

const ProjectDescription = styled.p`
  font-size: 16px;
  color: #fff;
  text-align: center;
`;

// ---
// ProjectsPage Component with Analytics
// ---

const ProjectsPage: React.FC = () => {
  // Function to handle clicks on project cards
  const handleProjectCardClick = (projectName: string, projectUrl: string) => {
    sendGaEvent('project_card_click', { // Custom event name for clicks on project cards
      project_name: projectName,        // Name of the clicked project
      link_url: projectUrl,             // URL of the project
      link_location: 'projects_page',   // Context: where the click occurred
    });
  };

  return (
    <ScrollContainer>
      <AboutMeSection>
        <Avatar src={AvatarImage} alt="Your Avatar" />
        <AboutMeTitle>Vegar Lee Berentsen</AboutMeTitle>
        <AboutMeText>
          Hi! I'm Vegar Lee Berentsen, a passionate developer and designer. I specialize in creating innovative solutions that
          combine functionality with stunning visuals. Feel free to reach out to collaborate!
        </AboutMeText>
      </AboutMeSection>

      <h1>Projects</h1>

      <ProjectsContainer>
        {allProjects.map((project, index) => (
          <ProjectCard
            key={index}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            // Attach onClick handler to the ProjectCard component
            onClick={() => handleProjectCardClick(project.name, project.url)}
          >
            <ProjectMediaContainer>
              {project.image ? (
                <ProjectImage src={project.image} alt={project.name} />
              ) : (
                <ProjectPreview src={project.url} title={`${project.name} Preview`} />
              )}
            </ProjectMediaContainer>
            <ProjectContent>
              <ProjectTitle>{project.name}</ProjectTitle>
              <ProjectDescription>{project.description}</ProjectDescription>
            </ProjectContent>
          </ProjectCard>
        ))}
      </ProjectsContainer>
    </ScrollContainer>
  );
};

export default ProjectsPage;