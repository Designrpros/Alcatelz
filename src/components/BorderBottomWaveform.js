import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

// Styled component for the canvas
const Canvas = styled.canvas`
  width: 100%;
  height: 100px; /* Adjust height for waveform size */
  z-index: 1;
  position: relative;
`;

// Custom hook to draw the inverted waveform
const useInvertedWaveform = (canvasRef) => {
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const context = canvas.getContext('2d');
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    const drawWaveform = () => {
      context.clearRect(0, 0, WIDTH, HEIGHT);
      context.strokeStyle = '#000000'; // Waveform color (black)
      context.lineWidth = 3;           // Line thickness

      const step = 10;                 // Distance between waveform lines
      const maxBarHeight = 30;         // Max height of the waveform bars

      for (let i = 0; i < WIDTH / step; i++) {
        const barHeight = Math.random() * maxBarHeight;

        // Draw the lines pointing downwards (waveform closer to the text)
        context.beginPath();
        context.moveTo(i * step, 0);           // Start at the top
        context.lineTo(i * step, barHeight);   // Extend the bar downwards
        context.stroke();
      }
    };

    const animate = () => {
      setTimeout(() => {
        drawWaveform();
        requestAnimationFrame(animate);
      }, 300); // Animation speed
    };

    animate();
  }, [canvasRef]);
};

// Inverted waveform component
const BorderBottomWaveform = () => {
  const canvasRef = useRef(null);
  useInvertedWaveform(canvasRef);

  return <Canvas ref={canvasRef} />;
};

export default BorderBottomWaveform;