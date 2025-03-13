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
    const coordinates = performPCA(vectorsOnly, projectionDimensions);
    
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

// Endpoint to find analogy
router.post('/findAnalogy', async (req, res) => {
  try {
    const { word1, word2, word3, numResults = 5 } = req.body;
    
    // ... existing validation code ...
    
    // Use the new exact search method for more accurate analogies
    const results = embeddingService.findAnalogyExact(word1, word2, word3, numResults);
    
    res.json({
      message: 'Analogy calculated successfully',
      data: {
        analogy: `${word1} is to ${word2} as ${word3} is to ?`,
        results: results
      }
    });
    
  } catch (error) {
    console.error('Error calculating analogy:', error);
    res.status(500).json({ error: 'Failed to calculate analogy: ' + error.message });
  }
});

// Endpoint to find midpoint between two words and nearest word to that midpoint
router.post('/findMidpoint', async (req, res) => {
  try {
    const { word1, word2, recursionDepth = 0 } = req.body;
    
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
        error: 'One or both words not found in vocabulary',
        details: {
          word1: { exists: word1Exists },
          word2: { exists: word2Exists }
        }
      });
    }
    
    // Get vectors
    const vector1 = embeddingService.getWordVector(word1);
    const vector2 = embeddingService.getWordVector(word2);
    
    // Calculate midpoint
    const midpointVector = embeddingService.calculateMidpoint(vector1, vector2);
    
    // Find nearest word to midpoint
    const nearestWords = embeddingService.findNearestNeighbors(midpointVector, 5);
    
    // Process results
    const results = {
      primaryMidpoint: {
        endpoints: [word1, word2],
        theoreticalMidpoint: midpointVector.slice(0, 5), // First 5 elements for display
        nearestWords: nearestWords
      },
      secondaryMidpoints: [],
      tertiaryMidpoints: []
    };
    
    // If recursion is requested, calculate secondary midpoints
    if (recursionDepth > 0) {
      // Midpoint between word1 and primary midpoint
      const midpoint1Vector = embeddingService.calculateMidpoint(vector1, embeddingService.getWordVector(nearestWords[0].word));
      const nearest1 = embeddingService.findNearestNeighbors(midpoint1Vector, 5);
      
      // Midpoint between primary midpoint and word2
      const midpoint2Vector = embeddingService.calculateMidpoint(embeddingService.getWordVector(nearestWords[0].word), vector2);
      const nearest2 = embeddingService.findNearestNeighbors(midpoint2Vector, 5);
      
      results.secondaryMidpoints = [
        {
          endpoints: [word1, nearestWords[0].word],
          theoreticalMidpoint: midpoint1Vector.slice(0, 5),
          nearestWords: nearest1
        },
        {
          endpoints: [nearestWords[0].word, word2],
          theoreticalMidpoint: midpoint2Vector.slice(0, 5),
          nearestWords: nearest2
        }
      ];
      
      // If recursion depth is 2, calculate tertiary midpoints
      if (recursionDepth > 1) {
        // Calculate tertiary midpoints
        const tertiary1Vector = embeddingService.calculateMidpoint(vector1, embeddingService.getWordVector(nearest1[0].word));
        const tertiary1 = embeddingService.findNearestNeighbors(tertiary1Vector, 5);
        
        const tertiary2Vector = embeddingService.calculateMidpoint(embeddingService.getWordVector(nearest1[0].word), embeddingService.getWordVector(nearestWords[0].word));
        const tertiary2 = embeddingService.findNearestNeighbors(tertiary2Vector, 5);
        
        const tertiary3Vector = embeddingService.calculateMidpoint(embeddingService.getWordVector(nearestWords[0].word), embeddingService.getWordVector(nearest2[0].word));
        const tertiary3 = embeddingService.findNearestNeighbors(tertiary3Vector, 5);
        
        const tertiary4Vector = embeddingService.calculateMidpoint(embeddingService.getWordVector(nearest2[0].word), vector2);
        const tertiary4 = embeddingService.findNearestNeighbors(tertiary4Vector, 5);
        
        results.tertiaryMidpoints = [
          {
            endpoints: [word1, nearest1[0].word],
            theoreticalMidpoint: tertiary1Vector.slice(0, 5),
            nearestWords: tertiary1
          },
          {
            endpoints: [nearest1[0].word, nearestWords[0].word],
            theoreticalMidpoint: tertiary2Vector.slice(0, 5),
            nearestWords: tertiary2
          },
          {
            endpoints: [nearestWords[0].word, nearest2[0].word],
            theoreticalMidpoint: tertiary3Vector.slice(0, 5),
            nearestWords: tertiary3
          },
          {
            endpoints: [nearest2[0].word, word2],
            theoreticalMidpoint: tertiary4Vector.slice(0, 5),
            nearestWords: tertiary4
          }
        ];
      }
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