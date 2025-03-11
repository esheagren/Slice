import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const VectorGraph = ({ words, midpointWords, numMidpoints, serverUrl = 'http://localhost:5001', viewMode = '2D' }) => {
  const [coordinates, setCoordinates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const threeSceneRef = useRef(null);
  const threeRendererRef = useRef(null);
  const threeControlsRef = useRef(null);
  const pointsRef = useRef([]);
  const threeDObjectsRef = useRef([]);
  
  // Add a second canvas reference for 3D
  const canvas2DRef = useRef(null);
  const canvas3DRef = useRef(null);
  
  // Fetch coordinates when words or viewMode changes
  useEffect(() => {
    if (!words || words.length === 0) return;
    
    const fetchCoordinates = async () => {
      setLoading(true);
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
          return {
            ...point,
            truncatedVector: vectorMap[point.word] || `Vector for ${point.word}`
          };
        });
        
        setCoordinates(coordinatesWithVectors);
      } catch (error) {
        console.error('Error fetching coordinates:', error);
        setError(error.response?.data?.error || 'Failed to get visualization data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCoordinates();
  }, [words, midpointWords, serverUrl, viewMode]);
  
  // Clean up 3D scene when component unmounts
  useEffect(() => {
    return () => {
      if (threeRendererRef.current) {
        threeRendererRef.current.dispose();
      }
      
      if (threeDObjectsRef.current.length > 0) {
        threeDObjectsRef.current.forEach(obj => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) obj.material.dispose();
        });
      }
    };
  }, []);
  
  // Set up canvas size based on container
  useEffect(() => {
    const resizeCanvas = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const width = container.clientWidth - 40; // 20px padding on each side
      const height = container.clientHeight - 40;
      
      // Resize 2D canvas if it exists
      if (canvas2DRef.current) {
        canvas2DRef.current.width = width;
        canvas2DRef.current.height = height;
        
        // Redraw 2D visualization if in 2D mode
        if (viewMode === '2D' && coordinates.length > 0) {
          drawVisualization();
        }
      }
      
      // Resize 3D canvas if it exists
      if (canvas3DRef.current) {
        canvas3DRef.current.width = width;
        canvas3DRef.current.height = height;
        
        // Update 3D renderer if it exists
        if (threeRendererRef.current && viewMode === '3D') {
          threeRendererRef.current.setSize(width, height);
          
          // Update camera aspect ratio
          if (threeSceneRef.current) {
            const camera = threeSceneRef.current.children.find(child => child.isCamera);
            if (camera) {
              camera.aspect = width / height;
              camera.updateProjectionMatrix();
            }
          }
        }
      }
    };
    
    // Initial resize
    resizeCanvas();
    
    // Add resize event listener
    window.addEventListener('resize', resizeCanvas);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [viewMode, coordinates]);
  
  // Initialize or update 3D scene when viewMode or coordinates change
  useEffect(() => {
    if (viewMode === '3D' && coordinates.length > 0) {
      setup3DScene();
    }
  }, [viewMode, coordinates]);
  
  // Set up 3D scene
  const setup3DScene = () => {
    if (!canvas3DRef.current || !containerRef.current) return;
    
    const canvas = canvas3DRef.current;
    const width = canvas.width;
    const height = canvas.height;
    
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Dark blue background
    threeSceneRef.current = scene;
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 15;
    scene.add(camera);
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height);
    threeRendererRef.current = renderer;
    
    // Add orbit controls for interactive rotation
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxDistance = 100;
    controls.addEventListener('change', renderThreeScene);
    threeControlsRef.current = controls;
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Add grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    scene.add(gridHelper);
    threeDObjectsRef.current.push(gridHelper);
    
    // Add axes helper
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    threeDObjectsRef.current.push(axesHelper);
    
    // Create points from coordinates
    create3DPoints();
    
    // Set up animation loop
    const animate = () => {
      if (viewMode === '3D') {
        requestAnimationFrame(animate);
        if (threeControlsRef.current) {
          threeControlsRef.current.update();
        }
        renderThreeScene();
      }
    };
    
    animate();
    
    // Add raycaster for point interaction
    setupRaycasting(canvas);
  };
  
  // Render the THREE.js scene
  const renderThreeScene = () => {
    if (threeRendererRef.current && threeSceneRef.current) {
      const camera = threeSceneRef.current.children.find(child => child.isCamera);
      if (camera) {
        threeRendererRef.current.render(threeSceneRef.current, camera);
      }
    }
  };
  
  // Create 3D points from coordinates
  const create3DPoints = () => {
    if (!threeSceneRef.current || !coordinates || coordinates.length === 0) return;
    
    // Clear existing points
    threeDObjectsRef.current.forEach(obj => {
      if (obj !== threeSceneRef.current.children[0] && // Don't remove camera
          obj !== threeSceneRef.current.children[1] && // Don't remove ambient light
          obj !== threeSceneRef.current.children[2] && // Don't remove directional light
          obj !== threeSceneRef.current.children[3] && // Don't remove grid helper
          obj !== threeSceneRef.current.children[4]) { // Don't remove axes helper
        threeSceneRef.current.remove(obj);
      }
    });
    
    threeDObjectsRef.current = threeDObjectsRef.current.slice(0, 5); // Keep only the first 5 objects
    
    // Arrays to store point data
    const pointsData = [];
    const pointsColors = [];
    const primaryPointsData = [];
    const primaryPointsColors = [];
    const pointInfos = [];
    
    // Process each coordinate
    coordinates.forEach(point => {
      // Determine if this is a primary word or a related word
      const isPrimaryWord = words.includes(point.word);
      
      // Get coordinates
      const x = point.x;
      const y = point.y;
      const z = point.hasOwnProperty('z') ? point.z : 0; // Use z if available, otherwise 0
      
      // Get color for the point
      let color;
      if (isPrimaryWord) {
        // Use a specific color for each primary word
        const colors = [
          new THREE.Color(0x4285F4), // Google blue
          new THREE.Color(0xEA4335), // Google red
          new THREE.Color(0xFBBC05), // Google yellow
          new THREE.Color(0x34A853), // Google green
          new THREE.Color(0x9C27B0), // Purple
          new THREE.Color(0xFF9800), // Orange
          new THREE.Color(0x00BCD4)  // Cyan
        ];
        const wordIndex = words.indexOf(point.word);
        color = colors[wordIndex % colors.length];
      } else {
        // Use a neutral color for related words
        color = new THREE.Color(0x999999);
      }
      
      // Store point info for raycasting
      pointInfos.push({
        position: new THREE.Vector3(x, y, z),
        word: point.word,
        color: color,
        isPrimary: isPrimaryWord,
        truncatedVector: point.truncatedVector,
        radius: isPrimaryWord ? 0.4 : 0.2
      });
      
      // Add to appropriate arrays
      if (isPrimaryWord) {
        primaryPointsData.push(x, y, z);
        primaryPointsColors.push(color.r, color.g, color.b);
        
        // Add text label for primary words
        const textSprite = createTextSprite(point.word);
        textSprite.position.set(x, y + 0.7, z);
        threeSceneRef.current.add(textSprite);
        threeDObjectsRef.current.push(textSprite);
      } else {
        pointsData.push(x, y, z);
        pointsColors.push(color.r, color.g, color.b);
      }
    });
    
    // Create geometry for regular points
    if (pointsData.length > 0) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(pointsData, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(pointsColors, 3));
      
      const material = new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
      });
      
      const points = new THREE.Points(geometry, material);
      threeSceneRef.current.add(points);
      threeDObjectsRef.current.push(points);
    }
    
    // Create geometry for primary points (larger)
    if (primaryPointsData.length > 0) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(primaryPointsData, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(primaryPointsColors, 3));
      
      const material = new THREE.PointsMaterial({
        size: 0.4,
        vertexColors: true
      });
      
      const points = new THREE.Points(geometry, material);
      threeSceneRef.current.add(points);
      threeDObjectsRef.current.push(points);
    }
    
    // Store point info for raycasting
    pointsRef.current = pointInfos;
  };
  
  // Create a text sprite for labels
  const createTextSprite = (text) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    
    // Background
    context.fillStyle = 'rgba(15, 23, 42, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Text
    context.font = 'bold 32px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#ffffff';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    // Create texture and sprite
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(2, 0.5, 1);
    
    return sprite;
  };
  
  // Set up raycasting for tooltips in 3D
  const setupRaycasting = (canvas) => {
    if (!threeSceneRef.current) return;
    
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    // Use the correct canvas based on view mode
    const targetCanvas = viewMode === '3D' ? canvas3DRef.current : canvas2DRef.current;
    if (!targetCanvas) return;
    
    targetCanvas.addEventListener('mousemove', (event) => {
      // Calculate mouse position in normalized device coordinates
      const rect = targetCanvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / targetCanvas.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / targetCanvas.height) * 2 + 1;
      
      // Update the raycaster
      raycaster.setFromCamera(mouse, threeSceneRef.current.children.find(child => child.isCamera));
      
      // Find intersections with points
      const intersects = raycaster.intersectObjects(threeDObjectsRef.current.filter(obj => obj.userData?.isDataPoint));
      
      if (intersects.length > 0) {
        targetCanvas.style.cursor = 'pointer';
        
        // Clear any previous tooltip
        const existingTooltip = document.getElementById('vector-tooltip');
        if (existingTooltip) {
          existingTooltip.remove();
        }
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.id = 'vector-tooltip';
        tooltip.style.position = 'absolute';
        tooltip.style.left = `${event.clientX + 10}px`;
        tooltip.style.top = `${event.clientY + 10}px`;
        tooltip.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '8px 12px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '14px';
        tooltip.style.zIndex = '1000';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.maxWidth = '300px';
        tooltip.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        
        const point = intersects[0].object.userData;
        tooltip.innerHTML = `<strong>${point.word}</strong><br>${point.truncatedVector || 'Vector data unavailable'}`;
        
        document.body.appendChild(tooltip);
      } else {
        targetCanvas.style.cursor = 'default';
        
        // Remove tooltip if not hovering over any point
        const existingTooltip = document.getElementById('vector-tooltip');
        if (existingTooltip) {
          existingTooltip.remove();
        }
      }
    });
    
    targetCanvas.addEventListener('mouseleave', () => {
      // Remove tooltip when mouse leaves canvas
      const existingTooltip = document.getElementById('vector-tooltip');
      if (existingTooltip) {
        existingTooltip.remove();
      }
    });
  };
  
  // Draw 2D visualization
  const drawVisualization = () => {
    if (!coordinates.length || !canvas2DRef.current) return;
    
    const canvas = canvas2DRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
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
    
    // Add some padding to the graph area (20% of the range)
    const paddingX = (maxX - minX) * 0.2;
    const paddingY = (maxY - minY) * 0.2;
    
    minX -= paddingX;
    maxX += paddingX;
    minY -= paddingY;
    maxY += paddingY;
    
    // Scale factors for converting data coordinates to canvas coordinates
    const scaleX = width / (maxX - minX);
    const scaleY = height / (maxY - minY);
    
    // Function to convert data coordinates to canvas coordinates
    const toCanvasX = x => (x - minX) * scaleX;
    const toCanvasY = y => height - (y - minY) * scaleY; // Flip Y axis
    
    // Draw axes (optional)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Draw grid lines
    const gridCount = 5;
    ctx.beginPath();
    for (let i = 0; i <= gridCount; i++) {
      const x = (i / gridCount) * width;
      const y = (i / gridCount) * height;
      
      // Horizontal line
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      
      // Vertical line
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    ctx.stroke();
    
    // Prepare to draw points
    const points = [];
    
    // Draw points for each word
    coordinates.forEach(point => {
      const x = toCanvasX(point.x);
      const y = toCanvasY(point.y);
      
      // Determine if this is a primary word or a related word
      const isPrimaryWord = words.includes(point.word);
      
      // Set point size and color based on whether it's a primary or related word
      const radius = isPrimaryWord ? 8 : 5;
      
      // Get color for the point
      let color;
      if (isPrimaryWord) {
        // Use a specific color for each primary word
        const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#9C27B0', '#FF9800', '#00BCD4'];
        const wordIndex = words.indexOf(point.word);
        color = colors[wordIndex % colors.length];
      } else {
        // Use a neutral color for related words
        color = 'rgba(150, 150, 150, 0.7)';
      }
      
      // Store point data for hover detection
      points.push({
        x,
        y,
        radius,
        word: point.word,
        color,
        isPrimary: isPrimaryWord,
        truncatedVector: point.truncatedVector
      });
      
      // Draw point
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      
      // Add a subtle glow effect
      ctx.beginPath();
      ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
      ctx.fillStyle = `${color}33`; // Add transparency
      ctx.fill();
      
      // Draw label for primary words
      if (isPrimaryWord) {
        const label = point.word;
        
        // First draw a semi-transparent background for the text
        ctx.font = 'bold 14px Arial';
        const textMetrics = ctx.measureText(label);
        const textWidth = textMetrics.width;
        const textHeight = 14; // Approximate height for the font size
        
        // Only draw text background if there's text to display
        if (label) {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.7)'; // Semi-transparent dark background
          ctx.fillRect(x - textWidth/2 - 4, y - textHeight - 14, textWidth + 8, textHeight + 4);
          
          // Then draw the text
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(label, x, y - 12);
        }
      }
    });
    
    // Add mouse move listener for hover effect
    canvas.onmousemove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Check if mouse is over any point
      let hoveredPoint = null;
      
      for (const point of points) {
        const distance = Math.sqrt(
          Math.pow(mouseX - point.x, 2) + Math.pow(mouseY - point.y, 2)
        );
        
        if (distance <= point.radius) {
          hoveredPoint = point;
          break;
        }
      }
      
      if (hoveredPoint) {
        canvas.style.cursor = 'pointer';
        
        // Clear any previous tooltip
        const existingTooltip = document.getElementById('vector-tooltip');
        if (existingTooltip) {
          existingTooltip.remove();
        }
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.id = 'vector-tooltip';
        tooltip.style.position = 'absolute';
        tooltip.style.left = `${e.clientX + 10}px`;
        tooltip.style.top = `${e.clientY + 10}px`;
        tooltip.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '8px 12px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '14px';
        tooltip.style.zIndex = '1000';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.maxWidth = '300px';
        tooltip.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        
        tooltip.innerHTML = `<strong>${hoveredPoint.word}</strong><br>${hoveredPoint.truncatedVector}`;
        
        document.body.appendChild(tooltip);
      } else {
        canvas.style.cursor = 'default';
        
        // Remove tooltip if not hovering over any point
        const existingTooltip = document.getElementById('vector-tooltip');
        if (existingTooltip) {
          existingTooltip.remove();
        }
      }
    };
    
    // Add panning functionality for 2D view
    canvas.onmousedown = (e) => {
      setIsDragging(true);
      setLastMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    canvas.onmouseup = () => {
      setIsDragging(false);
    };
    
    canvas.onmouseleave = () => {
      setIsDragging(false);
      
      // Remove tooltip
      const existingTooltip = document.getElementById('vector-tooltip');
      if (existingTooltip) {
        existingTooltip.remove();
      }
    };
    
    // Handle panning in 2D view
    canvas.onmousemove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      if (isDragging) {
        const deltaX = e.clientX - lastMousePosition.x;
        const deltaY = e.clientY - lastMousePosition.y;
        
        // Update the min/max values to pan the view
        const panFactorX = (maxX - minX) / width * 2;
        const panFactorY = (maxY - minY) / height * 2;
        
        minX -= deltaX * panFactorX;
        maxX -= deltaX * panFactorX;
        minY += deltaY * panFactorY; // Inverted because canvas Y is flipped
        maxY += deltaY * panFactorY;
        
        // Redraw with new boundaries
        drawVisualization();
        
        // Update last position
        setLastMousePosition({ x: e.clientX, y: e.clientY });
        return;
      }
      
      // Check if mouse is over any point (for tooltips)
      let hoveredPoint = null;
      
      for (const point of points) {
        const distance = Math.sqrt(
          Math.pow(mouseX - point.x, 2) + Math.pow(mouseY - point.y, 2)
        );
        
        if (distance <= point.radius) {
          hoveredPoint = point;
          break;
        }
      }
      
      if (hoveredPoint) {
        canvas.style.cursor = 'pointer';
        
        // Clear any previous tooltip
        const existingTooltip = document.getElementById('vector-tooltip');
        if (existingTooltip) {
          existingTooltip.remove();
        }
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.id = 'vector-tooltip';
        tooltip.style.position = 'absolute';
        tooltip.style.left = `${e.clientX + 10}px`;
        tooltip.style.top = `${e.clientY + 10}px`;
        tooltip.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '8px 12px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '14px';
        tooltip.style.zIndex = '1000';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.maxWidth = '300px';
        tooltip.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        
        tooltip.innerHTML = `<strong>${hoveredPoint.word}</strong><br>${hoveredPoint.truncatedVector}`;
        
        document.body.appendChild(tooltip);
      } else {
        canvas.style.cursor = 'default';
        
        // Remove tooltip if not hovering over any point
        const existingTooltip = document.getElementById('vector-tooltip');
        if (existingTooltip) {
          existingTooltip.remove();
        }
      }
    };
  };
  
  // Handle view mode changes
  useEffect(() => {
    if (!containerRef.current) return;
    
    if (viewMode === '3D') {
      // Set up 3D scene if we have coordinates
      if (coordinates.length > 0) {
        setup3DScene();
      }
    } else {
      // Clean up 3D scene if switching to 2D
      if (threeRendererRef.current) {
        // Stop animation loop but don't dispose yet
        // The cleanup will happen when component unmounts
      }
      
      // Draw 2D visualization if we have coordinates
      if (coordinates.length > 0) {
        drawVisualization();
      }
    }
  }, [viewMode, coordinates]);
  
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
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading visualization...</p>
        </div>
      )}
      
      {error && (
        <div className="error-overlay">
          <p>{error}</p>
        </div>
      )}
      
      <canvas 
        ref={canvas2DRef} 
        className="vector-canvas"
        style={{ display: viewMode === '2D' ? 'block' : 'none' }}
      />
      
      <canvas 
        ref={canvas3DRef} 
        className="vector-canvas"
        style={{ display: viewMode === '3D' ? 'block' : 'none' }}
      />
      
      <div className="view-mode-indicator">
        {viewMode === '3D' ? '3D View' : '2D View'}
      </div>
      
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
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: rgba(15, 15, 16, 0.9);
          color: white;
          z-index: 10;
          backdrop-filter: blur(4px);
        }
        
        .loading-spinner {
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          border-top: 4px solid #FF9D42;
          border-right: 4px solid #FFC837;
          border-bottom: 4px solid #FF5757;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
          box-shadow: 0 0 20px rgba(255, 157, 66, 0.3);
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .error-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: rgba(239, 68, 68, 0.05);
          color: #FF5757;
          padding: 20px;
          text-align: center;
          z-index: 10;
          backdrop-filter: blur(4px);
        }
        
        .view-mode-indicator {
          position: absolute;
          top: 16px;
          right: 16px;
          background: linear-gradient(135deg, rgba(255, 157, 66, 0.9) 0%, rgba(255, 200, 55, 0.9) 100%);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          z-index: 5;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          letter-spacing: 0.5px;
        }
      `}</style>
    </div>
  );
};

export default VectorGraph;