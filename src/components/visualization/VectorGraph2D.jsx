import React, { useEffect, useRef, useState } from 'react';
import { createTooltip, removeTooltip } from './VectorTooltip';
import { getPointColor } from './VectorUtils';

const VectorGraph2D = ({ coordinates, words, containerRef }) => {
  const canvasRef = useRef(null);
  const pointsRef = useRef([]);
  
  useEffect(() => {
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
      } else {
        console.log('No coordinates to draw');
        // Draw empty state with visible background
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#1a1a2e'; // Dark blue background
          ctx.fillRect(0, 0, width, height);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.font = '16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Waiting for data...', width/2, height/2);
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
    
    // Calculate the range of the data
    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    
    // Add padding as a percentage of the canvas size
    const paddingPercentage = 0.15; // 15% padding on each side
    const paddingX = canvas.width * paddingPercentage;
    const paddingY = canvas.height * paddingPercentage;
    
    // Calculate available space for plotting
    const plotWidth = canvas.width - (paddingX * 2);
    const plotHeight = canvas.height - (paddingY * 2);
    
    // Determine the aspect ratio of the data and the canvas
    const dataAspectRatio = rangeX / rangeY;
    const canvasAspectRatio = plotWidth / plotHeight;
    
    // Adjust scaling to maintain aspect ratio and center the plot
    let scaleX, scaleY, offsetX, offsetY;
    
    if (dataAspectRatio > canvasAspectRatio) {
      // Data is wider than canvas, scale based on width
      scaleX = plotWidth / rangeX;
      scaleY = scaleX; // Keep aspect ratio
      offsetX = paddingX;
      offsetY = paddingY + (plotHeight - (rangeY * scaleY)) / 2; // Center vertically
    } else {
      // Data is taller than canvas, scale based on height
      scaleY = plotHeight / rangeY;
      scaleX = scaleY; // Keep aspect ratio
      offsetY = paddingY;
      offsetX = paddingX + (plotWidth - (rangeX * scaleX)) / 2; // Center horizontally
    }
    
    // Scale function to map coordinates to canvas
    const mapX = (x) => offsetX + (x - minX) * scaleX;
    const mapY = (y) => offsetY + (y - minY) * scaleY;
    
    // Draw points
    pointsRef.current = [];
    
    coordinates.forEach(point => {
      const x = mapX(point.x);
      const y = mapY(point.y);
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
    <canvas 
      ref={canvasRef} 
      className="vector-canvas"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    />
  );
};

export default VectorGraph2D;