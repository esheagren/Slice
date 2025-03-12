import * as THREE from 'three';

// Utility functions for vector visualizations

// Get color for a point based on whether it's primary or not
export const getPointColor = (word, words, isPrimary) => {
  if (isPrimary) {
    // Use a specific color for each primary word
    const colors = [
      '#4285F4', // Google blue
      '#EA4335', // Google red
      '#FBBC05', // Google yellow
      '#34A853', // Google green
      '#9C27B0', // Purple
      '#FF9800', // Orange
      '#00BCD4'  // Cyan
    ];
    const wordIndex = words.indexOf(word);
    return colors[wordIndex % colors.length];
  } else {
    // Use a neutral color for related words
    return 'rgba(150, 150, 150, 0.7)';
  }
};

// Convert hex color to THREE.Color
export const hexToThreeColor = (hex) => {
  return new THREE.Color(hex.replace('#', '0x'));
};

// Create a text sprite for labels in 3D
export const createTextSprite = (text, isPrimary = false) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 256;
  canvas.height = 64;
  
  // Background with different opacity based on word type
  const bgOpacity = isPrimary ? 0.7 : 0.5;
  context.fillStyle = `rgba(15, 23, 42, ${bgOpacity})`;
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // Text with different style based on word type
  context.font = isPrimary ? 'bold 32px Arial' : '28px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = isPrimary ? '#ffffff' : 'rgba(255, 255, 255, 0.8)';
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  
  // Create texture and sprite
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ 
    map: texture,
    transparent: true
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(isPrimary ? 2 : 1.5, isPrimary ? 0.5 : 0.4, 1);
  
  return sprite;
}; 