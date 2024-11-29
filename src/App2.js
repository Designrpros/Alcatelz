import React from "react";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import styled from "styled-components";
import HomeScreen from "./HomeScreen"; // Importing the HomeScreen component
import KontaktScreen from "./Projects"; // Importing the KontaktScreen component

// Styled Components for the toolbar and tabs
const Toolbar = styled.div`
  background-color: #333;
  padding: 15px;
  display: flex;
  justify-content: space-around;
  position: fixed; /* Fix the toolbar at the top */
  width: 100%; /* Make sure it stretches across the screen */
  top: 0;
  z-index: 1000; /* Ensures toolbar stays on top of other content */
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

// Navigation Link Styled Component
const StyledLink = styled(Link)`
  text-decoration: none;
`;

const AppContainer = styled.div`
  margin-top: 60px; /* Space for the fixed toolbar */
  min-height: 100vh; /* Ensure content takes at least the full screen height */
  display: flex;
  flex-direction: column;
`;

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navigation Toolbar */}
        <Toolbar>
          <StyledLink to="/brødrene-ervik">
            <Tab>Alcatelz</Tab>
          </StyledLink>
          <StyledLink to="/kontakt">
            <Tab>About</Tab>
          </StyledLink>
        </Toolbar>

        {/* Page content */}
        <AppContainer>
          <Routes>
            {/* Set HomeScreen as default */}
            <Route path="/" element={<HomeScreen />} /> {/* HomeScreen as default route */}
            <Route path="/brødrene-ervik" element={<HomeScreen />} /> {/* HomeScreen as Brødrene Ervik page */}
            <Route path="/kontakt" element={<KontaktScreen />} /> {/* KontaktScreen as Kontakt page */}
          </Routes>
        </AppContainer>
      </div>
    </Router>
  );
}

export default App;