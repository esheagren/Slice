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

// Endpoint to get vector coordinates for visualization
router.post('/getVectorCoordinates', async (req, res) => {
  try {
    const { words, dimensions = 2 } = req.body;
    
    if (!words || !Array.isArray(words) || words.length === 0) {
      return res.status(400).json({ error: 'Invalid words array' });
    }
    
    // Validate dimensions
    const projectionDimensions = dimensions === 3 ? 3 : 2;
    
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
    
    // Perform PCA to get coordinates
    const pcaResult = performPCA(vectorsOnly, projectionDimensions);
    const coordinates = pcaResult.coordinates;
    
    // Store the PCA components in the embeddingService for later use
    embeddingService.pcaComponents = pcaResult.components;
    embeddingService.embeddingDimension = vectorsOnly[0].length;
    
    // Combine words with their coordinates
    const result = vectors.map((item, index) => {
      const point = {
        word: item.word,
        truncatedVector: `[${item.vector.slice(0, 5).join(', ')}...]`,
        // Include full vector for similarity calculations
        fullVector: item.vector
      };
      
      // Add coordinates based on dimensions
      if (projectionDimensions === 2) {
        point.x = coordinates[index][0];
        point.y = coordinates[index][1];
      } else {
        point.x = coordinates[index][0];
        point.y = coordinates[index][1];
        point.z = coordinates[index][2];
      }
      
      return point;
    });
    
    res.json({
      message: `Vector coordinates calculated successfully in ${projectionDimensions}D`,
      data: result,
      dimensions: projectionDimensions,
      invalidWords: invalidWords.length > 0 ? invalidWords : undefined
    });
  } catch (error) {
    console.error('Error calculating vector coordinates:', error);
    res.status(500).json({ error: 'Failed to calculate vector coordinates' });
  }
});

// Endpoint to find nearest neighbors for a word
router.post('/findNeighbors', async (req, res) => {
  try {
    const { word, numResults = 5, useExactSearch = false } = req.body;
    
    // Validate input
    if (!word) {
      return res.status(400).json({ error: 'Word is required' });
    }
    
    // Make sure embeddings are loaded
    await embeddingService.loadEmbeddings();
    
    // Check if word exists in embeddings
    if (!embeddingService.wordExists(word)) {
      return res.status(404).json({ 
        error: `Word "${word}" not found in embeddings` 
      });
    }
    
    // Find nearest neighbors with specified search mode
    const neighbors = embeddingService.findWordNeighbors(word, numResults, useExactSearch);
    
    res.json({
      message: 'Nearest neighbors found successfully',
      data: {
        word,
        searchMode: useExactSearch ? 'exact' : 'approximate',
        nearestWords: neighbors
      }
    });
    
  } catch (error) {
    console.error('Error finding nearest neighbors:', error);
    res.status(500).json({ error: 'Failed to find nearest neighbors: ' + error.message });
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

// Endpoint to find midpoint between two words
router.post('/findMidpoint', async (req, res) => {
  try {
    const { word1, word2, numResults = 5, recursionDepth = 0, useExactSearch = true } = req.body;
    
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
      const message = generateResponseMessage(word1, word2, word1Exists, word2Exists);
      return res.status(404).json({ error: message });
    }
    
    // Find midpoint with specified search mode
    const nearestToMidpoint = embeddingService.findMidpoint(
      word1, word2, numResults, useExactSearch
    );
    
    // Handle recursive midpoint searches if needed
    const results = {
      primaryMidpoint: {
        word1,
        word2,
        nearestWords: nearestToMidpoint
      },
      searchMode: useExactSearch ? 'exact' : 'approximate',
      secondaryMidpoints: [],
      tertiaryMidpoints: []
    };
    
    // Include recursive midpoint searches if requested
    if (recursionDepth > 0) {
      // ... implement secondary and tertiary midpoints as in your existing code ...
    }
    
    res.json({
      message: 'Midpoint search completed successfully',
      data: results
    });
    
  } catch (error) {
    console.error('Error finding midpoint:', error);
    res.status(500).json({ error: 'Failed to find midpoint: ' + error.message });
  }
});

// Endpoint to find analogy completions
router.post('/findAnalogy', async (req, res) => {
  try {
    const { word1, word2, word3, numResults = 5, useExactSearch = true } = req.body;
    
    // Validate input
    if (!word1 || !word2 || !word3) {
      return res.status(400).json({ error: 'All three words are required' });
    }
    
    // Make sure embeddings are loaded
    await embeddingService.loadEmbeddings();
    
    // Check if words exist in embeddings
    const word1Exists = embeddingService.wordExists(word1);
    const word2Exists = embeddingService.wordExists(word2);
    const word3Exists = embeddingService.wordExists(word3);
    
    if (!word1Exists || !word2Exists || !word3Exists) {
      let missingWords = [];
      if (!word1Exists) missingWords.push(word1);
      if (!word2Exists) missingWords.push(word2);
      if (!word3Exists) missingWords.push(word3);
      
      return res.status(404).json({ 
        error: `Words not found in embeddings: ${missingWords.join(', ')}` 
      });
    }
    
    // Calculate analogy with specified search mode
    const analogyResults = embeddingService.findAnalogy(
      word1, word2, word3, numResults, useExactSearch
    );
    
    res.json({
      message: 'Analogy calculated successfully',
      data: {
        analogy: `${word1} is to ${word2} as ${word3} is to ?`,
        searchMode: useExactSearch ? 'exact' : 'approximate',
        results: analogyResults
      }
    });
    
  } catch (error) {
    console.error('Error calculating analogy:', error);
    res.status(500).json({ error: 'Failed to calculate analogy: ' + error.message });
  }
});

// Endpoint to find nearest words to a point in the vector space
router.post('/findNearestByCoordinates', async (req, res) => {
  try {
    const { coordinates, numResults = 3, dimensions = 2 } = req.body;
    
    // Validate input
    if (!coordinates) {
      return res.status(400).json({ error: 'Coordinates are required' });
    }
    
    // Make sure embeddings are loaded
    await embeddingService.loadEmbeddings();
    
    // Create a vector from the coordinates
    let vector;
    if (dimensions === 2) {
      // For 2D, we need to project the coordinates back to the original space
      // This is an approximation since we can't perfectly reverse PCA
      vector = embeddingService.approximateVectorFromCoordinates(coordinates.x, coordinates.y);
    } else if (dimensions === 3) {
      // For 3D, we need to project the coordinates back to the original space
      vector = embeddingService.approximateVectorFromCoordinates(coordinates.x, coordinates.y, coordinates.z);
    } else {
      return res.status(400).json({ error: 'Dimensions must be 2 or 3' });
    }
    
    // Find nearest neighbors to this vector
    const nearestWords = embeddingService.findVectorNeighbors(vector, numResults);
    
    res.json({
      message: 'Nearest words found successfully',
      data: {
        coordinates,
        dimensions,
        nearestWords
      }
    });
    
  } catch (error) {
    console.error('Error finding nearest words by coordinates:', error);
    res.status(500).json({ error: 'Failed to find nearest words: ' + error.message });
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