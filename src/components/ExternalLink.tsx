// src/components/ExternalLink.tsx
"use client"; // Mark as client component if it's rendered within a client component

import React from "react";

interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
}

const ExternalLink: React.FC<ExternalLinkProps> = ({ href, children }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: "none", color: "inherit" }}
    >
      {children}
    </a>
  );
};

export default ExternalLink;