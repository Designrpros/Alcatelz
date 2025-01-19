import React from "react";
import styled from "styled-components";
import AvatarImage from "./images/Avatar.jpeg"; // Importing the avatar image
import MaprLogo from "./images/fistwhite.png"; // Importing Mapr logo image

// Styled components for layout and design
const ScrollContainer = styled.div`
  padding: 50px;
  background-color: #ebdbae; /* Updated background color */
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 50px;
`;

const AboutMeSection = styled.div`
  background-color: #333; /* Black background for About Me */
  color: #fff; /* White text */
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 80%; /* Same width as project cards */
  max-width: 1200px; /* Max width to match the project card's max-width */
  height: auto;
  min-height: 300px; /* Maintain a reasonable height */
`;

const Avatar = styled.img`
  width: 200px;  /* Increased size of avatar image */
  height: 200px;
  border-radius: 50%;
  margin-bottom: 20px;
`;

const AboutMeTitle = styled.h2`
  font-size: 24px;
  color: #fff; /* White text */
  margin: 0;
`;

const AboutMeText = styled.p`
  font-size: 16px;
  color: #fff; /* White text */
`;

const ProjectsContainer = styled.div`
  display: flex;
  flex-wrap: wrap; /* Allow cards to wrap */
  justify-content: center; /* Center the cards */
  gap: 40px;
  width: 100%;
`;

const ProjectCard = styled.a`
  background-color: #333; /* Black background for cards */
  color: #fff; /* White text */
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  text-decoration: none; /* Remove underline on links */
  width: 100%; /* Full width on smaller screens */
  max-width: 400px; /* Max width for larger screens */
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: scale(1.02); /* Slight scale effect on hover */
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15); /* Enhance shadow on hover */
  }
`;

const ProjectPreview = styled.iframe`
  width: 100%;
  height: 300px; /* Adjust height for better fit */
  border: none;
  border-radius: 10px;
  margin-bottom: 20px;
`;

const ProjectImage = styled.img`
  width: 80%; /* Slightly smaller width for balance */
  height: auto;
  border-radius: 15px; /* More rounded corners for a modern look */
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Adds a subtle shadow for depth */
  object-fit: contain; /* Ensures the logo maintains its aspect ratio */
  max-width: 300px; /* Prevents excessively large images */
`;

const ProjectTitle = styled.h2`
  font-size: 24px;
  color: #fff; /* White text */
  margin: 0;
`;

const ProjectDescription = styled.p`
  font-size: 16px;
  color: #fff; /* White text */
  text-align: center;
`;

// Project data (with Mapr project changed to use image)
const projects = [
  {
    name: "Mapr",
    url: "https://mapr-homepage.vercel.app", // Updated URL
    image: MaprLogo,
    description: "An innovative project management tool designed for tradesmen, offering a unique map-based interface for iOS, macOS, and visionOS users. Developed by Vegar Berentsen, Mapr allows users to visualize the geographical distribution of their ongoing projects, manage contacts, track time, and more.",
  },
  {
    name: "Akthe",
    url: "https://akthe.vercel.app",
    description: "An aktivitetsbasert helsehjelp (activity-based healthcare) platform providing solutions focused on engaging individuals in meaningful activities to promote health and well-being.",
  },
  {
    name: "Prima",
    url: "https://prima-umber.vercel.app",
    description: "A platform offering VR experiences aimed at enhancing the lifestyle and wellness of older adults.",
  },
  {
    name: "Lydhagen",
    url: "https://lydhagen.vercel.app",
    description: "A local Norwegian music festival in Bærum kommune, dedicated to fostering community engagement through music and cultural events.",
  },
  {
    name: "Studio 51",
    url: "https://studio51.vercel.app",
    description: "Also known as Rap Clinic, Studio 51 is a municipal initiative in Bærum kommune that uses music as a medium for identity formation and social participation, particularly targeting individuals dealing with mental health and substance abuse challenges.",
  },
  {
    name: "Høl i CVen",
    url: "https://h-l-i-c-ven.vercel.app",
    description: "A coffee shop initiative under Akthe, providing employment opportunities and support for individuals in need, aiming to integrate them into the workforce and community.",
  },
  {
    name: "Brodrene Ervik",
    url: "https://brodrene-ervik.vercel.app/",
    description: "A project developed for a Norwegian construction company, highlighting their services and previous work.",
  },
  {
    name: "Bærum Bygg Fornyelse",
    url: "https://www.baerumbyggfornyelse.no/",
    description: "A construction and renovation company based in Bærum, specializing in building renewal projects. This was one of the developer's first external projects.",
  },
  {
    name: "Designr.pro",
    url: "https://www.designr.pro",
    description: "The personal brand homepage and CV of a professional designer, showcasing various design projects, work philosophy, and professional experience.",
  },
  {
    name: "Alcatelz",
    url: "https://www.alcatelz.com/",
    description: "A personal portfolio page displaying various projects and outlining the creator's work philosophy.",
  },
];

// Main component rendering the page
export default function Projects() {
  return (
    <ScrollContainer>
      {/* About Me section moved to the top */}
      <AboutMeSection>
        <Avatar src={AvatarImage} alt="Your Avatar" />
        <AboutMeTitle>Vegar Lee Berentsen</AboutMeTitle>
        <AboutMeText>
          Hi! I'm Vegar Lee Berentsen, a passionate developer and designer. I specialize in creating innovative solutions that 
          combine functionality with stunning visuals. Feel free to reach out to collaborate!
        </AboutMeText>
      </AboutMeSection>

      <h1>Projects</h1>

      {/* Project portfolio section */}
      <ProjectsContainer>
        {projects.map((project, index) => (
          <ProjectCard
            key={index}
            href={project.url}
            target="_blank" // Open in a new tab for App Store and websites
            rel="noopener noreferrer"
          >
            {project.image ? (
              <ProjectImage src={project.image} alt={project.name} />
            ) : (
              <ProjectPreview src={project.url} title={`${project.name} Preview`} />
            )}
            <ProjectTitle>{project.name}</ProjectTitle>
            <ProjectDescription>{project.description}</ProjectDescription>
          </ProjectCard>
        ))}
      </ProjectsContainer>
    </ScrollContainer>
  );
}