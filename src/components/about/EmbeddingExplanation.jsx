import React, { useState, useRef, useEffect } from 'react';

const EmbeddingExplanation = () => {
  const [activeTab, setActiveTab] = useState('concept');
  const [showFullVector, setShowFullVector] = useState(false);
  const canvasRef = useRef(null);
  
  // Draw the vector space visualization
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Vertical grid lines
    for (let x = 0; x <= width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let y = 0; y <= height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    
    // Draw word vectors
    const words = [
      { text: 'king', x: width * 0.7, y: height * 0.3, color: '#FFA500' },
      { text: 'queen', x: width * 0.8, y: height * 0.2, color: '#FFA500' },
      { text: 'man', x: width * 0.6, y: height * 0.4, color: '#FFA500' },
      { text: 'woman', x: width * 0.7, y: height * 0.3, color: '#FFA500' },
      { text: 'dog', x: width * 0.3, y: height * 0.7, color: '#4CAF50' },
      { text: 'cat', x: width * 0.2, y: height * 0.8, color: '#4CAF50' },
      { text: 'animal', x: width * 0.25, y: height * 0.75, color: '#4CAF50' },
      { text: 'computer', x: width * 0.8, y: height * 0.8, color: '#2196F3' },
      { text: 'laptop', x: width * 0.85, y: height * 0.75, color: '#2196F3' },
      { text: 'technology', x: width * 0.75, y: height * 0.85, color: '#2196F3' }
    ];
    
    // Draw vectors from origin
    words.forEach(word => {
      // Draw line from origin to word
      ctx.beginPath();
      ctx.strokeStyle = word.color;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.moveTo(width / 2, height / 2);
      ctx.lineTo(word.x, word.y);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw word dot
      ctx.beginPath();
      ctx.fillStyle = word.color;
      ctx.arc(word.x, word.y, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw word label
      ctx.font = '12px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText(word.text, word.x, word.y - 10);
    });
    
    // Draw clusters
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 165, 0, 0.2)';
    ctx.lineWidth = 2;
    ctx.ellipse(width * 0.7, height * 0.3, 60, 40, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 165, 0, 0.1)';
    ctx.fill();
    
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(76, 175, 80, 0.2)';
    ctx.lineWidth = 2;
    ctx.ellipse(width * 0.25, height * 0.75, 50, 40, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(76, 175, 80, 0.1)';
    ctx.fill();
    
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(33, 150, 243, 0.2)';
    ctx.lineWidth = 2;
    ctx.ellipse(width * 0.8, height * 0.8, 50, 40, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(33, 150, 243, 0.1)';
    ctx.fill();
    
    // Draw cluster labels
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = 'rgba(255, 165, 0, 0.8)';
    ctx.textAlign = 'center';
    ctx.fillText('Royalty/Gender', width * 0.7, height * 0.2 - 15);
    
    ctx.fillStyle = 'rgba(76, 175, 80, 0.8)';
    ctx.fillText('Animals', width * 0.25, height * 0.7 - 15);
    
    ctx.fillStyle = 'rgba(33, 150, 243, 0.8)';
    ctx.fillText('Technology', width * 0.8, height * 0.7 - 15);
    
  }, []);
  
  const renderConceptTab = () => {
    return (
      <div className="tab-content">
        <h3>What Are Word Embeddings?</h3>
        <p>
          Word embeddings are a fundamental concept for understanding how large language models work. 
          They are mathematical representations of words in a multi-dimensional space, where each word 
          is represented as a vector (a list of numbers).
        </p>
        <p>
          Unlike traditional dictionaries that define words using other words, embeddings capture meaning 
          based on how words are used in context. Words that appear in similar contexts will have similar 
          embeddings, positioned closer together in the vector space.
        </p>
        <p>
          For example, the words "king" and "queen" might be close to each other because they share 
          similar contexts, while both might be somewhat distant from "apple" or "bicycle."
        </p>
        
        <div className="vector-example">
          <h4>Example: Word as a Vector</h4>
          <div className="vector-box">
            <div className="word-label">king = [0.123, -0.456, 0.789, 0.012, -0.345, ... ]</div>
            <div className="vector-note">A typical word embedding has 300 dimensions</div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderVisualizationTab = () => {
    return (
      <div className="tab-content">
        <h3>Visualizing Embeddings</h3>
        <p>
          To make word embeddings understandable, Luminode projects them from their high-dimensional 
          space (typically 300 dimensions) down to 2D or 3D using techniques like Principal Component 
          Analysis (PCA).
        </p>
        <p>
          This allows you to see at a glance how words cluster together based on meaning, revealing 
          patterns that would be impossible to detect by looking at the raw numbers.
        </p>
        
        <div className="visual-example">
          <div className="visual-note">
            In a visualization, similar words appear closer together:
          </div>
          <div className="word-clusters">
            <div className="cluster">
              <div className="cluster-label">Animals</div>
              <div className="cluster-words">
                <span className="cluster-word">dog</span>
                <span className="cluster-word">cat</span>
                <span className="cluster-word">animal</span>
              </div>
            </div>
            <div className="cluster">
              <div className="cluster-label">Royalty</div>
              <div className="cluster-words">
                <span className="cluster-word">king</span>
                <span className="cluster-word">queen</span>
                <span className="cluster-word">royal</span>
              </div>
            </div>
            <div className="cluster">
              <div className="cluster-label">Technology</div>
              <div className="cluster-words">
                <span className="cluster-word">computer</span>
                <span className="cluster-word">software</span>
                <span className="cluster-word">digital</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderGloveTab = () => {
    return (
      <div className="tab-content">
        <h3>GloVe Embeddings</h3>
        <p>
          Luminode uses GloVe (Global Vectors for Word Representation) embeddings, which are created by 
          analyzing patterns in vast amounts of text. These embeddings capture rich semantic relationships 
          between words, including:
        </p>
        <ul>
          <li>Synonyms and related concepts</li>
          <li>Analogical relationships (e.g., "man is to woman as king is to queen")</li>
          <li>Hierarchical relationships</li>
          <li>Cultural associations</li>
        </ul>
        <p>
          By visualizing these embeddings, Luminode makes abstract mathematical concepts tangible and 
          explorable, offering insights into how machines "understand" language.
        </p>
        
        <div className="glove-info">
          <h4>How GloVe Works</h4>
          <p>
            GloVe embeddings are created by analyzing how often words appear together in a large corpus of text.
            Words that frequently appear in similar contexts will have similar vector representations.
          </p>
          <p>
            This allows the embeddings to capture semantic relationships without explicit human supervision.
          </p>
        </div>
      </div>
    );
  };
  
  return (
    <div className="about-section">
      <h2>Understanding Word Embeddings</h2>
      
      <div className="embedding-tabs">
        <button 
          className={`embedding-tab ${activeTab === 'concept' ? 'active' : ''}`}
          onClick={() => setActiveTab('concept')}
        >
          The Concept
        </button>
        <button 
          className={`embedding-tab ${activeTab === 'visualization' ? 'active' : ''}`}
          onClick={() => setActiveTab('visualization')}
        >
          Visualization
        </button>
        <button 
          className={`embedding-tab ${activeTab === 'glove' ? 'active' : ''}`}
          onClick={() => setActiveTab('glove')}
        >
          GloVe Embeddings
        </button>
      </div>
      
      <div className="embedding-content">
        {activeTab === 'concept' && renderConceptTab()}
        {activeTab === 'visualization' && renderVisualizationTab()}
        {activeTab === 'glove' && renderGloveTab()}
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
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1.4rem;
        }
        
        h4 {
          color: #FFA500;
          margin-top: 1.2rem;
          margin-bottom: 0.8rem;
          font-size: 1.2rem;
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
        
        .embedding-tabs {
          display: flex;
          border-bottom: 1px solid rgba(255, 165, 0, 0.3);
          margin-bottom: 1.5rem;
        }
        
        .embedding-tab {
          background: transparent;
          border: none;
          color: white;
          padding: 0.75rem 1.25rem;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .embedding-tab:hover {
          color: #FFA500;
        }
        
        .embedding-tab.active {
          color: #FFA500;
          font-weight: bold;
        }
        
        .embedding-tab.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 3px;
          background-color: #FFA500;
          border-radius: 3px 3px 0 0;
        }
        
        .embedding-content {
          padding: 1rem;
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
        }
        
        .vector-example {
          background-color: rgba(26, 26, 46, 0.8);
          border-radius: 8px;
          padding: 1rem;
          margin: 1.5rem 0;
          border: 1px solid rgba(255, 165, 0, 0.3);
        }
        
        .vector-box {
          background-color: rgba(0, 0, 0, 0.3);
          padding: 1rem;
          border-radius: 4px;
          font-family: monospace;
        }
        
        .word-label {
          font-size: 1.1rem;
          color: #FFA500;
        }
        
        .vector-note {
          margin-top: 0.5rem;
          font-style: italic;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
        }
        
        .visual-example {
          background-color: rgba(26, 26, 46, 0.8);
          border-radius: 8px;
          padding: 1rem;
          margin: 1.5rem 0;
          border: 1px solid rgba(255, 165, 0, 0.3);
        }
        
        .visual-note {
          margin-bottom: 1rem;
          font-style: italic;
        }
        
        .word-clusters {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: space-around;
        }
        
        .cluster {
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          padding: 1rem;
          min-width: 150px;
        }
        
        .cluster-label {
          text-align: center;
          font-weight: bold;
          margin-bottom: 0.5rem;
          color: #FFA500;
        }
        
        .cluster-words {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          align-items: center;
        }
        
        .cluster-word {
          background-color: rgba(255, 165, 0, 0.1);
          border: 1px solid rgba(255, 165, 0, 0.3);
          border-radius: 4px;
          padding: 0.2rem 0.5rem;
          font-size: 0.9rem;
        }
        
        .glove-info {
          background-color: rgba(255, 165, 0, 0.1);
          border-radius: 8px;
          padding: 1rem;
          margin: 1.5rem 0;
          border-left: 3px solid #FFA500;
        }
      `}</style>
    </div>
  );
};

export default EmbeddingExplanation; 