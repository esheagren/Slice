import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import hnsw from 'hnswlib-node';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class EmbeddingService {
  constructor() {
    this.dimensions = 200;
    this.isLoaded = false;
    this.loading = null;
    this.index = null;
    this.wordToId = new Map();
    this.idToWord = [];
    this.wordVectors = new Map(); // Store only the vectors we need
  }

  async loadEmbeddings() {
    if (this.isLoaded) {
      return Promise.resolve();
    }

    if (this.loading) {
      return this.loading;
    }

    console.log('Loading embedding index...');
    const startTime = Date.now();

    this.loading = new Promise(async (resolve, reject) => {
      try {
        // Check if index exists
        const indexPath = join(__dirname, '../embeddings/hnsw_index.bin');
        const wordMapPath = join(__dirname, '../embeddings/word_to_id.json');
        const idMapPath = join(__dirname, '../embeddings/id_to_word.json');
        
        if (!fs.existsSync(indexPath) || !fs.existsSync(wordMapPath) || !fs.existsSync(idMapPath)) {
          throw new Error('Index files not found. Please run the build-index script first.');
        }
        
        // Load word mappings first
        const wordToIdArray = JSON.parse(fs.readFileSync(wordMapPath, 'utf8'));
        this.wordToId = new Map(wordToIdArray);
        this.idToWord = JSON.parse(fs.readFileSync(idMapPath, 'utf8'));
        
        // Initialize the index with the correct parameters
        this.index = new hnsw.HierarchicalNSW('l2', this.dimensions);
        
        // We need to initialize the index before reading it
        // Use the number of words as max_elements
        const numElements = this.idToWord.length;
        this.index.initIndex(numElements, 16, 200);
        
        // Now read the index from file
        this.index.readIndex(indexPath);
        
        // Set search parameters
        this.index.setEf(50); // Search accuracy parameter (higher = more accurate but slower)
        
        const loadTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`Loaded index with ${this.idToWord.length} words in ${loadTime} seconds`);
        this.isLoaded = true;
        resolve();
      } catch (err) {
        console.error('Error loading embedding index:', err);
        reject(err);
      }
    });

    return this.loading;
  }

  getWordVector(word) {
    // Convert to lowercase for case-insensitive lookup
    const normalizedWord = word.toLowerCase();
    
    // Check if we already have this vector cached
    if (this.wordVectors.has(normalizedWord)) {
      return this.wordVectors.get(normalizedWord);
    }
    
    // Get the ID for this word
    const id = this.wordToId.get(normalizedWord);
    if (id === undefined) {
      return null; // Word not found
    }
    
    // Get the vector from the index
    try {
      const vector = this.index.getPoint(id);
      
      // Cache the vector for future use
      this.wordVectors.set(normalizedWord, vector);
      
      return vector;
    } catch (error) {
      console.error(`Error getting vector for word "${normalizedWord}":`, error);
      return null;
    }
  }

  wordExists(word) {
    const normalizedWord = word.toLowerCase();
    return this.wordToId.has(normalizedWord);
  }

  // Calculate midpoint between two vectors
  calculateMidpoint(vector1, vector2) {
    if (!vector1 || !vector2 || vector1.length !== vector2.length) {
      return null;
    }

    return vector1.map((val, i) => (val + vector2[i]) / 2);
  }
  
  // Add this new method for analogy calculations
  calculateAnalogy(vector1, vector2, vector3) {
    if (!vector1 || !vector2 || !vector3 ||
        vector1.length !== vector2.length || vector2.length !== vector3.length) {
      console.error('Invalid vectors for analogy calculation');
      return null;
    }

    // Calculate vector2 - vector1 + vector3
    const analogyVector = new Array(vector1.length);
    for (let i = 0; i < vector1.length; i++) {
      analogyVector[i] = vector2[i] - vector1[i] + vector3[i];
    }
    
    return analogyVector;
  }
  
  // Enhanced findNearestNeighbors with better error handling and debugging
  findNearestNeighbors(vector, numResults) {
    if (!this.index) {
      throw new Error('Index not loaded. Please call loadEmbeddings() first.');
    }
    
    try {
      // Log some debug info
      console.log(`Searching for ${numResults} nearest neighbors`);
      console.log(`idToWord array length: ${this.idToWord.length}`);
      
      const result = this.index.searchKnn(vector, numResults);
      console.log(`Search returned ${result.neighbors.length} neighbors`);
      
      // Validate result format
      if (!result.neighbors || !result.distances) {
        console.error('Invalid search result format:', result);
        throw new Error('Invalid search result from HNSW');
      }
      
      return result.neighbors.map((id, i) => {
        // Extra validation of the ID
        if (id >= this.idToWord.length || id < 0) {
          console.error(`Invalid ID ${id} outside range of idToWord mapping (0-${this.idToWord.length-1})`);
          return { word: `unknown_${id}`, distance: result.distances[i] };
        }
        
        // Get the word, with fallback if undefined
        const word = this.idToWord[id];
        if (!word) {
          console.error(`No word found for ID ${id}`);
          return { word: `empty_${id}`, distance: result.distances[i] };
        }
        
        return {
          word: word,
          distance: result.distances[i]
        };
      });
    } catch (error) {
      console.error('Error searching index:', error);
      throw new Error('Failed to search for nearest neighbors: ' + error.message);
    }
  }
  
  // Add this method to find analogies with exact search instead of HNSW for better accuracy
  findAnalogyExact(word1, word2, word3, numResults) {
    // Get vectors
    const vector1 = this.getWordVector(word1);
    const vector2 = this.getWordVector(word2);
    const vector3 = this.getWordVector(word3);
    
    if (!vector1 || !vector2 || !vector3) {
      throw new Error('One or more word vectors not found');
    }
    
    // Calculate analogy vector
    const analogyVector = this.calculateAnalogy(vector1, vector2, vector3);
    
    // Perform exact similarity calculation for all words
    const results = [];
    
    // Create a set of words to exclude from results
    const excludeWords = new Set([word1, word2, word3]);
    
    // Calculate similarity with all words in vocabulary
    for (const [word, id] of this.wordToId.entries()) {
      // Skip input words
      if (excludeWords.has(word)) continue;
      
      const wordVector = this.getWordVector(word);
      if (!wordVector) continue;
      
      const distance = this.calculateEuclideanDistance(analogyVector, wordVector);
      results.push({ word, distance });
    }
    
    // Sort by distance (ascending) and return top results
    return results.sort((a, b) => a.distance - b.distance).slice(0, numResults);
  }
  
  calculateEuclideanDistance(a, b) {
    if (!a || !b || a.length !== b.length) {
      return Infinity;
    }
    
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      const diff = a[i] - b[i];
      sum += diff * diff;
    }
    
    return Math.sqrt(sum);
  }
}

// Create a singleton instance
const embeddingService = new EmbeddingService();

export default embeddingService;
