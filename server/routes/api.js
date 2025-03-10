import express from 'express';
import embeddingService from '../services/embeddingService.js';
import { performPCA } from '../utils/mathHelpers.js';

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

// Endpoint to find midpoint words between any two words
router.post('/findMidpointWords', async (req, res) => {
  try {
    const { word1, word2, numNeighbors = 10 } = req.body;
    
    if (!word1 || !word2) {
      return res.status(400).json({ error: 'Both words are required' });
    }
    
    // Get vectors for both words
    const vector1 = embeddingService.getWordVector(word1);
    const vector2 = embeddingService.getWordVector(word2);
    
    if (!vector1) {
      return res.status(404).json({ error: `Word "${word1}" not found in vocabulary` });
    }
    
    if (!vector2) {
      return res.status(404).json({ error: `Word "${word2}" not found in vocabulary` });
    }
    
    // Calculate midpoint vector
    const midpointVector = embeddingService.calculateMidpoint(vector1, vector2);
    
    // Find nearest neighbors to the midpoint
    const nearestWords = embeddingService.findNearestNeighbors(midpointVector, numNeighbors);
    
    // Calculate distances from each word to the original words
    const enhancedResults = nearestWords.map(item => {
      const wordVector = embeddingService.getWordVector(item.word);
      const distanceToWord1 = embeddingService.calculateEuclideanDistance(wordVector, vector1);
      const distanceToWord2 = embeddingService.calculateEuclideanDistance(wordVector, vector2);
      
      return {
        ...item,
        distanceToWord1,
        distanceToWord2
      };
    });
    
    res.json({
      message: 'Midpoint words found successfully',
      data: {
        word1,
        word2,
        nearestWords: enhancedResults
      }
    });
  } catch (error) {
    console.error('Error finding midpoint words:', error);
    res.status(500).json({ error: 'Failed to find midpoint words' });
  }
});

// Endpoint to get 2D coordinates for visualization
router.post('/getVectorCoordinates', async (req, res) => {
  try {
    const { words, calculateMidpoint } = req.body;
    
    if (!words || !Array.isArray(words) || words.length === 0) {
      return res.status(400).json({ error: 'Invalid words array' });
    }
    
    // Get vectors for all words
    const vectors = [];
    const invalidWords = [];
    
    for (const word of words) {
      const vector = embeddingService.getWordVector(word);
      if (vector) {
        vectors.push({ word, vector });
      } else {
        invalidWords.push(word);
      }
    }
    
    if (vectors.length === 0) {
      return res.status(404).json({ 
        error: 'None of the provided words were found in the vocabulary',
        invalidWords
      });
    }
    
    // Calculate midpoints between all pairs of words if requested
    if (calculateMidpoint && vectors.length >= 2) {
      // Create all possible pairs of words
      for (let i = 0; i < vectors.length - 1; i++) {
        for (let j = i + 1; j < vectors.length; j++) {
          const word1 = vectors[i];
          const word2 = vectors[j];
          
          // Skip if either word is already a midpoint
          if (word1.isExactMidpoint || word2.isExactMidpoint) continue;
          
          const midpointVector = embeddingService.calculateMidpoint(word1.vector, word2.vector);
          vectors.push({
            word: `midpoint_${word1.word}_${word2.word}`,
            vector: midpointVector,
            isExactMidpoint: true,
            parent1: word1.word,
            parent2: word2.word,
            // Add truncated vector for midpoint
            truncatedVector: `[${midpointVector.slice(0, 5).join(', ')}...]`
          });
        }
      }
    }
    
    // Extract just the vectors for PCA
    const vectorsOnly = vectors.map(item => item.vector);
    
    // Perform PCA to get 2D coordinates
    const coordinates2D = performPCA(vectorsOnly);
    
    // Combine words with their 2D coordinates
    const result = vectors.map((item, index) => ({
      word: item.word,
      x: coordinates2D[index][0],
      y: coordinates2D[index][1],
      isExactMidpoint: item.isExactMidpoint || false,
      parent1: item.parent1,
      parent2: item.parent2,
      truncatedVector: item.truncatedVector || `[${item.vector.slice(0, 5).join(', ')}...]`
    }));
    
    res.json({
      message: 'Vector coordinates calculated successfully',
      data: result,
      invalidWords: invalidWords.length > 0 ? invalidWords : undefined
    });
  } catch (error) {
    console.error('Error calculating vector coordinates:', error);
    res.status(500).json({ error: 'Failed to calculate vector coordinates' });
  }
});

// Endpoint to get nearest neighbors for a word
router.post('/findNearestNeighbors', async (req, res) => {
  try {
    const { word, numNeighbors = 5 } = req.body;
    
    if (!word) {
      return res.status(400).json({ error: 'Word is required' });
    }
    
    // Make sure embeddings are loaded
    await embeddingService.loadEmbeddings();
    
    // Check if word exists
    if (!embeddingService.wordExists(word)) {
      return res.status(404).json({ error: `Word "${word}" not found in vocabulary` });
    }
    
    // Get vector for the word
    const vector = embeddingService.getWordVector(word);
    
    // Find nearest neighbors
    const nearestWords = embeddingService.findNearestNeighbors(vector, numNeighbors);
    
    res.json({
      message: 'Nearest neighbors found successfully',
      data: {
        word,
        nearestWords
      }
    });
  } catch (error) {
    console.error('Error finding nearest neighbors:', error);
    res.status(500).json({ error: 'Failed to find nearest neighbors' });
  }
});

// Endpoint to get random words from the database
router.post('/getRandomWords', async (req, res) => {
  try {
    const { count = 20 } = req.body;
    
    // Make sure embeddings are loaded
    await embeddingService.loadEmbeddings();
    
    // Get all words from the vocabulary
    const allWords = Object.keys(embeddingService.wordVectors);
    
    // Shuffle and take the first 'count' words
    const shuffled = [...allWords].sort(() => 0.5 - Math.random());
    const randomWords = shuffled.slice(0, count);
    
    res.json({
      message: 'Random words retrieved successfully',
      data: {
        words: randomWords
      }
    });
  } catch (error) {
    console.error('Error getting random words:', error);
    res.status(500).json({ error: 'Failed to get random words' });
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