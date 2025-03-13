import React, { useState, useEffect, useRef } from 'react';

// Sample data for visualizations
const sampleWordVectors = {
  // Common words with their 2D projections
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
  "vegetable": [-0.6, -0.4],
  "ocean": [-0.2, 0.4],
  "mountain": [0.1, 0.5],
  "river": [-0.3, 0.3],
  "forest": [0.0, 0.4]
};

// Sample nearest neighbors
const nearestNeighbors = {
  "ocean": ["sea", "river", "lake", "water", "coastal"],
  "mountain": ["hill", "peak", "valley", "terrain", "summit"],
  "computer": ["laptop", "desktop", "device", "machine", "system"]
};

const CoreFunctionalities = () => {
  // Refs for canvas elements
  const spatialCanvasRef = useRef(null);
  const nearestCanvasRef = useRef(null);
  const midpointCanvasRef = useRef(null);
  const distanceCanvasRef = useRef(null);
  
  // State for canvas sizes
  const [canvasSizes, setCanvasSizes] = useState({
    spatial: { width: 300, height: 200 },
    nearest: { width: 300, height: 200 },
    midpoint: { width: 300, height: 200 },
    distance: { width: 300, height: 200 }
  });
  
  // State for selected words in each visualization
  const [selectedWord, setSelectedWord] = useState("ocean");
  const [midpointWords] = useState(["science", "art"]);
  const [distanceWords] = useState(["king", "queen"]);
  
  // Scale coordinates to fit canvas
  const scaleCoordinates = (coords, canvasWidth, canvasHeight) => {
    const padding = 30;
    const xScale = (canvasWidth - padding * 2) / 2;
    const yScale = (canvasHeight - padding * 2) / 2;
    
    return [
      (coords[0] * xScale) + (canvasWidth / 2),
      (coords[1] * -yScale) + (canvasHeight / 2)
    ];
  };
  
  // Draw the spatial visualization
  useEffect(() => {
    if (!spatialCanvasRef.current) return;
    
    const canvas = spatialCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvasSizes.spatial;
    
    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    
    // Horizontal axis
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    // Vertical axis
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    
    // Draw a subset of words
    const wordsToShow = ["king", "queen", "man", "woman", "computer", "science", "art", "music"];
    
    wordsToShow.forEach(word => {
      if (sampleWordVectors[word]) {
        const [x, y] = scaleCoordinates(sampleWordVectors[word], width, height);
        
        // Draw dot
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw label
        ctx.font = '10px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.textAlign = 'center';
        ctx.fillText(word, x, y - 8);
      }
    });
  }, [canvasSizes.spatial]);
  
  // Draw the nearest neighbor visualization
  useEffect(() => {
    if (!nearestCanvasRef.current || !selectedWord) return;
    
    const canvas = nearestCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvasSizes.nearest;
    
    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    
    // Horizontal axis
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    // Vertical axis
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    
    // Draw selected word
    if (sampleWordVectors[selectedWord]) {
      const [x, y] = scaleCoordinates(sampleWordVectors[selectedWord], width, height);
      
      // Draw dot for selected word
      ctx.beginPath();
      ctx.fillStyle = '#FFA500';
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw label
      ctx.font = 'bold 12px Arial';
      ctx.fillStyle = '#FFA500';
      ctx.textAlign = 'center';
      ctx.fillText(selectedWord, x, y - 10);
      
      // Draw nearest neighbors
      if (nearestNeighbors[selectedWord]) {
        // Create some fake positions for neighbors
        nearestNeighbors[selectedWord].forEach((word, index) => {
          // Create a position radiating from the selected word
          const angle = (index / nearestNeighbors[selectedWord].length) * Math.PI * 2;
          const distance = 40 + (index * 5); // Increasing distance for each neighbor
          
          const nx = x + Math.cos(angle) * distance;
          const ny = y + Math.sin(angle) * distance;
          
          // Draw connecting line
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255, 165, 0, 0.3)';
          ctx.lineWidth = 1;
          ctx.moveTo(x, y);
          ctx.lineTo(nx, ny);
          ctx.stroke();
          
          // Draw neighbor dot
          ctx.beginPath();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.arc(nx, ny, 3, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw label
          ctx.font = '10px Arial';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.textAlign = 'center';
          ctx.fillText(word, nx, ny - 8);
        });
      }
    }
  }, [selectedWord, canvasSizes.nearest]);
  
  // Draw the midpoint visualization
  useEffect(() => {
    if (!midpointCanvasRef.current || midpointWords.length !== 2) return;
    
    const canvas = midpointCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvasSizes.midpoint;
    
    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    
    // Horizontal axis
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    // Vertical axis
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    
    // Draw the two selected words
    const [word1, word2] = midpointWords;
    
    if (sampleWordVectors[word1] && sampleWordVectors[word2]) {
      const [x1, y1] = scaleCoordinates(sampleWordVectors[word1], width, height);
      const [x2, y2] = scaleCoordinates(sampleWordVectors[word2], width, height);
      
      // Draw dots for selected words
      ctx.beginPath();
      ctx.fillStyle = '#FFA500';
      ctx.arc(x1, y1, 5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.fillStyle = '#FFA500';
      ctx.arc(x2, y2, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw labels
      ctx.font = 'bold 12px Arial';
      ctx.fillStyle = '#FFA500';
      ctx.textAlign = 'center';
      ctx.fillText(word1, x1, y1 - 10);
      ctx.fillText(word2, x2, y2 - 10);
      
      // Draw line between words
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 165, 0, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Calculate and draw midpoint
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255, 165, 0, 0.8)';
      ctx.arc(midX, midY, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw midpoint label
      ctx.font = 'italic 12px Arial';
      ctx.fillStyle = '#FFA500';
      ctx.textAlign = 'center';
      ctx.fillText('midpoint', midX, midY - 10);
      
      // Draw some "discovered" words near the midpoint
      const discoveredWords = word1 === "science" && word2 === "art" 
        ? ["design", "creative", "innovation"] 
        : ["blend", "hybrid", "fusion"];
      
      discoveredWords.forEach((word, index) => {
        const angle = ((index + 1) / (discoveredWords.length + 1)) * Math.PI;
        const distance = 25;
        
        const dx = midX + Math.cos(angle) * distance;
        const dy = midY + Math.sin(angle) * distance;
        
        // Draw dot
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.arc(dx, dy, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw label
        ctx.font = '10px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.textAlign = 'center';
        ctx.fillText(word, dx, dy - 8);
      });
    }
  }, [midpointWords, canvasSizes.midpoint]);
  
  // Draw the semantic distance visualization
  useEffect(() => {
    if (!distanceCanvasRef.current || distanceWords.length !== 2) return;
    
    const canvas = distanceCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvasSizes.distance;
    
    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    
    // Horizontal axis
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    // Vertical axis
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    
    // Draw the two selected words
    const [word1, word2] = distanceWords;
    
    if (sampleWordVectors[word1] && sampleWordVectors[word2]) {
      const [x1, y1] = scaleCoordinates(sampleWordVectors[word1], width, height);
      const [x2, y2] = scaleCoordinates(sampleWordVectors[word2], width, height);
      
      // Draw dots for selected words
      ctx.beginPath();
      ctx.fillStyle = '#FFA500';
      ctx.arc(x1, y1, 5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.fillStyle = '#FFA500';
      ctx.arc(x2, y2, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw labels
      ctx.font = 'bold 12px Arial';
      ctx.fillStyle = '#FFA500';
      ctx.textAlign = 'center';
      ctx.fillText(word1, x1, y1 - 10);
      ctx.fillText(word2, x2, y2 - 10);
      
      // Draw line between words
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 165, 0, 0.6)';
      ctx.lineWidth = 2;
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      
      // Calculate distance (simplified for visualization)
      const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      const similarity = Math.max(0, Math.min(1, 1 - (distance / 200))).toFixed(2);
      
      // Draw distance label
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      
      // Draw background for text
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(midX - 50, midY - 8, 100, 20);
      
      ctx.font = 'bold 12px Arial';
      ctx.fillStyle = '#FFA500';
      ctx.textAlign = 'center';
      ctx.fillText(`Similarity: ${similarity}`, midX, midY + 5);
    }
  }, [distanceWords, canvasSizes.distance]);
  
  // Update canvas sizes on window resize
  useEffect(() => {
    const updateSizes = () => {
      const baseWidth = Math.min(window.innerWidth / 2 - 40, 300);
      setCanvasSizes({
        spatial: { width: baseWidth, height: baseWidth * 0.7 },
        nearest: { width: baseWidth, height: baseWidth * 0.7 },
        midpoint: { width: baseWidth, height: baseWidth * 0.7 },
        distance: { width: baseWidth, height: baseWidth * 0.7 }
      });
    };
    
    // Initial update
    updateSizes();
    
    // Add resize listener
    window.addEventListener('resize', updateSizes);
    
    return () => window.removeEventListener('resize', updateSizes);
  }, []);
  
  return (
    <div className="about-section">
      <h2>Core Functionalities</h2>
      <p>
        Luminode offers several powerful tools to help you explore word embeddings and 
        discover semantic relationships:
      </p>

      <div className="functionality-section">
        <h3>Spatial Visualization (2D & 3D)</h3>
        <div className="content-with-visual">
          <div className="text-content">
            <p>
              Luminode renders word relationships spatially in both 2D and 3D using Principal Component 
              Analysis (PCA). This technique reduces the high-dimensional embedding space (typically 
              300 dimensions) down to 2 or 3 dimensions that you can visualize.
            </p>
            <p>
              This allows you to see at a glance how words cluster together based on meaning, revealing 
              patterns that would be impossible to detect by looking at the raw numbers.
            </p>
          </div>
          <div className="visual-demo">
            <div className="canvas-container">
              <canvas 
                ref={spatialCanvasRef}
                style={{ 
                  width: `${canvasSizes.spatial.width}px`,
                  height: `${canvasSizes.spatial.height}px`
                }}
              />
            </div>
            <div className="visual-caption">
              Words with similar meanings cluster together in the embedding space
            </div>
          </div>
        </div>
      </div>

      <div className="functionality-section">
        <h3>Nearest Neighbor Search</h3>
        <div className="content-with-visual">
          <div className="text-content">
            <p>
              Discover words that are semantically similar to your query using two approaches:
            </p>
            <ul>
              <li>
                <strong>Approximate Nearest Neighbors (ANN):</strong> A fast search method that quickly 
                finds similar words, ideal for exploration and discovery.
              </li>
              <li>
                <strong>Exact Search:</strong> A more precise but computationally intensive method that 
                finds the mathematically closest words in the embedding space.
              </li>
            </ul>
          </div>
          <div className="visual-demo">
            <div className="select-container">
              <select 
                value={selectedWord} 
                onChange={(e) => setSelectedWord(e.target.value)}
                className="word-select"
              >
                <option value="ocean">ocean</option>
                <option value="mountain">mountain</option>
                <option value="computer">computer</option>
              </select>
            </div>
            <div className="canvas-container">
              <canvas 
                ref={nearestCanvasRef}
                style={{ 
                  width: `${canvasSizes.nearest.width}px`,
                  height: `${canvasSizes.nearest.height}px`
                }}
              />
            </div>
            <div className="visual-caption">
              Finding words similar to "{selectedWord}" in the embedding space
            </div>
          </div>
        </div>
      </div>

      <div className="functionality-section">
        <h3>Recursive Midpoint Search</h3>
        <div className="content-with-visual">
          <div className="text-content">
            <p>
              This unique feature allows you to explore the "semantic midpoint" between two or more words. 
              By taking cross-sections of the embedding space, you can discover concepts that bridge 
              different ideas or represent a blend of multiple concepts.
            </p>
            <p>
              For example, the midpoint between "science" and "art" might reveal words related to 
              design, creativity, and innovation.
            </p>
          </div>
          <div className="visual-demo">
            <div className="canvas-container">
              <canvas 
                ref={midpointCanvasRef}
                style={{ 
                  width: `${canvasSizes.midpoint.width}px`,
                  height: `${canvasSizes.midpoint.height}px`
                }}
              />
            </div>
            <div className="visual-caption">
              The midpoint between "science" and "art" reveals bridging concepts
            </div>
          </div>
        </div>
      </div>

      <div className="functionality-section">
        <h3>Semantic Distance Measurement</h3>
        <div className="content-with-visual">
          <div className="text-content">
            <p>
              Luminode includes a "ruler" tool that measures the semantic distance between words using 
              cosine similarity. This mathematical measure reveals how closely related two words are in 
              the embedding space.
            </p>
            <p>
              Words with a cosine similarity close to 1 are very similar in meaning, while those closer 
              to 0 have little semantic relationship.
            </p>
          </div>
          <div className="visual-demo">
            <div className="canvas-container">
              <canvas 
                ref={distanceCanvasRef}
                style={{ 
                  width: `${canvasSizes.distance.width}px`,
                  height: `${canvasSizes.distance.height}px`
                }}
              />
            </div>
            <div className="visual-caption">
              Measuring semantic similarity between "king" and "queen"
            </div>
          </div>
        </div>
      </div>

      <div className="functionality-section">
        <h3>Word Analogies</h3>
        <p>
          Explore analogical relationships between words, such as "king is to queen as man is to woman." 
          This functionality demonstrates how word embeddings capture complex linguistic relationships 
          and can be used to solve analogy problems.
        </p>
        <p>
          By manipulating vectors (adding and subtracting word embeddings), Luminode can find words 
          that complete analogies, offering insights into how language models represent relationships.
        </p>
        <div className="analogy-example">
          <div className="analogy-formula">
            <span className="analogy-word">king</span> - <span className="analogy-word">man</span> + <span className="analogy-word">woman</span> ≈ <span className="analogy-result">queen</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .about-section {
          margin-bottom: 2rem;
        }
        
        h2 {
          color: #FFA500;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          font-size: 1.8rem;
        }
        
        h3 {
          color: #FFA500;
          margin-top: 1.2rem;
          margin-bottom: 0.8rem;
          font-size: 1.4rem;
        }
        
        p {
          line-height: 1.6;
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }
        
        ul {
          margin-left: 1.5rem;
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        
        li {
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
        }
        
        strong {
          color: #FFA500;
        }
        
        .functionality-section {
          margin-bottom: 2.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .functionality-section:last-child {
          border-bottom: none;
        }
        
        .content-with-visual {
          display: flex;
          flex-direction: row;
          gap: 2rem;
          margin-top: 1rem;
          align-items: center;
        }
        
        .text-content {
          flex: 1;
        }
        
        .visual-demo {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .canvas-container {
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 0.5rem;
        }
        
        canvas {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          display: block;
        }
        
        .visual-caption {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          text-align: center;
          font-style: italic;
        }
        
        .select-container {
          margin-bottom: 1rem;
        }
        
        .word-select {
          padding: 0.5rem;
          background-color: rgba(0, 0, 0, 0.3);
          color: white;
          border: 1px solid rgba(255, 165, 0, 0.5);
          border-radius: 4px;
          font-size: 0.9rem;
          cursor: pointer;
        }
        
        .analogy-example {
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          padding: 1.5rem;
          margin-top: 1rem;
          text-align: center;
        }
        
        .analogy-formula {
          font-family: monospace;
          font-size: 1.2rem;
          color: white;
        }
        
        .analogy-word {
          color: #FFA500;
          font-weight: bold;
          padding: 0.3rem 0.6rem;
          background-color: rgba(255, 165, 0, 0.1);
          border-radius: 4px;
          margin: 0 0.3rem;
        }
        
        .analogy-result {
          color: #FFA500;
          font-weight: bold;
          padding: 0.3rem 0.6rem;
          background-color: rgba(255, 165, 0, 0.3);
          border-radius: 4px;
          margin: 0 0.3rem;
        }
        
        @media (max-width: 768px) {
          .content-with-visual {
            flex-direction: column;
            gap: 1rem;
          }
          
          .text-content, .visual-demo {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default CoreFunctionalities; 