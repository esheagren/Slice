import React, { useEffect, useRef, useState } from 'react';
import { createTooltip, removeTooltip } from './VectorTooltip';
import { getPointColor } from './VectorUtils';
import SimpleLoadingAnimation from './SimpleLoadingAnimation';

const VectorGraph2D = ({ coordinates, words, containerRef }) => {
  const canvasRef = useRef(null);
  const pointsRef = useRef([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setIsLoading(coordinates.length === 0);
    
    const resizeCanvas = () => {
      if (!containerRef.current || !canvasRef.current) {
        console.log('Missing refs:', { 
          container: !!containerRef.current, 
          canvas: !!canvasRef.current 
        });
        return;
      }
      
      const container = containerRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      console.log('Canvas dimensions:', { width, height });
      
      // Resize 2D canvas with explicit dimensions
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      canvasRef.current.style.width = `${width}px`;
      canvasRef.current.style.height = `${height}px`;
      
      // Redraw visualization if we have coordinates
      if (coordinates.length > 0) {
        drawVisualization();
        setIsLoading(false);
      } else {
        console.log('No coordinates to draw');
        setIsLoading(true);
        
        // Draw empty state with visible background
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#1a1a2e'; // Dark blue background
          ctx.fillRect(0, 0, width, height);
        }
      }
    };
    
    // Initial resize
    resizeCanvas();
    
    // Add resize event listener
    window.addEventListener('resize', resizeCanvas);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [coordinates, containerRef]);
  
  const drawVisualization = () => {
    if (!coordinates.length || !canvasRef.current) {
      console.log('Cannot draw visualization:', { 
        hasCoordinates: coordinates.length > 0,
        hasCanvas: !!canvasRef.current
      });
      return;
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('Failed to get 2D context from canvas');
      return;
    }
    
    console.log('Drawing 2D visualization with', coordinates.length, 'points');
    
    // Clear the canvas with a visible background color
    ctx.fillStyle = '#1a1a2e'; // Dark blue background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Find min/max values to scale the plot
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    coordinates.forEach(point => {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    });
    
    // Add padding
    const padding = 50;
    const plotWidth = canvas.width - (padding * 2);
    const plotHeight = canvas.height - (padding * 2);
    
    // Scale function to map coordinates to canvas
    const scaleX = (x) => padding + ((x - minX) / (maxX - minX)) * plotWidth;
    const scaleY = (y) => padding + ((y - minY) / (maxY - minY)) * plotHeight;
    
    // Draw points
    pointsRef.current = [];
    
    coordinates.forEach(point => {
      const x = scaleX(point.x);
      const y = scaleY(point.y);
      const isPrimary = words.includes(point.word);
      const radius = isPrimary ? 8 : 5;
      
      // Store point info for interaction
      pointsRef.current.push({
        ...point,
        x,
        y,
        radius,
        isPrimary
      });
      
      // Draw point
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = getPointColor(point.word, words, isPrimary);
      ctx.fill();
      
      // Draw label
      ctx.font = isPrimary ? 'bold 14px Arial' : '12px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(point.word, x, y - radius - 5);
    });
  };
  
  // Handle mouse interactions
  const handleMouseMove = (e) => {
    if (!canvasRef.current || !pointsRef.current.length) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Check if mouse is over any point
    let hoveredPoint = null;
    
    for (const point of pointsRef.current) {
      const distance = Math.sqrt(
        Math.pow(mouseX - point.x, 2) + Math.pow(mouseY - point.y, 2)
      );
      
      if (distance <= point.radius) {
        hoveredPoint = point;
        break;
      }
    }
    
    if (hoveredPoint) {
      canvasRef.current.style.cursor = 'pointer';
      createTooltip(hoveredPoint, e);
    } else {
      canvasRef.current.style.cursor = 'default';
      removeTooltip();
    }
  };
  
  const handleMouseLeave = () => {
    removeTooltip();
  };
  
  return (
    <>
      {isLoading ? (
        <SimpleLoadingAnimation 
          width={containerRef.current?.clientWidth || 800} 
          height={containerRef.current?.clientHeight || 600} 
        />
      ) : (
        <canvas 
          ref={canvasRef} 
          className="vector-canvas"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
      )}
    </>
  );
};

export default VectorGraph2D;