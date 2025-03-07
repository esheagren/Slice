import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const VectorGraph = ({ word1, word2, midpointWords, recursionDepth = 1 }) => {
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
        
        const serverUrl = 'http://localhost:5001'; // Adjust port if needed
        const response = await axios.post(`${serverUrl}/api/getVectorCoordinates`, { words });
        
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
    const ctx = canvas.getContext('2d');
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
    const padding = 40;
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
    
    // Draw lines connecting clusters
    if (midpointWords && midpointWords.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 2]);
      
      // Find the word1 and word2 points
      const word1Point = coordinates.find(p => p.word === word1);
      const word2Point = coordinates.find(p => p.word === word2);
      
      // Draw connections between clusters based on their hierarchy
      if (word1Point && word2Point) {
        // Draw the main connection between word1 and word2
        ctx.moveTo(toCanvasX(word1Point.x), toCanvasY(word1Point.y));
        ctx.lineTo(toCanvasX(word2Point.x), toCanvasY(word2Point.y));
        
        // Draw connections to midpoint clusters if they exist
        midpointWords.forEach(cluster => {
          if (cluster && cluster.words && cluster.words.length > 0) {
            // Find a representative word from this cluster to draw the connection
            const clusterWord = cluster.words[0].word;
            const clusterPoint = coordinates.find(p => p.word === clusterWord);
            
            if (clusterPoint) {
              // Draw connection from parent points to this cluster
              if (cluster.parent1 && cluster.parent2) {
                const parent1Point = coordinates.find(p => p.word === cluster.parent1);
                const parent2Point = coordinates.find(p => p.word === cluster.parent2);
                
                if (parent1Point) {
                  ctx.moveTo(toCanvasX(parent1Point.x), toCanvasY(parent1Point.y));
                  ctx.lineTo(toCanvasX(clusterPoint.x), toCanvasY(clusterPoint.y));
                }
                
                if (parent2Point) {
                  ctx.moveTo(toCanvasX(parent2Point.x), toCanvasY(parent2Point.y));
                  ctx.lineTo(toCanvasX(clusterPoint.x), toCanvasY(clusterPoint.y));
                }
              }
            }
          }
        });
      }
      
      ctx.stroke();
      ctx.setLineDash([]);
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
        ctx.arc(x, y, 6, 0, Math.PI * 2);
      } else if (point.word === word2) {
        ctx.fillStyle = '#EA4335'; // Red for word2
        ctx.arc(x, y, 6, 0, Math.PI * 2);
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
        
        // Color based on cluster index (primary vs secondary midpoints)
        const colors = ['#34A853', '#FBBC05', '#4285F4', '#EA4335', '#9C27B0', '#FF9800'];
        ctx.fillStyle = colors[clusterIndex % colors.length] || '#34A853';
        ctx.arc(x, y, 4, 0, Math.PI * 2);
      }
      
      ctx.fill();
      
      // Draw label with larger font size
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(point.word, x, y - 10);
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
            {midpointWords && midpointWords.map((cluster, index) => (
              <div className="legend-item" key={index}>
                <span className="legend-color" style={{
                  backgroundColor: ['#34A853', '#FBBC05', '#4285F4', '#EA4335', '#9C27B0'][index % 5]
                }}></span>
                <span className="legend-label">
                  {index === 0 ? 'Primary Midpoint' : `Secondary Midpoint ${index}`}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default VectorGraph; 