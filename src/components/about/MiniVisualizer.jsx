import React, { useState, useEffect, useRef } from 'react';

// Sample data - these would be pre-computed 2D projections of common words
const sampleWordVectors = {
  "king": [0.2, 0.8],
  "queen": [0.3, 0.9],
  "man": [-0.1, 0.7],
  "woman": [0.0, 0.8],
  "computer": [0.8, -0.3],
  "technology": [0.7, -0.2],
  "science": [0.6, -0.1],
  "art": [-0.7, -0.5],
  "music": [-0.8, -0.4],
  "painting": [-0.9, -0.6],
  "dog": [0.4, -0.8],
  "cat": [0.3, -0.9],
  "animal": [0.5, -0.7],
  "food": [-0.4, -0.2],
  "fruit": [-0.5, -0.3],
  "vegetable": [-0.6, -0.4]
};

// Sample full embeddings (simulated 10-dimensional vectors for demonstration)
const sampleFullEmbeddings = {
  "king": [0.2, 0.8, 0.42, -0.15, 0.33, 0.67, -0.28, 0.12, 0.55, -0.41],
  "queen": [0.3, 0.9, 0.38, -0.12, 0.29, 0.71, -0.31, 0.09, 0.61, -0.37],
  "man": [-0.1, 0.7, 0.25, -0.33, 0.41, 0.52, -0.19, 0.27, 0.48, -0.52],
  "woman": [0.0, 0.8, 0.22, -0.29, 0.38, 0.57, -0.22, 0.24, 0.53, -0.48],
  "computer": [0.8, -0.3, 0.61, 0.45, -0.22, -0.18, 0.73, 0.51, -0.09, 0.33],
  "technology": [0.7, -0.2, 0.58, 0.41, -0.19, -0.15, 0.69, 0.48, -0.05, 0.29],
  "science": [0.6, -0.1, 0.52, 0.38, -0.15, -0.09, 0.63, 0.44, -0.02, 0.25],
  "art": [-0.7, -0.5, -0.45, -0.33, -0.61, 0.22, -0.18, -0.39, 0.15, -0.27],
  "music": [-0.8, -0.4, -0.51, -0.37, -0.58, 0.19, -0.22, -0.43, 0.11, -0.31],
  "painting": [-0.9, -0.6, -0.57, -0.42, -0.65, 0.25, -0.15, -0.47, 0.18, -0.35],
  "dog": [0.4, -0.8, 0.22, 0.61, -0.45, -0.33, 0.18, 0.29, -0.51, 0.37],
  "cat": [0.3, -0.9, 0.19, 0.58, -0.42, -0.37, 0.15, 0.25, -0.48, 0.33],
  "animal": [0.5, -0.7, 0.27, 0.55, -0.39, -0.29, 0.22, 0.33, -0.45, 0.41],
  "food": [-0.4, -0.2, -0.25, 0.18, -0.33, 0.41, -0.52, 0.27, 0.19, -0.48],
  "fruit": [-0.5, -0.3, -0.29, 0.15, -0.37, 0.38, -0.48, 0.24, 0.22, -0.53],
  "vegetable": [-0.6, -0.4, -0.33, 0.12, -0.41, 0.35, -0.55, 0.21, 0.25, -0.57]
};

