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

const MiniVisualizer = () => {
  const canvasRef = useRef(null);
  const [hoveredWord, setHoveredWord] = useState(null);
  const [selectedWords, setSelectedWords] = useState([]);
  const [showRelationship, setShowRelationship] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 500, height: 400 });
  
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
      
      if (selectedWords.includes(word)) {
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
      ctx.font = word === hoveredWord || selectedWords.includes(word) 
        ? 'bold 14px Arial' 
        : '12px Arial';
      ctx.fillStyle = word === hoveredWord || selectedWords.includes(word)
        ? '#FFA500'
        : 'rgba(255, 255, 255, 0.8)';
      ctx.textAlign = 'center';
      ctx.fillText(word, x, y - 10);
    });
    
    // Draw relationship line if two words are selected
    if (showRelationship && selectedWords.length === 2) {
      const [word1, word2] = selectedWords;
      const [x1, y1] = scaleCoordinates(sampleWordVectors[word1]);
      const [x2, y2] = scaleCoordinates(sampleWordVectors[word2]);
      
      // Draw line between words
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 165, 0, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Calculate midpoint
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      
      // Draw midpoint
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255, 165, 0, 0.8)';
      ctx.arc(midX, midY, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw midpoint label
      ctx.font = 'italic 12px Arial';
      ctx.fillStyle = '#FFA500';
      ctx.textAlign = 'center';
      ctx.fillText('midpoint', midX, midY - 10);
    }
    
  }, [hoveredWord, selectedWords, showRelationship, canvasSize]);
  
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
  const handleClick = () => {
    if (hoveredWord) {
      if (selectedWords.includes(hoveredWord)) {
        // Deselect word
        setSelectedWords(selectedWords.filter(word => word !== hoveredWord));
      } else if (selectedWords.length < 2) {
        // Select word (max 2)
        setSelectedWords([...selectedWords, hoveredWord]);
      } else {
        // Replace the first word
        setSelectedWords([hoveredWord, selectedWords[1]]);
      }
    }
  };
  
  // Update canvas size on window resize
  useEffect(() => {
    const updateSize = () => {
      const container = canvasRef.current?.parentElement;
      if (container) {
        const width = Math.min(container.clientWidth - 40, 600);
        setCanvasSize({
          width,
          height: width * 0.8
        });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  
  return (
    <div className="mini-visualizer">
      <h3>Interactive Word Embedding Demo</h3>
      <p>
        This simplified 2D visualization shows how words cluster based on meaning. 
        Similar words appear closer together in the embedding space.
      </p>
      <p className="instruction">
        <strong>Try it:</strong> Click on two words to see their relationship and midpoint.
      </p>
      
      <div className="canvas-container">
        <canvas 
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          style={{ cursor: hoveredWord ? 'pointer' : 'default' }}
        />
      </div>
      
      <div className="controls">
        <button 
          className={`relationship-button ${showRelationship ? 'active' : ''}`}
          onClick={() => setShowRelationship(!showRelationship)}
          disabled={selectedWords.length !== 2}
        >
          {showRelationship ? 'Hide Relationship' : 'Show Relationship'}
        </button>
        
        <button 
          className="reset-button"
          onClick={() => {
            setSelectedWords([]);
            setShowRelationship(false);
          }}
        >
          Reset Selection
        </button>
      </div>
      
      {selectedWords.length === 2 && showRelationship && (
        <div className="relationship-info">
          <p>
            Words <strong>{selectedWords[0]}</strong> and <strong>{selectedWords[1]}</strong> are 
            positioned in the embedding space based on their semantic similarity.
          </p>
          <p>
            The midpoint between them represents a blend of their meanings.
          </p>
        </div>
      )}
      
      <div className="explanation">
        <p>
          This is a simplified 2D projection of word embeddings. In Luminode's full application, 
          you can explore much richer visualizations with thousands of words in both 2D and 3D space.
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
        }
        
        canvas {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        
        .controls {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        button {
          background-color: rgba(26, 26, 46, 0.8);
          color: white;
          border: 1px solid rgba(255, 165, 0, 0.5);
          border-radius: 4px;
          padding: 0.5rem 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        button:hover:not(:disabled) {
          background-color: rgba(255, 165, 0, 0.2);
        }
        
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .relationship-button.active {
          background-color: rgba(255, 165, 0, 0.3);
          border-color: #FFA500;
        }
        
        .relationship-info {
          background-color: rgba(255, 165, 0, 0.1);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          border-left: 3px solid #FFA500;
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
      `}</style>
    </div>
  );
};

export default MiniVisualizer; 