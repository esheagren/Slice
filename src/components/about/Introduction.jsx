import React, { useState, useRef, useEffect } from 'react';

// Sample data for a simple vector visualization
const sampleVectors = {
  "king": [0.2, 0.8],
  "queen": [0.3, 0.9],
  "man": [-0.1, 0.7],
  "woman": [0.0, 0.8],
  "computer": [0.8, -0.3],
  "technology": [0.7, -0.2],
  "science": [0.6, -0.1],
  "art": [-0.7, -0.5]
};

const Introduction = () => {
  const [expandedSection, setExpandedSection] = useState(null);
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 200 });
  
  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  // Scale coordinates to fit canvas
  const scaleCoordinates = (coords, width, height) => {
    const padding = 30;
    const xScale = (width - padding * 2) / 2;
    const yScale = (height - padding * 2) / 2;
    
    return [
      (coords[0] * xScale) + (width / 2),
      (coords[1] * -yScale) + (height / 2)
    ];
  };
  
  // Draw a simple vector visualization
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvasSize;
    
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
    
    // Draw vectors
    Object.entries(sampleVectors).forEach(([word, vector]) => {
      const [x, y] = scaleCoordinates(vector, width, height);
      
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
      
      // Draw line from origin to point (vector representation)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 165, 0, 0.2)';
      ctx.lineWidth = 1;
      ctx.moveTo(width / 2, height / 2);
      ctx.lineTo(x, y);
      ctx.stroke();
    });
    
    // Draw origin label
    ctx.font = '10px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('origin', width / 2, height / 2 + 15);
    
  }, [canvasSize]);
  
  // Update canvas size on window resize
  useEffect(() => {
    const updateSize = () => {
      const width = Math.min(window.innerWidth - 40, 500);
      setCanvasSize({
        width,
        height: width * 0.6
      });
    };
    
    // Initial update
    updateSize();
    
    // Add resize listener
    window.addEventListener('resize', updateSize);
    
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  
  return (
    <div className="about-section">
      <div className="intro-header">
        <h2>Welcome to Luminode</h2>
        <div className="animated-tagline">
          <span className="highlight">Explore</span> the hidden connections between words
        </div>
      </div>
      
      <div className="intro-content">
        <p className="lead-paragraph">
          Luminode is an interactive visualization tool designed to help you explore the hidden semantic 
          connections between words. By visualizing word embeddings—mathematical representations of meaning—Luminode 
          reveals unexpected relationships and facilitates intuitive understanding of complex concepts.
        </p>
        
        <div className="vector-visualization">
          <h3>Word Embeddings as Vectors</h3>
          <p>
            In modern AI systems, words are represented as vectors—points in a high-dimensional space. 
            Words with similar meanings are positioned closer together in this space.
          </p>
          <div className="canvas-container">
            <canvas 
              ref={canvasRef}
              style={{ 
                width: `${canvasSize.width}px`,
                height: `${canvasSize.height}px`
              }}
            />
          </div>
          <div className="visualization-caption">
            A simplified 2D representation of word vectors. Notice how related words cluster together: 
            "king", "queen", "man", and "woman" form one group, while "computer", "technology", and "science" 
            form another.
          </div>
        </div>
        
        <div className="info-cards">
          <div 
            className={`info-card ${expandedSection === 'explore' ? 'expanded' : ''}`}
            onClick={() => toggleSection('explore')}
          >
            <div className="card-header">
              <h3>Explore Language</h3>
              <div className="expand-icon">{expandedSection === 'explore' ? '−' : '+'}</div>
            </div>
            <div className="card-content">
              <p>
                Whether you're a student, educator, researcher, or simply curious about language and meaning, 
                Luminode offers a window into how modern AI systems understand and process language.
              </p>
              {expandedSection === 'explore' && (
                <p>
                  Through interactive visualizations, you can discover how words relate to each other in ways that 
                  might surprise you, challenge your assumptions, or inspire new connections.
                </p>
              )}
            </div>
          </div>
          
          <div 
            className={`info-card ${expandedSection === 'understand' ? 'expanded' : ''}`}
            onClick={() => toggleSection('understand')}
          >
            <div className="card-header">
              <h3>Understand AI</h3>
              <div className="expand-icon">{expandedSection === 'understand' ? '−' : '+'}</div>
            </div>
            <div className="card-content">
              <p>
                Word embeddings are a core concept for understanding how large language models work. 
                Luminode makes these abstract mathematical concepts tangible and explorable.
              </p>
              {expandedSection === 'understand' && (
                <p>
                  By interacting with word embeddings directly, you'll gain insights into the 
                  fundamental building blocks that power modern AI language systems like ChatGPT, 
                  Claude, and other large language models.
                </p>
              )}
            </div>
          </div>
          
          <div 
            className={`info-card ${expandedSection === 'discover' ? 'expanded' : ''}`}
            onClick={() => toggleSection('discover')}
          >
            <div className="card-header">
              <h3>Discover Connections</h3>
              <div className="expand-icon">{expandedSection === 'discover' ? '−' : '+'}</div>
            </div>
            <div className="card-content">
              <p>
                Find unexpected relationships between concepts, explore the semantic space 
                between words, and visualize how language is organized in the "mind" of an AI.
              </p>
              {expandedSection === 'discover' && (
                <p>
                  Luminode's visualization tools let you see patterns and connections that would 
                  be impossible to detect by looking at raw data, offering new perspectives on 
                  language and meaning.
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="quote-container">
          <blockquote>
            "The limits of my language mean the limits of my world."
            <cite>— Ludwig Wittgenstein</cite>
          </blockquote>
          <p className="quote-context">
            Explore how AI systems expand and constrain their "world" through the mathematical 
            structure of word embeddings.
          </p>
        </div>
      </div>

      <style jsx>{`
        .about-section {
          margin-bottom: 2rem;
        }
        
        .intro-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        h2 {
          color: #FFA500;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          font-size: 2rem;
        }
        
        .animated-tagline {
          font-size: 1.4rem;
          margin-top: 0.5rem;
          position: relative;
          display: inline-block;
          padding: 0.5rem 1rem;
          background: linear-gradient(90deg, rgba(255,165,0,0.1) 0%, rgba(255,165,0,0.2) 50%, rgba(255,165,0,0.1) 100%);
          border-radius: 4px;
          animation: pulse 3s infinite;
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 165, 0, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(255, 165, 0, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 165, 0, 0); }
        }
        
        .highlight {
          color: #FFA500;
          font-weight: bold;
        }
        
        .intro-content {
          padding: 0 1rem;
        }
        
        .lead-paragraph {
          font-size: 1.2rem;
          line-height: 1.7;
          margin-bottom: 2rem;
          text-align: center;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .vector-visualization {
          margin: 2rem 0;
          text-align: center;
        }
        
        .vector-visualization h3 {
          color: #FFA500;
          margin-bottom: 1rem;
          font-size: 1.4rem;
        }
        
        .vector-visualization p {
          max-width: 700px;
          margin: 0 auto 1.5rem;
        }
        
        .canvas-container {
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          padding: 1rem;
          margin: 0 auto 1rem;
          display: inline-block;
        }
        
        canvas {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          display: block;
        }
        
        .visualization-caption {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          max-width: 700px;
          margin: 0 auto;
          font-style: italic;
        }
        
        .info-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
          margin-top: 2rem;
        }
        
        .info-card {
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .info-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          border-color: rgba(255, 165, 0, 0.3);
        }
        
        .info-card.expanded {
          background-color: rgba(255, 165, 0, 0.1);
          border-color: rgba(255, 165, 0, 0.5);
        }
        
        .card-header {
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .info-card.expanded .card-header {
          border-bottom-color: rgba(255, 165, 0, 0.3);
        }
        
        h3 {
          color: #FFA500;
          margin: 0;
          font-size: 1.3rem;
        }
        
        .expand-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(255, 165, 0, 0.2);
          border-radius: 50%;
          font-weight: bold;
          color: #FFA500;
          transition: all 0.3s ease;
        }
        
        .info-card.expanded .expand-icon {
          background-color: rgba(255, 165, 0, 0.4);
        }
        
        .card-content {
          padding: 1rem;
          transition: all 0.3s ease;
        }
        
        p {
          line-height: 1.6;
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }
        
        .quote-container {
          margin-top: 2rem;
          text-align: center;
          padding: 1.5rem;
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          position: relative;
        }
        
        blockquote {
          font-style: italic;
          font-size: 1.3rem;
          margin: 0 0 1rem 0;
          position: relative;
          padding: 0 2rem;
        }
        
        blockquote::before,
        blockquote::after {
          content: '"';
          font-size: 2rem;
          color: rgba(255, 165, 0, 0.5);
          position: absolute;
        }
        
        blockquote::before {
          left: 0;
          top: -0.5rem;
        }
        
        blockquote::after {
          right: 0;
          bottom: -1rem;
        }
        
        cite {
          display: block;
          margin-top: 0.5rem;
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.7);
        }
        
        .quote-context {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.9);
          max-width: 600px;
          margin: 1rem auto 0;
        }
      `}</style>
    </div>
  );
};

export default Introduction; 