import React, { useRef, useEffect, useState } from 'react';
import LoadingAnimation from '../visualization/LoadingAnimation';
import Introduction from './Introduction';
import CoreFunctionalities from './CoreFunctionalities';
import EmbeddingExplanation from './EmbeddingExplanation';
import Disclaimer from './Disclaimer';
import MiniVisualizer from './MiniVisualizer';
import InteractiveExamples from './InteractiveExamples';

const AboutPage = () => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Set initial dimensions
    updateDimensions();
    
    // Add resize listener
    window.addEventListener('resize', updateDimensions);
    
    // Mark as loaded after a short delay to ensure components have time to initialize
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      clearTimeout(timer);
    };
  }, []);
  
  const updateDimensions = () => {
    if (!containerRef.current) return;
    
    setDimensions({
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight
    });
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <>
            <Introduction />
            {isLoaded && <MiniVisualizer />}
          </>
        );
      case 'embeddings':
        return <EmbeddingExplanation />;
      case 'features':
        return <CoreFunctionalities />;
      case 'examples':
        return isLoaded ? <InteractiveExamples /> : <div className="loading-placeholder">Loading examples...</div>;
      case 'limitations':
        return <Disclaimer />;
      default:
        return <Introduction />;
    }
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
        
        <div className="about-container">
          <div className="tabs">
            <button 
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab-button ${activeTab === 'embeddings' ? 'active' : ''}`}
              onClick={() => setActiveTab('embeddings')}
            >
              Word Embeddings
            </button>
            <button 
              className={`tab-button ${activeTab === 'features' ? 'active' : ''}`}
              onClick={() => setActiveTab('features')}
            >
              Features
            </button>
            <button 
              className={`tab-button ${activeTab === 'examples' ? 'active' : ''}`}
              onClick={() => setActiveTab('examples')}
            >
              Try It
            </button>
            <button 
              className={`tab-button ${activeTab === 'limitations' ? 'active' : ''}`}
              onClick={() => setActiveTab('limitations')}
            >
              Limitations
            </button>
          </div>
          
          <div className="tab-content">
            {renderTabContent()}
          </div>
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
        
        .about-container {
          background-color: rgba(26, 26, 46, 0.8);
          border-radius: 12px;
          padding: 2rem;
          max-width: 900px;
          width: 100%;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .tabs {
          display: flex;
          border-bottom: 1px solid rgba(255, 165, 0, 0.3);
          margin-bottom: 2rem;
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 165, 0, 0.5) transparent;
        }
        
        .tab-button {
          background: transparent;
          border: none;
          color: white;
          padding: 0.75rem 1.25rem;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          white-space: nowrap;
        }
        
        .tab-button:hover {
          color: #FFA500;
        }
        
        .tab-button.active {
          color: #FFA500;
          font-weight: bold;
        }
        
        .tab-button.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 3px;
          background-color: #FFA500;
          border-radius: 3px 3px 0 0;
        }
        
        .tab-content {
          min-height: 400px;
        }
        
        .loading-placeholder {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
          font-style: italic;
          color: rgba(255, 255, 255, 0.7);
        }
        
        @media (max-width: 768px) {
          .tabs {
            flex-wrap: wrap;
          }
          
          .tab-button {
            flex: 1 1 auto;
            text-align: center;
            padding: 0.5rem;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AboutPage; 