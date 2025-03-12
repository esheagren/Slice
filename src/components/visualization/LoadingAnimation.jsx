import React, { useEffect, useRef } from 'react';

const LoadingAnimation = ({ width = 200, height = 200 }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    
    let time = 0;
    
    const draw = (timestamp) => {
      // Clear canvas
    //   ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Center of canvas
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Increment time
      time += 0.005;
      
      // Create a subtle pulsing effect
      const pulseSize = Math.sin(time) * 0.1 + 0.9;
      
      // Draw a subtle particle field
      const numParticles = 200;
      const maxRadius = Math.min(width, height) * 1;
      
      for (let i = 0; i < numParticles; i++) {
        // Calculate particle position based on time and index
        const particleAngle = (i / numParticles) * Math.PI * 2 + time;
        const distance = maxRadius * (0.2 + 0.8 * Math.sin(particleAngle * 2 + time));
        
        // Position on a spiral pattern
        const x = centerX + Math.cos(particleAngle) * distance;
        const y = centerY + Math.sin(particleAngle) * distance;
        
        // Size based on position in the spiral
        const particleSize = 1.5 * (0.5 + 0.5 * Math.sin(particleAngle * 3 + time));
        
        // Opacity based on position
        const opacity = 0.2 + 0.12 * Math.sin(particleAngle + time);
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(x, y, particleSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 165, 0, ${opacity})`;
        ctx.fill();
      }
      
      // Draw a subtle glow in the center
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, maxRadius * 0.7
      );
      gradient.addColorStop(0, 'rgba(255, 140, 0, 0.04)');
      gradient.addColorStop(0.5, 'rgba(255, 140, 0, 0.02)');
      gradient.addColorStop(1, 'rgba(255, 140, 0, 0)');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Continue animation
      animationRef.current = requestAnimationFrame(draw);
    };
    
    // Start animation
    animationRef.current = requestAnimationFrame(draw);
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height]);
  
  return (
    <div className="loading-animation-container">
      <canvas ref={canvasRef} width={width} height={height} />
      <style jsx>{`
        .loading-animation-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
          background-color: transparent;
        }
      `}</style>
    </div>
  );
};

export default LoadingAnimation; 