import express from 'express';
import embeddingService from '../services/embeddingService.js';
import { performPCA } from '../utils/mathHelpers.js';

const router = express.Router();

// Endpoint to check if words exist and get their vectors
// router.post('/submit', async (req, res) => {
//   console.log('Received request to /submit with body:', req.body);
//   try {
//     const { word1, word2 } = req.body;
    
//     // Validate input
//     if (!word1 || !word2) {
//       return res.status(400).json({ error: 'Both words are required' });
//     }
    
//     // Make sure embeddings are loaded
//     await embeddingService.loadEmbeddings();
    
//     // Check if words exist in embeddings
//     const word1Exists = embeddingService.wordExists(word1);
//     const word2Exists = embeddingService.wordExists(word2);
    
//     // Get vectors if words exist
//     const vector1 = word1Exists ? embeddingService.getWordVector(word1) : null;
//     const vector2 = word2Exists ? embeddingService.getWordVector(word2) : null;
    
//     // Calculate midpoint if both vectors exist
//     let midpoint = null;
//     if (vector1 && vector2) {
//       midpoint = embeddingService.calculateMidpoint(vector1, vector2);
//     }
    
//     // For display, truncate vectors to 5 elements
//     const truncateVector = (vec) => {
//       if (!vec) return null;
//       const firstFive = vec.slice(0, 5);
//       return `[${firstFive.join(', ')}...]`;
//     };
    
//     return res.status(200).json({
//       success: true,
//       data: {
//         word1: {
//           exists: word1Exists,
//           vector: vector1 ? truncateVector(vector1) : null
//         },
//         word2: {
//           exists: word2Exists,
//           vector: vector2 ? truncateVector(vector2) : null
//         },
//         midpoint: midpoint ? truncateVector(midpoint) : null
//       },
//       message: generateResponseMessage(word1, word2, word1Exists, word2Exists)
//     });
    
//   } catch (error) {
//     console.error('Error processing form submission:', error);
//     return res.status(500).json({ error: 'Server error' });
//   }
// });

// Endpoint to get 2D coordinates for visualization
router.post('/getVectorCoordinates', async (req, res) => {
  try {
    const { words } = req.body;
    
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
    
    // Extract just the vectors for PCA
    const vectorsOnly = vectors.map(item => item.vector);
    
    // Perform PCA to get 2D coordinates
    const coordinates2D = performPCA(vectorsOnly);
    
    // Combine words with their 2D coordinates
    const result = vectors.map((item, index) => ({
      word: item.word,
      x: coordinates2D[index][0],
      y: coordinates2D[index][1],
      truncatedVector: `[${item.vector.slice(0, 5).join(', ')}...]`
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

// Endpoint to check if a word exists and get its vector
router.post('/checkWord', async (req, res) => {
  try {
    const { word } = req.body;
    
    if (!word) {
      return res.status(400).json({ error: 'Word is required' });
    }
    
    // Make sure embeddings are loaded
    await embeddingService.loadEmbeddings();
    
    // Check if word exists in embeddings
    const wordExists = embeddingService.wordExists(word);
    
    // Get vector if word exists
    const vector = wordExists ? embeddingService.getWordVector(word) : null;
    
    // For display, truncate vector to 5 elements
    const truncateVector = (vec) => {
      if (!vec) return null;
      const firstFive = vec.slice(0, 5);
      return `[${firstFive.join(', ')}...]`;
    };
    
    return res.status(200).json({
      success: true,
      data: {
        word: {
          exists: wordExists,
          vector: vector ? truncateVector(vector) : null
        }
      },
      message: wordExists ? 
        `Word "${word}" found! Vector retrieved successfully.` : 
        `Word "${word}" was not found in the embeddings.`
    });
    
  } catch (error) {
    console.error('Error checking word:', error);
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