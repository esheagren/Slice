import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Set initial dimensions
    updateDimensions();
    
    // Add resize listener
    window.addEventListener('resize', updateDimensions);
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll);
    
    // Mark as loaded after a short delay to ensure components have time to initialize
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('scroll', handleScroll);
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

  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = scrollTop / docHeight;
    setScrollProgress(scrollPercent);
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Introduction />
            {isLoaded && <MiniVisualizer />}
          </motion.div>
        );
      case 'embeddings':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <EmbeddingExplanation />
          </motion.div>
        );
      case 'features':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <CoreFunctionalities />
          </motion.div>
        );
      case 'examples':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {isLoaded ? (
              <InteractiveExamples />
            ) : (
              <div className="loading-placeholder">
                <div className="loading-spinner"></div>
                <p>Loading examples...</p>
              </div>
            )}
          </motion.div>
        );
      case 'limitations':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Disclaimer />
          </motion.div>
        );
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
      
      <div className="scroll-progress-bar" style={{ width: `${scrollProgress * 100}%` }}></div>
      
      <div className="content">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="page-title"
        >
          <span className="title-accent">Luminode</span>
          <span className="title-subtitle">Explore Word Embeddings</span>
        </motion.h1>
        
        <motion.div 
          className="about-container"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <nav className="tabs-container">
            <div className="tabs">
              {['overview', 'embeddings', 'features', 'examples', 'limitations'].map((tab) => {
                const tabLabels = {
                  'overview': 'Overview',
                  'embeddings': 'Word Embeddings',
                  'features': 'Features',
                  'examples': 'Try It',
                  'limitations': 'Limitations'
                };
                
                return (
                  <button 
                    key={tab}
                    className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tabLabels[tab]}
                    {activeTab === tab && (
                      <motion.div 
                        className="tab-underline"
                        layoutId="underline"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
          
          <div className="tab-content">
            <AnimatePresence mode="wait">
              {renderTabContent()}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
      
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap');
        
        .about-page {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }
        
        .animation-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          opacity: 0.7;
        }
        
        .scroll-progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          height: 3px;
          background: linear-gradient(90deg, #FFA500, #FF4500);
          z-index: 1000;
          transition: width 0.1s;
        }
        
        .content {
          position: relative;
          z-index: 1;
          padding: 4rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: white;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .page-title {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 3rem;
        }
        
        .title-accent {
          font-family: 'Playfair Display', serif;
          font-size: 4rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #FFA500, #FF4500);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 2px 10px rgba(255, 165, 0, 0.2);
        }
        
        .title-subtitle {
          font-size: 1.2rem;
          font-weight: 300;
          letter-spacing: 3px;
          text-transform: uppercase;
          opacity: 0.8;
        }
        
        .about-container {
          background: rgba(15, 15, 35, 0.85);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 0;
          max-width: 1000px;
          width: 100%;
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.05),
            0 0 30px rgba(255, 165, 0, 0.1);
          overflow: hidden;
        }
        
        .tabs-container {
          position: sticky;
          top: 0;
          z-index: 10;
          background: rgba(10, 10, 25, 0.9);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .tabs {
          display: flex;
          justify-content: center;
          padding: 0 1rem;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .tabs::-webkit-scrollbar {
          display: none;
        }
        
        .tab-button {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          padding: 1.25rem 1.5rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          white-space: nowrap;
          letter-spacing: 0.5px;
          outline: none;
        }
        
        .tab-button:hover {
          color: rgba(255, 255, 255, 0.9);
        }
        
        .tab-button.active {
          color: #FFA500;
          font-weight: 600;
        }
        
        .tab-underline {
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #FFA500, #FF4500);
          border-radius: 3px 3px 0 0;
        }
        
        .tab-content {
          padding: 3rem;
          min-height: 500px;
        }
        
        .loading-placeholder {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 300px;
          gap: 1.5rem;
        }
        
        .loading-placeholder p {
          font-style: italic;
          color: rgba(255, 255, 255, 0.6);
          letter-spacing: 1px;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 165, 0, 0.1);
          border-top: 3px solid #FFA500;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .content {
            padding: 2rem 1rem;
          }
          
          .title-accent {
            font-size: 3rem;
          }
          
          .title-subtitle {
            font-size: 1rem;
          }
          
          .tabs {
            justify-content: flex-start;
          }
          
          .tab-button {
            padding: 1rem 0.75rem;
            font-size: 0.9rem;
          }
          
          .tab-content {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AboutPage; 