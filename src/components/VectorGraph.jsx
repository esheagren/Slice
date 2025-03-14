import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import ViewButton from './ViewButton';
import VectorGraph2D from './visualization/VectorGraph2D';
import VectorGraph3D from './visualization/VectorGraph3D';
import LoadingOverlay from './visualization/LoadingOverlay';
import ErrorOverlay from './visualization/ErrorOverlay';
import SimpleLoadingAnimation from './visualization/SimpleLoadingAnimation';

const VectorGraph = ({ 
  words, 
  midpointWords, 
  numMidpoints, 
  serverUrl = 'http://localhost:5001', 
  viewMode = '2D', 
  setViewMode,
  rulerActive, // Receive as prop instead of managing state
  loading // Add loading prop
}) => {
  const [coordinates, setCoordinates] = useState([]);
  const [error, setError] = useState(null);
  const [midpointClusters, setMidpointClusters] = useState([]);
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(false);
  
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Add loading animation after half a second delay
  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => {
        setShowLoadingAnimation(true);
      }, 500); // 500ms delay
    } else {
      setShowLoadingAnimation(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading]);
  
  // Fetch coordinates when words or viewMode changes
  useEffect(() => {
    if (!words || words.length === 0) return;
    
    const fetchCoordinates = async () => {
      setError(null);
      
      try {
        // Create array of all words to visualize
        const allWords = [...words];
        
        // Add related words if available
        const hasRelatedWords = midpointWords && midpointWords.length > 0;
        
        if (hasRelatedWords) {
          // Add all words from all clusters
          midpointWords.forEach(cluster => {
            if (cluster && cluster.words) {
              allWords.push(...cluster.words.map(item => item.word));
            }
          });
        }
        
        // Make sure we have unique words only
        const uniqueWords = [...new Set(allWords)];
        
        console.log(`Fetching ${viewMode} coordinates for words:`, uniqueWords);
        
        // Get the vector coordinates for visualization
        const response = await axios.post(`${serverUrl}/api/getVectorCoordinates`, { 
          words: uniqueWords,
          dimensions: viewMode === '3D' ? 3 : 2
        });
        
        // Now fetch the actual vector data for each word for the tooltips
        const vectorPromises = uniqueWords.map(async (word) => {
          try {
            const vectorResponse = await axios.post(`${serverUrl}/api/checkWord`, { word });
            return {
              word,
              vector: vectorResponse.data.data.word.vector
            };
          } catch (error) {
            console.error(`Error fetching vector for ${word}:`, error);
            return { word, vector: null };
          }
        });
        
        const vectorResults = await Promise.all(vectorPromises);
        const vectorMap = Object.fromEntries(
          vectorResults.map(item => [item.word, item.vector])
        );
        
        // Combine coordinate data with vector data
        const coordinatesWithVectors = response.data.data.map(point => {
          // Check if this point is part of an analogy result
          const analogyCluster = midpointWords.find(cluster => 
            cluster.type === 'analogy' && 
            cluster.words.some(w => w.word === point.word)
          );
          
          let isAnalogy = false;
          let analogySource = null;
          
          if (analogyCluster) {
            const analogyWord = analogyCluster.words.find(w => w.word === point.word);
            isAnalogy = !!analogyWord?.isAnalogy;
            analogySource = analogyWord?.analogySource || null;
          }
          
          return {
            ...point,
            truncatedVector: vectorMap[point.word] || `Vector for ${point.word}`,
            isAnalogy,
            analogySource
          };
        });
        
        setCoordinates(coordinatesWithVectors);
      } catch (error) {
        console.error('Error fetching coordinates:', error);
        setError(error.response?.data?.error || 'Failed to get visualization data');
      }
    };
    
    fetchCoordinates();
  }, [words, midpointWords, serverUrl, viewMode]);
  
  // Add transition animation when switching view modes
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Add transition effect
    canvasRef.current.style.transition = 'transform 0.5s ease-in-out, opacity 0.3s ease-in-out';
    
    // Apply animation
    if (viewMode === '3D') {
      // Animate to 3D
      canvasRef.current.style.opacity = '0';
      setTimeout(() => {
        canvasRef.current.style.transform = 'rotateY(180deg)';
        setTimeout(() => {
          canvasRef.current.style.opacity = '1';
          canvasRef.current.style.transform = 'rotateY(0deg)';
        }, 300);
      }, 300);
    } else {
      // Animate to 2D
      canvasRef.current.style.opacity = '0';
      setTimeout(() => {
        canvasRef.current.style.transform = 'rotateX(180deg)';
        setTimeout(() => {
          canvasRef.current.style.opacity = '1';
          canvasRef.current.style.transform = 'rotateX(0deg)';
        }, 300);
      }, 300);
    }
  }, [viewMode]);

  return (
    <div className="graph-container" ref={containerRef}>
      {error && <ErrorOverlay error={error} />}
      
      <div ref={canvasRef}>
        {viewMode === '2D' ? (
          <VectorGraph2D 
            coordinates={coordinates} 
            words={words} 
            containerRef={containerRef}
            rulerActive={rulerActive}
          />
        ) : (
          <VectorGraph3D 
            coordinates={coordinates} 
            words={words} 
            containerRef={containerRef}
            rulerActive={rulerActive}
          />
        )}
      </div>
      
      {/* Loading animation overlay */}
      {loading && showLoadingAnimation && (
        <div className="loading-overlay">
          <SimpleLoadingAnimation 
            width={containerRef.current?.clientWidth || 800} 
            height={containerRef.current?.clientHeight || 600} 
          />
        </div>
      )}
      
      <style jsx>{`
        .graph-container {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #0f0f10 0%, #1a1a1c 100%);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
        
        .vector-canvas {
          position: absolute;
          top: 20px;
          left: 20px;
          background-color: transparent;
          border-radius: 8px;
        }
        
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: rgba(26, 26, 46, 0.4);
          z-index: 100;
          border-radius: 12px;
          animation: fadeIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default VectorGraph;