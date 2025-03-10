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
  
  // Find nearest neighbors using the index
  findNearestNeighbors(vector, k = 5) {
    if (!this.index) {
      throw new Error('Index not loaded. Please call loadEmbeddings() first.');
    }
    
    try {
      const result = this.index.searchKnn(vector, k);
      
      return result.neighbors.map((id, i) => ({
        word: this.idToWord[id],
        distance: result.distances[i]
      }));
    } catch (error) {
      console.error('Error searching index:', error);
      throw new Error('Failed to search for nearest neighbors');
    }
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
