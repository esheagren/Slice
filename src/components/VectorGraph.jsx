import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const VectorGraph = ({ word1, word2, midpointWords }) => {
  const [coordinates, setCoordinates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (!word1 || !word2) return;
    
    const fetchCoordinates = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Create array of all words to visualize
        const words = [word1, word2];
        
        // Add midpoint words if available
        if (midpointWords && midpointWords.length > 0) {
          // Add all words from all midpoint clusters
          midpointWords.forEach(cluster => {
            if (cluster && cluster.words) {
              words.push(...cluster.words.map(item => item.word));
            }
          });
        }
        
        // Make sure we have unique words only
        const uniqueWords = [...new Set(words)];
        
        const serverUrl = 'http://localhost:5001'; // Adjust port if needed
        console.log('Fetching coordinates for words:', uniqueWords);
        const response = await axios.post(`${serverUrl}/api/getVectorCoordinates`, { words: uniqueWords });
        
        setCoordinates(response.data.data);
      } catch (error) {
        console.error('Error fetching coordinates:', error);
        setError(error.response?.data?.error || 'Failed to get visualization data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCoordinates();
  }, [word1, word2, midpointWords]);
  
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
    
    // Find the points for word1, word2, and midpoint
    const word1Point = coordinates.find(p => p.word === word1);
    const word2Point = coordinates.find(p => p.word === word2);
    const exactMidpointPoint = coordinates.find(p => p.isExactMidpoint);
    
    // Draw lines connecting the points
    if (word1Point && word2Point) {
      ctx.beginPath();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 2]);
      
      // If we have an exact midpoint, draw lines through it
      if (exactMidpointPoint) {
        ctx.moveTo(toCanvasX(word1Point.x), toCanvasY(word1Point.y));
        ctx.lineTo(toCanvasX(exactMidpointPoint.x), toCanvasY(exactMidpointPoint.y));
        ctx.lineTo(toCanvasX(word2Point.x), toCanvasY(word2Point.y));
      } else {
        // Direct line if no midpoint
        ctx.moveTo(toCanvasX(word1Point.x), toCanvasY(word1Point.y));
        ctx.lineTo(toCanvasX(word2Point.x), toCanvasY(word2Point.y));
      }
      
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Draw additional lines for recursive midpoints if they exist
    if (midpointWords && midpointWords.length > 0) {
      // Draw lines for primary midpoint cluster
      const primaryMidpointWords = midpointWords[0]?.words || [];
      if (primaryMidpointWords.length > 0 && word1Point && word2Point && exactMidpointPoint) {
        ctx.beginPath();
        ctx.strokeStyle = '#34A853'; // Green for primary midpoint connections
        ctx.lineWidth = 0.8;
        ctx.setLineDash([2, 2]);
        
        primaryMidpointWords.forEach(item => {
          const point = coordinates.find(p => p.word === item.word);
          if (point) {
            ctx.moveTo(toCanvasX(exactMidpointPoint.x), toCanvasY(exactMidpointPoint.y));
            ctx.lineTo(toCanvasX(point.x), toCanvasY(point.y));
          }
        });
        
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      // Draw lines for secondary midpoint clusters if they exist
      if (midpointWords.length > 1) {
        // Secondary midpoint between word1 and primary midpoint
        const secondaryMidpoint1Words = midpointWords[1]?.words || [];
        if (secondaryMidpoint1Words.length > 0 && word1Point && exactMidpointPoint) {
          ctx.beginPath();
          ctx.strokeStyle = '#4285F4'; // Blue for secondary midpoint connections
          ctx.lineWidth = 0.8;
          ctx.setLineDash([2, 2]);
          
          secondaryMidpoint1Words.forEach(item => {
            const point = coordinates.find(p => p.word === item.word);
            if (point) {
              ctx.moveTo(toCanvasX((word1Point.x + exactMidpointPoint.x) / 2), 
                         toCanvasY((word1Point.y + exactMidpointPoint.y) / 2));
              ctx.lineTo(toCanvasX(point.x), toCanvasY(point.y));
            }
          });
          
          ctx.stroke();
          ctx.setLineDash([]);
        }
        
        // Secondary midpoint between word2 and primary midpoint
        const secondaryMidpoint2Words = midpointWords[2]?.words || [];
        if (secondaryMidpoint2Words.length > 0 && word2Point && exactMidpointPoint) {
          ctx.beginPath();
          ctx.strokeStyle = '#EA4335'; // Red for secondary midpoint connections
          ctx.lineWidth = 0.8;
          ctx.setLineDash([2, 2]);
          
          secondaryMidpoint2Words.forEach(item => {
            const point = coordinates.find(p => p.word === item.word);
            if (point) {
              ctx.moveTo(toCanvasX((word2Point.x + exactMidpointPoint.x) / 2), 
                         toCanvasY((word2Point.y + exactMidpointPoint.y) / 2));
              ctx.lineTo(toCanvasX(point.x), toCanvasY(point.y));
            }
          });
          
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }
    
    // Draw points and labels
    coordinates.forEach(point => {
      const x = toCanvasX(point.x);
      const y = toCanvasY(point.y);
      
      // Draw point
      ctx.beginPath();
      
      // Different colors for different types of words
      if (point.word === word1) {
        ctx.fillStyle = '#4285F4'; // Blue for word1
        ctx.arc(x, y, 8, 0, Math.PI * 2);
      } else if (point.word === word2) {
        ctx.fillStyle = '#EA4335'; // Red for word2
        ctx.arc(x, y, 8, 0, Math.PI * 2);
      } else if (point.isExactMidpoint) {
        ctx.fillStyle = '#FBBC05'; // Yellow for the exact midpoint
        ctx.arc(x, y, 10, 0, Math.PI * 2); // Slightly larger for emphasis
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
      const label = point.isExactMidpoint ? "Exact Midpoint" : point.word;
      
      // First draw a semi-transparent background for the text
      ctx.font = 'bold 16px Arial';
      const textMetrics = ctx.measureText(label);
      const textWidth = textMetrics.width;
      const textHeight = 16; // Approximate height for the font size
      
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)'; // Semi-transparent dark background
      ctx.fillRect(x - textWidth/2 - 4, y - textHeight - 14, textWidth + 8, textHeight + 4);
      
      // Then draw the text
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(label, x, y - 12);
    });
  };
  
  // Draw visualization when coordinates change
  useEffect(() => {
    drawVisualization();
  }, [coordinates]);
  
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
            <div className="legend-item">
              <span className="legend-color" style={{backgroundColor: '#4285F4'}}></span>
              <span className="legend-label">{word1}</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{backgroundColor: '#EA4335'}}></span>
              <span className="legend-label">{word2}</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{backgroundColor: '#34A853'}}></span>
              <span className="legend-label">Related Words</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VectorGraph; 