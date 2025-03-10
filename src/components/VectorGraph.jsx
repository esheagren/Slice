import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const VectorGraph = ({ words, midpointWords, recursionDepth, numMidpoints, serverUrl = 'http://localhost:5001' }) => {
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
        
        // Add midpoint words if available - only if midpointWords has content
        // This means the Find Midpoints button was clicked
        const hasMidpoints = midpointWords && midpointWords.length > 0;
        
        if (hasMidpoints) {
          // Add all words from all midpoint clusters
          midpointWords.forEach(cluster => {
            if (cluster && cluster.words) {
              allWords.push(...cluster.words.map(item => item.word));
            }
          });
        }
        
        // Make sure we have unique words only
        const uniqueWords = [...new Set(allWords)];
        
        console.log('Fetching coordinates for words:', uniqueWords);
        
        // First get the vector coordinates for visualization
        const response = await axios.post(`${serverUrl}/api/getVectorCoordinates`, { 
          words: uniqueWords,
          // Only calculate midpoint if midpointWords has content
          calculateMidpoint: hasMidpoints
        });
        
        // Now fetch the actual vector data for each word for the tooltips
        const vectorPromises = uniqueWords.map(async (word) => {
          try {
            const vectorResponse = await axios.post(`${serverUrl}/api/submit`, { word1: word, word2: word });
            return {
              word,
              vector: vectorResponse.data.data.word1.vector
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
            truncatedVector: point.isExactMidpoint ? point.truncatedVector : 
                             vectorMap[point.word] || `Vector for ${point.word}`
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
      
      // Make canvas fill the container
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      
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
    
    // Add some padding
    const padding = 60;
    const scaleX = (width - 2 * padding) / (maxX - minX || 1);
    const scaleY = (height - 2 * padding) / (maxY - minY || 1);
    
    // Function to convert data coordinates to canvas coordinates
    const toCanvasX = x => padding + (x - minX) * scaleX;
    const toCanvasY = y => height - padding - (y - minY) * scaleY; // Flip Y axis
    
    // Draw coordinate axes and grid
    ctx.beginPath();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.5;
    
    // Draw grid lines
    const gridCount = 8;
    const xStep = (maxX - minX) / gridCount;
    const yStep = (maxY - minY) / gridCount;
    
    // Horizontal grid lines
    for (let i = 0; i <= gridCount; i++) {
      const y = minY + i * yStep;
      const canvasY = toCanvasY(y);
      
      ctx.moveTo(padding, canvasY);
      ctx.lineTo(width - padding, canvasY);
      
      // Y-axis labels
      ctx.fillStyle = '#64748b';
      ctx.font = '8px Arial';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(y.toFixed(1), padding - 5, canvasY);
    }
    
    // Vertical grid lines
    for (let i = 0; i <= gridCount; i++) {
      const x = minX + i * xStep;
      const canvasX = toCanvasX(x);
      
      ctx.moveTo(canvasX, padding);
      ctx.lineTo(canvasX, height - padding);
      
      // X-axis labels
      ctx.fillStyle = '#64748b';
      ctx.font = '8px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(x.toFixed(1), canvasX, height - padding + 5);
    }
    
    ctx.stroke();
    
    // Draw lines connecting the points if midpoints are available
    if (midpointWords && midpointWords.length > 0) {
      midpointWords.forEach(cluster => {
        if (cluster && cluster.parent1 && cluster.parent2) {
          const parent1Point = coordinates.find(p => p.word === cluster.parent1);
          const parent2Point = coordinates.find(p => p.word === cluster.parent2);
          const exactMidpointPoint = coordinates.find(p => 
            p.isExactMidpoint && 
            p.parent1 === cluster.parent1 && 
            p.parent2 === cluster.parent2
          );
          
          if (parent1Point && parent2Point) {
            ctx.beginPath();
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 2]);
            
            // Only draw lines through midpoint if exactMidpointPoint exists
            if (exactMidpointPoint) {
              ctx.moveTo(toCanvasX(parent1Point.x), toCanvasY(parent1Point.y));
              ctx.lineTo(toCanvasX(exactMidpointPoint.x), toCanvasY(exactMidpointPoint.y));
              ctx.lineTo(toCanvasX(parent2Point.x), toCanvasY(parent2Point.y));
            } else {
              // Direct line if no midpoint
              ctx.moveTo(toCanvasX(parent1Point.x), toCanvasY(parent1Point.y));
              ctx.lineTo(toCanvasX(parent2Point.x), toCanvasY(parent2Point.y));
            }
            
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      });
    }
    
    // Store point coordinates for hover detection
    const points = [];
    
    // Draw points and labels
    coordinates.forEach(point => {
      const x = toCanvasX(point.x);
      const y = toCanvasY(point.y);
      
      // Store point data for hover detection
      points.push({
        x, 
        y, 
        radius: point.isExactMidpoint ? 10 : (words.includes(point.word) ? 8 : 6),
        word: point.word,
        truncatedVector: point.truncatedVector
      });
      
      // Draw point
      ctx.beginPath();
      
      // Different colors for different types of words
      if (words.includes(point.word)) {
        // Use a color based on the index in the words array
        const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#9C27B0', '#FF9800', '#00BCD4'];
        const colorIndex = words.indexOf(point.word) % colors.length;
        ctx.fillStyle = colors[colorIndex];
        ctx.arc(x, y, 8, 0, Math.PI * 2);
      } else if (point.isExactMidpoint) {
        ctx.fillStyle = '#FBBC05'; // Yellow for the exact midpoint
        ctx.arc(x, y, 10, 0, Math.PI * 2);
      } else {
        // Find which cluster this word belongs to
        let clusterIndex = -1;
        if (midpointWords) {
          for (let i = 0; i < midpointWords.length; i++) {
            if (midpointWords[i] && midpointWords[i].words) {
              const found = midpointWords[i].words.some(item => item.word === point.word);
              if (found) {
                clusterIndex = i;
                break;
              }
            }
          }
        }
        
        // Color based on cluster index
        const colors = ['#34A853', '#4285F4', '#EA4335', '#9C27B0', '#FF9800'];
        ctx.fillStyle = colors[clusterIndex % colors.length] || '#34A853';
        ctx.arc(x, y, 6, 0, Math.PI * 2);
      }
      
      ctx.fill();
      
      // Add a dark outline to the points for better visibility
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // Draw label with improved visibility
      const label = point.isExactMidpoint ? "" : point.word;
      
      // First draw a semi-transparent background for the text
      ctx.font = 'bold 16px Arial';
      const textMetrics = ctx.measureText(label);
      const textWidth = textMetrics.width;
      const textHeight = 16; // Approximate height for the font size
      
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
    });
    
    // Add mouse move listener for hover effect
    canvas.onmousemove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Check if mouse is over any point
      let hoveredPoint = null;
      for (const point of points) {
        const distance = Math.sqrt((mouseX - point.x) ** 2 + (mouseY - point.y) ** 2);
        if (distance <= point.radius) {
          hoveredPoint = point;
          break;
        }
      }
      
      // Show tooltip if hovering over a point
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
        <>
          <canvas ref={canvasRef} className="vector-canvas" />
          <div className="graph-legend">
            {words.map((word, index) => {
              const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#9C27B0', '#FF9800', '#00BCD4'];
              return (
                <div key={index} className="legend-item">
                  <span className="legend-color" style={{backgroundColor: colors[index % colors.length]}}></span>
                  <span className="legend-label">{word}</span>
                </div>
              );
            })}
            {midpointWords && midpointWords.length > 0 && (
              <div className="legend-item">
                <span className="legend-color" style={{backgroundColor: '#34A853'}}></span>
                <span className="legend-label">Related Words</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default VectorGraph; 