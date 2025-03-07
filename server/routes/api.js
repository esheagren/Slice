import express from 'express';
import embeddingService from '../services/embeddingService.js';

const router = express.Router();

// Endpoint to check if words exist and get their vectors
router.post('/submit', async (req, res) => {
  console.log('Received request to /submit with body:', req.body);
  try {
    const { word1, word2 } = req.body;
    
    // Validate input
    if (!word1 || !word2) {
      return res.status(400).json({ error: 'Both words are required' });
    }
    
    // Make sure embeddings are loaded
    await embeddingService.loadEmbeddings();
    
    // Check if words exist in embeddings
    const word1Exists = embeddingService.wordExists(word1);
    const word2Exists = embeddingService.wordExists(word2);
    
    // Get vectors if words exist
    const vector1 = word1Exists ? embeddingService.getWordVector(word1) : null;
    const vector2 = word2Exists ? embeddingService.getWordVector(word2) : null;
    
    // Calculate midpoint if both vectors exist
    let midpoint = null;
    if (vector1 && vector2) {
      midpoint = embeddingService.calculateMidpoint(vector1, vector2);
    }
    
    // For display, truncate vectors to 5 elements
    const truncateVector = (vec) => {
      if (!vec) return null;
      const firstFive = vec.slice(0, 5);
      return `[${firstFive.join(', ')}...]`;
    };
    
    return res.status(200).json({
      success: true,
      data: {
        word1: {
          exists: word1Exists,
          vector: vector1 ? truncateVector(vector1) : null
        },
        word2: {
          exists: word2Exists,
          vector: vector2 ? truncateVector(vector2) : null
        },
        midpoint: midpoint ? truncateVector(midpoint) : null
      },
      message: generateResponseMessage(word1, word2, word1Exists, word2Exists)
    });
    
  } catch (error) {
    console.error('Error processing form submission:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Endpoint to find words near the midpoint of two words
router.post('/findMidpointWords', async (req, res) => {
  console.log('Received request to /findMidpointWords with body:', req.body);
  try {
    const { word1, word2, numNeighbors = 5 } = req.body;
    
    // Validate input
    if (!word1 || !word2) {
      return res.status(400).json({ error: 'Both words are required' });
    }
    
    // Make sure embeddings are loaded
    await embeddingService.loadEmbeddings();
    
    // Check if words exist in embeddings
    const word1Exists = embeddingService.wordExists(word1);
    const word2Exists = embeddingService.wordExists(word2);
    
    if (!word1Exists || !word2Exists) {
      return res.status(404).json({ 
        error: 'One or both words not found in embeddings',
        word1Exists,
        word2Exists
      });
    }
    
    // Get vectors
    const vector1 = embeddingService.getWordVector(word1);
    const vector2 = embeddingService.getWordVector(word2);
    
    // Calculate midpoint
    const midpoint = embeddingService.calculateMidpoint(vector1, vector2);
    
    // Find nearest neighbors to midpoint
    const nearestWords = embeddingService.findNearestNeighbors(midpoint, numNeighbors);
    
    return res.status(200).json({
      success: true,
      data: {
        word1,
        word2,
        midpoint: midpoint.slice(0, 5).join(', ') + '...',
        nearestWords
      }
    });
    
  } catch (error) {
    console.error('Error finding midpoint words:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to generate appropriate response message
function generateResponseMessage(word1, word2, word1Exists, word2Exists) {
  if (!word1Exists && !word2Exists) {
    return `Neither "${word1}" nor "${word2}" was found in the embeddings.`;
  } else if (!word1Exists) {
    return `"${word1}" was not found in the embeddings.`;
  } else if (!word2Exists) {
    return `"${word2}" was not found in the embeddings.`;
  } else {
    return `Both words found! Vectors retrieved successfully.`;
  }
}

export default router; 