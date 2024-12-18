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
  width: 100%;
  height: auto;
  border-radius: 10px;
  margin-bottom: 20px;
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
    url: "https://apps.apple.com/no/app/mapr/id6450910273", // App Store link for Mapr
    image: MaprLogo,
    description: "A modern data visualization platform (App) with Mapr logo.",
  }, 
  { 
    name: "Prima", 
    url: "https://prima-umber.vercel.app", 
    description: "A premium lifestyle and wellness brand." 
  },
  { 
    name: "Akthe", 
    url: "https://akthe.vercel.app", 
    description: "A tech-forward solution for remote work." 
  },
  { 
    name: "Lydhagen", 
    url: "https://lydhagen.vercel.app", 
    description: "A cutting-edge audio production studio." 
  },
  { 
    name: "Studio 51", 
    url: "https://prima-umber.vercel.app", 
    description: "An award-winning creative agency." 
  },
  { 
    name: "Høl i CVen", 
    url: "https://h-l-i-c-ven.vercel.app", 
    description: "A unique job-seeking platform." 
  },
  { 
    name: "Designr.pro", 
    url: "https://www.designr.pro", 
    description: "A tool for professional design projects." 
  },
  { 
    name: "Brodrene Ervik", 
    url: "https://brodrene-ervik.vercel.app/", 
    description: "A Norwegian construction company website." 
  },
  { 
    name: "Bærum Bygg Fornyelse", 
    url: "https://www.baerumbyggfornyelse.no/", 
    description: "A construction and renovation company in Bærum." 
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