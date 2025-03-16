import React from "react";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import styled from "styled-components";
import Hero from "./Hero"; // Importing the Hero component
import Philosophy from "./Philosophy"; // Corrected import for Philosophy component
import Projects from "./Projects"; // Importing Projects component

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
`;

const Tab = styled.div`
  color: #fff;
  font-size: 18px;
  padding: 10px 20px;
  cursor: pointer;
  text-align: center;
  &:hover {
    background-color: #555;
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
`;

const AppContainer = styled.div`
  margin-top: 60px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const App = () => {
  return (
    <Router>
      <div className="App">
        {/* Navigation Toolbar */}
        <Toolbar>
          <StyledLink to="/">
            <Tab>Alcatelz</Tab>
          </StyledLink>
          <StyledLink to="/philosophy">
            <Tab>Philosophy</Tab>
          </StyledLink>
          <StyledLink to="/projects">
            <Tab>Projects</Tab>
          </StyledLink>
        </Toolbar>

        {/* Page content */}
        <AppContainer>
          <Routes>
            <Route path="/" element={<Hero />} /> {/* Hero as default route */}
            <Route path="/philosophy" element={<Philosophy />} /> {/* Philosophy page */}
            <Route path="/projects" element={<Projects />} /> {/* Projects page */}
          </Routes>
        </AppContainer>
      </div>
    </Router>
  );
};

export default App;