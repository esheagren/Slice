import React, { useRef, useEffect, useState } from 'react';
import LoadingAnimation from './visualization/LoadingAnimation';

const AboutPage = () => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Set initial dimensions
    updateDimensions();
    
    // Add resize listener
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);
  
  const updateDimensions = () => {
    if (!containerRef.current) return;
    
    setDimensions({
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight
    });
  };

  return (
    <div className="about-page" ref={containerRef}>
      <div className="animation-background">
        <LoadingAnimation 
          width={dimensions.width} 
          height={dimensions.height} 
        />
      </div>
      
      <div className="content">
        <h1>About Luminode</h1>
        <div className="about-card">
          <h2>Explore Word Vectors in a New Dimension</h2>
          <p>
            Luminode is an interactive tool for visualizing word embeddings and exploring 
            semantic relationships between words. Using advanced vector space models, 
            Luminode helps you discover connections between concepts that might not be 
            immediately obvious.
          </p>
          
          <h2>How It Works</h2>
          <p>
            Each word in our database is represented as a high-dimensional vector that 
            captures its meaning based on how it's used in context. Words with similar 
            meanings appear closer together in this vector space.
          </p>
          <p>
            Our visualization tools project these complex vectors into 2D or 3D space, 
            allowing you to explore semantic relationships visually and intuitively.
          </p>
          
          <h2>Features</h2>
          <ul>
            <li>Interactive 2D and 3D visualizations of word vectors</li>
            <li>Find semantically related words</li>
            <li>Explore the midpoints between concepts</li>
            <li>Discover new connections between ideas</li>
          </ul>
        </div>
      </div>
      
      <style jsx>{`
        .about-page {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
        }
        
        .animation-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
        }
        
        .content {
          position: relative;
          z-index: 1;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: white;
        }
        
        h1 {
          font-size: 3rem;
          margin-bottom: 2rem;
          text-shadow: 0 0 10px rgba(255, 165, 0, 0.5);
        }
        
        .about-card {
          background-color: rgba(26, 26, 46, 0.8);
          border-radius: 12px;
          padding: 2rem;
          max-width: 800px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        h2 {
          color: #FFA500;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
        }
        
        p {
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        
        ul {
          margin-left: 1.5rem;
          line-height: 1.6;
        }
        
        li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default AboutPage; 