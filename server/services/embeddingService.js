import fs from 'fs';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class EmbeddingService {
  constructor() {
    this.embeddings = new Map();
    this.dimensions = 200; // For glove.6B.200d.txt
    this.isLoaded = false;
    this.loading = null;
  }

  async loadEmbeddings() {
    if (this.isLoaded) {
      return Promise.resolve();
    }

    if (this.loading) {
      return this.loading;
    }

    console.log('Loading word embeddings...');
    const startTime = Date.now();

    this.loading = new Promise((resolve, reject) => {
      const embeddingsPath = join(__dirname, '../embeddings/glove.6B.200d.txt');
      
      // Check if file exists
      if (!fs.existsSync(embeddingsPath)) {
        const error = new Error(`Embeddings file not found: ${embeddingsPath}`);
        console.error(error.message);
        reject(error);
        return;
      }
      
      const fileStream = fs.createReadStream(embeddingsPath);
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });

      let count = 0;

      rl.on('line', (line) => {
        const values = line.split(' ');
        const word = values[0];
        const vector = values.slice(1).map(Number);
        
        if (vector.length === this.dimensions) {
          this.embeddings.set(word, vector);
          count++;
          
          if (count % 10000 === 0) {
            console.log(`Loaded ${count} word embeddings...`);
          }
        }
      });

      rl.on('close', () => {
        const loadTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`Finished loading ${count} word embeddings in ${loadTime} seconds`);
        this.isLoaded = true;
        resolve();
      });

      rl.on('error', (err) => {
        console.error('Error loading embeddings:', err);
        reject(err);
      });
    });

    return this.loading;
  }

  getWordVector(word) {
    // Convert to lowercase for case-insensitive lookup
    const normalizedWord = word.toLowerCase();
    return this.embeddings.get(normalizedWord);
  }

  wordExists(word) {
    const normalizedWord = word.toLowerCase();
    return this.embeddings.has(normalizedWord);
  }

  // Calculate midpoint between two vectors
  calculateMidpoint(vector1, vector2) {
    if (!vector1 || !vector2 || vector1.length !== vector2.length) {
      return null;
    }

    return vector1.map((val, i) => (val + vector2[i]) / 2);
  }
}

// Create a singleton instance
const embeddingService = new EmbeddingService();

// Add this line to export as default
export default embeddingService; 