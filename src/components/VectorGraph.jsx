import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const VectorGraph = ({ words, midpointWords, numMidpoints, serverUrl = 'http://localhost:5001' }) => {
  const [coordinates, setCoordinates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (!words || words.length === 0) return;
    
    const fetchCoordinates = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Create array of all words to visualize
        const allWords = [...words];
        
        // Add related words if available
        const hasRelatedWords = midpointWords && midpointWords.length > 0;
        
        if (hasRelatedWords) {
          // Add all words from all clusters
          midpointWords.forEach(cluster => {
            if (cluster && cluster.words) {
              allWords.push(...cluster.words.map(item => item.word));
            }
          });
        }
        
        // Make sure we have unique words only
        const uniqueWords = [...new Set(allWords)];
        
        console.log('Fetching coordinates for words:', uniqueWords);
        
        // Get the vector coordinates for visualization
        const response = await axios.post(`${serverUrl}/api/getVectorCoordinates`, { 
          words: uniqueWords
        });
        
        // Now fetch the actual vector data for each word for the tooltips
        const vectorPromises = uniqueWords.map(async (word) => {
          try {
            const vectorResponse = await axios.post(`${serverUrl}/api/checkWord`, { word });
            return {
              word,
              vector: vectorResponse.data.data.word.vector
            };
          } catch (error) {
            console.error(`Error fetching vector for ${word}:`, error);
            return { word, vector: null };
          }
        });
        
        const vectorResults = await Promise.all(vectorPromises);
        const vectorMap = Object.fromEntries(
          vectorResults.map(item => [item.word, item.vector])
        );
        
        // Combine coordinate data with vector data
        const coordinatesWithVectors = response.data.data.map(point => {
          return {
            ...point,
            truncatedVector: vectorMap[point.word] || `Vector for ${point.word}`
          };
        });
        
        setCoordinates(coordinatesWithVectors);
      } catch (error) {
        console.error('Error fetching coordinates:', error);
        setError(error.response?.data?.error || 'Failed to get visualization data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCoordinates();
  }, [words, midpointWords, serverUrl]);
  
  // Set up canvas size based on container
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    
    const resizeCanvas = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      
      // Make canvas fill the container with padding
      canvas.width = container.clientWidth - 40; // 20px padding on each side
      canvas.height = container.clientHeight - 40; // 20px padding on each side
      
      // Redraw if we have data
      if (coordinates.length > 0) {
        drawVisualization();
      }
    };
    
    // Initial resize
    resizeCanvas();
    
    // Add resize listener
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [containerRef, canvasRef, coordinates]);
  
  // Draw the visualization
  const drawVisualization = () => {
    if (!coordinates.length || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Find min/max values to scale the plot
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    coordinates.forEach(point => {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    });
    
    // Add some padding to the graph area (20% of the range)
    const paddingX = (maxX - minX) * 0.2;
    const paddingY = (maxY - minY) * 0.2;
    
    minX -= paddingX;
    maxX += paddingX;
    minY -= paddingY;
    maxY += paddingY;
    
    // Scale factors for converting data coordinates to canvas coordinates
    const scaleX = width / (maxX - minX);
    const scaleY = height / (maxY - minY);
    
    // Function to convert data coordinates to canvas coordinates
    const toCanvasX = x => (x - minX) * scaleX;
    const toCanvasY = y => height - (y - minY) * scaleY; // Flip Y axis
    
    // Draw axes (optional)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Draw grid lines
    const gridCount = 5;
    ctx.beginPath();
    for (let i = 0; i <= gridCount; i++) {
      const x = (i / gridCount) * width;
      const y = (i / gridCount) * height;
      
      // Horizontal line
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      
      // Vertical line
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    ctx.stroke();
    
    // Prepare to draw points
    const points = [];
    
    // Draw points for each word
    coordinates.forEach(point => {
      const x = toCanvasX(point.x);
      const y = toCanvasY(point.y);
      
      // Determine if this is a primary word or a related word
      const isPrimaryWord = words.includes(point.word);
      
      // Set point size and color based on whether it's a primary or related word
      const radius = isPrimaryWord ? 8 : 5;
      
      // Get color for the point
      let color;
      if (isPrimaryWord) {
        // Use a specific color for each primary word
        const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#9C27B0', '#FF9800', '#00BCD4'];
        const wordIndex = words.indexOf(point.word);
        color = colors[wordIndex % colors.length];
      } else {
        // Use a neutral color for related words
        color = 'rgba(150, 150, 150, 0.7)';
      }
      
      // Store point data for hover detection
      points.push({
        x,
        y,
        radius,
        word: point.word,
        color,
        isPrimary: isPrimaryWord,
        truncatedVector: point.truncatedVector
      });
      
      // Draw point
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      
      // Add a subtle glow effect
      ctx.beginPath();
      ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
      ctx.fillStyle = `${color}33`; // Add transparency
      ctx.fill();
      
      // Draw label for primary words
      if (isPrimaryWord) {
        const label = point.word;
        
        // First draw a semi-transparent background for the text
        ctx.font = 'bold 14px Arial';
        const textMetrics = ctx.measureText(label);
        const textWidth = textMetrics.width;
        const textHeight = 14; // Approximate height for the font size
        
        // Only draw text background if there's text to display
        if (label) {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.7)'; // Semi-transparent dark background
          ctx.fillRect(x - textWidth/2 - 4, y - textHeight - 14, textWidth + 8, textHeight + 4);
          
          // Then draw the text
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(label, x, y - 12);
        }
      }
    });
    
    // Add mouse move listener for hover effect
    canvas.onmousemove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Check if mouse is over any point
      let hoveredPoint = null;
      
      for (const point of points) {
        const distance = Math.sqrt(
          Math.pow(mouseX - point.x, 2) + Math.pow(mouseY - point.y, 2)
        );
        
        if (distance <= point.radius) {
          hoveredPoint = point;
          break;
        }
      }
      
      if (hoveredPoint) {
        canvas.style.cursor = 'pointer';
        
        // Clear any previous tooltip
        const existingTooltip = document.getElementById('vector-tooltip');
        if (existingTooltip) {
          existingTooltip.remove();
        }
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.id = 'vector-tooltip';
        tooltip.style.position = 'absolute';
        tooltip.style.left = `${e.clientX + 10}px`;
        tooltip.style.top = `${e.clientY + 10}px`;
        tooltip.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '8px 12px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '14px';
        tooltip.style.zIndex = '1000';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.maxWidth = '300px';
        tooltip.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        
        tooltip.innerHTML = `<strong>${hoveredPoint.word}</strong><br>${hoveredPoint.truncatedVector}`;
        
        document.body.appendChild(tooltip);
      } else {
        canvas.style.cursor = 'default';
        
        // Remove tooltip if not hovering over any point
        const existingTooltip = document.getElementById('vector-tooltip');
        if (existingTooltip) {
          existingTooltip.remove();
        }
      }
    };
    
    // Clean up tooltip when mouse leaves canvas
    canvas.onmouseleave = () => {
      const existingTooltip = document.getElementById('vector-tooltip');
      if (existingTooltip) {
        existingTooltip.remove();
      }
    };
  };
  
  // Draw visualization when coordinates change
  useEffect(() => {
    drawVisualization();
  }, [coordinates]);
  
  // Clean up event listeners when component unmounts
  useEffect(() => {
    return () => {
      if (canvasRef.current) {
        canvasRef.current.onmousemove = null;
        canvasRef.current.onmouseleave = null;
      }
      
      const existingTooltip = document.getElementById('vector-tooltip');
      if (existingTooltip) {
        existingTooltip.remove();
      }
    };
  }, []);
  
  return (
    <div className="graph-container" ref={containerRef}>
      {loading ? (
        <div className="graph-loading">
          <p>Generating visualization...</p>
        </div>
      ) : error ? (
        <div className="graph-error">
          <p>Error: {error}</p>
        </div>
      ) : (
        <div className="graph-content">
          <canvas ref={canvasRef} className="vector-canvas" />
        </div>
      )}
      
      <style jsx>{`
        .graph-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #0f172a;
          border-radius: 8px;
          overflow: hidden;
          margin-top: 0; /* Remove any top margin */
        }
        
        .graph-loading, .graph-error {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          width: 100%;
          color: #94a3b8;
        }
        
        .graph-content {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          padding: 20px;
        }
        
        .vector-canvas {
          background-color: #1e293b;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default VectorGraph; 