const MiniVisualizer = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hoveredWord, setHoveredWord] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 500, height: 400 });
  const [detailsPosition, setDetailsPosition] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState('2d');
  
  // Scale the coordinates to fit the canvas
  const scaleCoordinates = (coords) => {
    const padding = 50;
    const xScale = (canvasSize.width - padding * 2) / 2;
    const yScale = (canvasSize.height - padding * 2) / 2;
    
    return [
      (coords[0] * xScale) + (canvasSize.width / 2),
      (coords[1] * -yScale) + (canvasSize.height / 2)
    ];
  };
  
  // Draw the visualization
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions explicitly
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    
    // Horizontal axis
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    
    // Vertical axis
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    
    // Draw words
    Object.entries(sampleWordVectors).forEach(([word, vector]) => {
      const [x, y] = scaleCoordinates(vector);
      
      // Draw dot
      ctx.beginPath();
      
      if (selectedWord === word) {
        ctx.fillStyle = '#FFA500';
        ctx.arc(x, y, 6, 0, Math.PI * 2);
      } else if (word === hoveredWord) {
        ctx.fillStyle = 'rgba(255, 165, 0, 0.7)';
        ctx.arc(x, y, 5, 0, Math.PI * 2);
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.arc(x, y, 3, 0, Math.PI * 2);
      }
      
      ctx.fill();
      
      // Draw label
      ctx.font = word === hoveredWord || selectedWord === word 
        ? 'bold 14px Arial' 
        : '12px Arial';
      ctx.fillStyle = word === hoveredWord || selectedWord === word
        ? '#FFA500'
        : 'rgba(255, 255, 255, 0.8)';
      ctx.textAlign = 'center';
      ctx.fillText(word, x, y - 10);
    });
    
  }, [hoveredWord, selectedWord, canvasSize]);
  
  // Handle canvas mouse movement
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if mouse is over any word
    let foundWord = null;
    Object.entries(sampleWordVectors).forEach(([word, vector]) => {
      const [wordX, wordY] = scaleCoordinates(vector);
      const distance = Math.sqrt(Math.pow(x - wordX, 2) + Math.pow(y - wordY, 2));
      
      if (distance < 15) {
        foundWord = word;
      }
    });
    
    setHoveredWord(foundWord);
  };
  
  // Handle canvas click
  const handleClick = (e) => {
    if (hoveredWord) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const [wordX, wordY] = scaleCoordinates(sampleWordVectors[hoveredWord]);
      
      // Calculate position for the details panel
      // Try to position it to the right of the word, but if there's not enough space,
      // position it to the left
      let detailsX = wordX + 20;
      const detailsWidth = 300; // Approximate width of details panel
      
      if (detailsX + detailsWidth > canvasSize.width) {
        detailsX = wordX - detailsWidth - 20;
      }
      
      // Try to center vertically
      let detailsY = wordY - 100;
      if (detailsY < 0) {
        detailsY = 10;
      } else if (detailsY + 200 > canvasSize.height) {
        detailsY = canvasSize.height - 210;
      }
      
      setDetailsPosition({ x: detailsX, y: detailsY });
      setSelectedWord(hoveredWord);
      setShowDetails(true);
      setActiveTab('2d');
    } else {
      // If clicking outside a word, hide the details
      setShowDetails(false);
      setSelectedWord(null);
    }
  };
  
  // Update canvas size on window resize
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const width = Math.min(container.clientWidth - 40, 600);
      setCanvasSize({
        width,
        height: width * 0.8
      });
    };
    
    // Initial size update
    updateSize();
    
    // Add resize listener
    window.addEventListener('resize', updateSize);
    
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  
  // Handle document click to close details panel when clicking outside
  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (showDetails && canvasRef.current) {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if click is inside the canvas but outside any word
        if (x >= 0 && x <= canvasSize.width && y >= 0 && y <= canvasSize.height) {
          let clickedOnWord = false;
          Object.entries(sampleWordVectors).forEach(([word, vector]) => {
            const [wordX, wordY] = scaleCoordinates(vector);
            const distance = Math.sqrt(Math.pow(x - wordX, 2) + Math.pow(y - wordY, 2));
            
            if (distance < 15) {
              clickedOnWord = true;
            }
          });
          
          if (!clickedOnWord && !e.target.closest('.vector-details')) {
            setShowDetails(false);
            setSelectedWord(null);
          }
        }
      }
    };
    
    document.addEventListener('click', handleDocumentClick);
    
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [showDetails, canvasSize]);
  
  return (
    <div className="mini-visualizer">
      <h3>Interactive Word Embedding Demo</h3>
      <p>
        This simplified 2D visualization shows how words cluster based on meaning. 
        Similar words appear closer together in the embedding space.
      </p>
      <p className="instruction">
        <strong>Try it:</strong> Click on any word to see its vector representation.
      </p>
      
      <div className="canvas-container" ref={containerRef}>
        <canvas 
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          style={{ 
            cursor: hoveredWord ? 'pointer' : 'default',
            width: `${canvasSize.width}px`,
            height: `${canvasSize.height}px`
          }}
        />
        
        {showDetails && selectedWord && (
          <div 
            className="vector-details"
            style={{
              left: `${detailsPosition.x}px`,
              top: `${detailsPosition.y}px`
            }}
          >
            <div className="details-header">
              <h4>"{selectedWord}"</h4>
              <button className="close-button" onClick={() => {
                setShowDetails(false);
                setSelectedWord(null);
              }}>×</button>
            </div>
            
            <div className="details-tabs">
              <button 
                className={`tab-button ${activeTab === '2d' ? 'active' : ''}`}
                onClick={() => setActiveTab('2d')}
              >
                2D Vector
              </button>
              <button 
                className={`tab-button ${activeTab === 'full' ? 'active' : ''}`}
                onClick={() => setActiveTab('full')}
              >
                Full Vector
              </button>
              <button 
                className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                Info
              </button>
            </div>
            
            <div className="details-content">
              {activeTab === '2d' && (
                <div className="vector-display">
                  <div className="vector-label">2D Projection:</div>
                  <div className="vector-value">
                    <span className="vector-bracket">[</span>
                    {sampleWordVectors[selectedWord].map((value, index) => (
                      <span key={index}>
                        {value.toFixed(2)}
                        {index < sampleWordVectors[selectedWord].length - 1 && <span className="vector-comma">,</span>}
                      </span>
                    ))}
                    <span className="vector-bracket">]</span>
                  </div>
                  <div className="vector-explanation">
                    These are the coordinates used to position the word in this 2D visualization.
                  </div>
                </div>
              )}
              
              {activeTab === 'full' && (
                <div className="vector-display">
                  <div className="vector-label">Full Embedding (first 10 dimensions):</div>
                  <div className="vector-value">
                    <span className="vector-bracket">[</span>
                    {sampleFullEmbeddings[selectedWord].map((value, index) => (
                      <span key={index}>
                        {value.toFixed(2)}
                        {index < sampleFullEmbeddings[selectedWord].length - 1 && <span className="vector-comma">,</span>}
                      </span>
                    ))}
                    <span className="vector-bracket">]</span>
                  </div>
                  <div className="vector-explanation">
                    In real models, embeddings typically have ~300 dimensions.
                  </div>
                </div>
              )}
              
              {activeTab === 'info' && (
                <div className="info-content">
                  <p>Word embeddings represent words as vectors in a high-dimensional space where:</p>
                  <ul>
                    <li>Similar words are positioned close together</li>
                    <li>Relationships between words are preserved geometrically</li>
                    <li>Each dimension may capture some semantic aspect</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="explanation">
        <p>
          This is a simplified 2D projection of word embeddings. In reality, word embeddings 
          typically have hundreds of dimensions (e.g., 300) that capture different aspects of meaning.
        </p>
      </div>
      
      <style jsx>{`
        .mini-visualizer {
          margin-bottom: 2rem;
          padding: 1rem;
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
        }
        
        h3 {
          color: #FFA500;
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1.4rem;
        }
        
        h4 {
          color: #FFA500;
          margin: 0;
          font-size: 1.1rem;
        }
        
        p {
          line-height: 1.6;
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }
        
        .instruction {
          font-style: italic;
          color: rgba(255, 255, 255, 0.9);
        }
        
        .canvas-container {
          display: flex;
          justify-content: center;
          margin: 1.5rem 0;
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          padding: 1rem;
          width: 100%;
          position: relative;
        }
        
        canvas {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          display: block;
        }
        
        .explanation {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          font-style: italic;
          text-align: center;
        }
        
        strong {
          color: #FFA500;
        }
        
        /* Vector details panel */
        .vector-details {
          position: absolute;
          width: 300px;
          background-color: rgba(26, 26, 46, 0.95);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 165, 0, 0.3);
          z-index: 10;
          overflow: hidden;
        }
        
        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0.75rem;
          background-color: rgba(255, 165, 0, 0.1);
          border-bottom: 1px solid rgba(255, 165, 0, 0.2);
        }
        
        .close-button {
          background: transparent;
          border: none;
          color: white;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0;
          line-height: 1;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .details-tabs {
          display: flex;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .tab-button {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          padding: 0.5rem;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .tab-button:hover {
          background-color: rgba(255, 165, 0, 0.1);
        }
        
        .tab-button.active {
          background-color: rgba(255, 165, 0, 0.2);
          color: #FFA500;
          font-weight: bold;
        }
        
        .details-content {
          padding: 0.75rem;
          max-height: 200px;
          overflow-y: auto;
        }
        
        .vector-display {
          margin-bottom: 0.5rem;
        }
        
        .vector-label {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 0.25rem;
        }
        
        .vector-value {
          font-family: monospace;
          background-color: rgba(0, 0, 0, 0.3);
          padding: 0.5rem;
          border-radius: 4px;
          font-size: 0.9rem;
          overflow-x: auto;
          white-space: nowrap;
        }
        
        .vector-bracket {
          color: #FFA500;
          font-weight: bold;
        }
        
        .vector-comma {
          color: rgba(255, 255, 255, 0.7);
          margin-right: 2px;
        }
        
        .vector-explanation {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
          font-style: italic;
          margin-top: 0.25rem;
        }
        
        .info-content {
          font-size: 0.85rem;
        }
        
        .info-content p {
          margin-top: 0;
          margin-bottom: 0.5rem;
          font-size: 0.85rem;
        }
        
        .info-content ul {
          margin: 0;
          padding-left: 1.2rem;
        }
        
        .info-content li {
          margin-bottom: 0.25rem;
          font-size: 0.8rem;
        }
        
        @media (max-width: 768px) {
          .vector-details {
            width: 250px;
          }
          
          .vector-value {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MiniVisualizer; 