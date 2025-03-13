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

  calculateMidpoint(vector1, vector2) {
    if (!vector1 || !vector2 || vector1.length !== vector2.length) {
      throw new Error('Invalid vectors for midpoint calculation');
    }
    
    // Calculate the midpoint by averaging the vectors
    const midpoint = new Array(vector1.length);
    for (let i = 0; i < vector1.length; i++) {
      midpoint[i] = (vector1[i] + vector2[i]) / 2;
    }
    
    return midpoint;
  }

  // Add this method to find midpoints with exact search instead of HNSW
  findMidpointExact(vector, numResults = 5, excludeWords = []) {
    if (!vector) {
      throw new Error('Invalid vector for midpoint calculation');
    }
    
    // Create a set of words to exclude from results
    const excludeSet = new Set(excludeWords.map(w => w.toLowerCase()));
    
    // Calculate similarity with all words in vocabulary
    const results = [];
    for (const [word, id] of this.wordToId.entries()) {
      // Skip excluded words
      if (excludeSet.has(word)) continue;
      
      const wordVector = this.getWordVector(word);
      if (!wordVector) continue;
      
      const distance = this.calculateEuclideanDistance(vector, wordVector);
      results.push({ word, distance });
    }
    
    // Sort by distance (ascending) and return top results
    return results.sort((a, b) => a.distance - b.distance).slice(0, numResults);
  }

  // ----- UNIFIED VECTOR OPERATIONS ----- //

  // Vector math operations
  calculateEuclideanDistance(vector1, vector2) {
    if (!vector1 || !vector2 || vector1.length !== vector2.length) {
      return Infinity;
    }
    
    let sum = 0;
    for (let i = 0; i < vector1.length; i++) {
      const diff = vector1[i] - vector2[i];
      sum += diff * diff;
    }
    
    return Math.sqrt(sum);
  }

  calculateMidpoint(vector1, vector2) {
    if (!vector1 || !vector2 || vector1.length !== vector2.length) {
      throw new Error('Invalid vectors for midpoint calculation');
    }
    
    // Calculate the midpoint by averaging the vectors
    const midpoint = new Array(vector1.length);
    for (let i = 0; i < vector1.length; i++) {
      midpoint[i] = (vector1[i] + vector2[i]) / 2;
    }
    
    return midpoint;
  }

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

  // ----- UNIFIED SEARCH OPERATIONS ----- //

  // Core unified vector neighbor search - this is the central "router" function
  findVectorNeighbors(vector, numResults, excludeWords = [], useExactSearch = false) {
    if (!this.index) {
      throw new Error('Index not loaded. Please call loadEmbeddings() first.');
    }

    console.log(`Finding neighbors with ${useExactSearch ? 'exact' : 'HNSW'} search`);
    
    if (useExactSearch) {
      return this.findVectorNeighborsExact(vector, numResults, excludeWords);
    } else {
      return this.findVectorNeighborsHNSW(vector, numResults, excludeWords);
    }
  }

  // HNSW-based search (fast but approximate)
  findVectorNeighborsHNSW(vector, numResults, excludeWords = []) {
    try {
      // Convert excludeWords to a Set for faster lookups
      const excludeSet = new Set(excludeWords.map(w => w.toLowerCase()));
      
      // We might need more results initially to account for excludeWords
      const extraResults = Math.min(excludeWords.length * 2 + 5, 20);
      const totalResults = numResults + extraResults;
      
      // Search HNSW index
      const result = this.index.searchKnn(vector, totalResults);
      
      // Map results to words with proper error handling
      const neighbors = [];
      
      for (let i = 0; i < result.neighbors.length; i++) {
        const id = result.neighbors[i];
        
        // Skip if ID is invalid
        if (id < 0 || id >= this.idToWord.length) {
          console.error(`Invalid ID ${id} outside range of idToWord mapping`);
          continue;
        }
        
        const word = this.idToWord[id];
        
        // Skip if word is undefined or in exclude list
        if (!word || excludeSet.has(word.toLowerCase())) {
          continue;
        }
        
        neighbors.push({
          word: word,
          distance: result.distances[i]
        });
        
        // Stop once we have enough results
        if (neighbors.length >= numResults) break;
      }
      
      return neighbors;
    } catch (error) {
      console.error('Error in HNSW search:', error);
      throw new Error('Failed to search HNSW index: ' + error.message);
    }
  }

  // Exact search (slower but precise)
  findVectorNeighborsExact(vector, numResults, excludeWords = []) {
    try {
      // Create a set of words to exclude
      const excludeSet = new Set(excludeWords.map(w => w.toLowerCase()));
      
      // Calculate similarity with all words in vocabulary
      const results = [];
      
      for (const [word, id] of this.wordToId.entries()) {
        // Skip excluded words
        if (excludeSet.has(word.toLowerCase())) continue;
        
        const wordVector = this.getWordVector(word);
        if (!wordVector) continue;
        
        const distance = this.calculateEuclideanDistance(vector, wordVector);
        results.push({ word, distance });
      }
      
      // Sort by distance (ascending) and return top results
      return results.sort((a, b) => a.distance - b.distance).slice(0, numResults);
    } catch (error) {
      console.error('Error in exact vector search:', error);
      throw new Error('Failed to perform exact search: ' + error.message);
    }
  }

  // ----- HIGH-LEVEL API METHODS ----- //

  // Find neighbors for a specific word
  findWordNeighbors(word, numResults = 5, useExactSearch = false) {
    const vector = this.getWordVector(word);
    if (!vector) {
      throw new Error(`Word "${word}" not found in vocabulary`);
    }
    
    return this.findVectorNeighbors(vector, numResults, [word], useExactSearch);
  }

  // Find the midpoint between two words and its neighbors
  findMidpoint(word1, word2, numResults = 5, useExactSearch = true) {
    const vector1 = this.getWordVector(word1);
    const vector2 = this.getWordVector(word2);
    
    if (!vector1 || !vector2) {
      throw new Error('One or more word vectors not found');
    }
    
    const midpointVector = this.calculateMidpoint(vector1, vector2);
    return this.findVectorNeighbors(midpointVector, numResults, [word1, word2], useExactSearch);
  }

  // Find analogy completions (word2 - word1 + word3)
  findAnalogy(word1, word2, word3, numResults = 5, useExactSearch = true) {
    const vector1 = this.getWordVector(word1);
    const vector2 = this.getWordVector(word2);
    const vector3 = this.getWordVector(word3);
    
    if (!vector1 || !vector2 || !vector3) {
      throw new Error('One or more word vectors not found');
    }
    
    const analogyVector = this.calculateAnalogy(vector1, vector2, vector3);
    return this.findVectorNeighbors(analogyVector, numResults, [word1, word2, word3], useExactSearch);
  }
}

// Create a singleton instance
const embeddingService = new EmbeddingService();

export default embeddingService;
