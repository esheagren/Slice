import fs from 'fs';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import hnsw from 'hnswlib-node';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const EMBEDDING_DIM = 200; // For glove.6B.200d.txt
const MAX_ELEMENTS = 400000; // Adjust based on your vocabulary size
const EF_CONSTRUCTION = 200; // Higher values = more accurate but slower construction
const M = 16; // Number of connections per element (default is 16)

async function buildIndex() {
  console.log('Building embedding index...');
  const startTime = Date.now();

  // Initialize the index
  const index = new hnsw.HierarchicalNSW('l2', EMBEDDING_DIM);
  index.initIndex(MAX_ELEMENTS, M, EF_CONSTRUCTION);

  // Prepare to store word-to-id mapping
  const wordToId = new Map();
  const idToWord = [];
  
  // Read embeddings file
  const embeddingsPath = join(__dirname, '../embeddings/glove.6B.200d.txt');
  
  if (!fs.existsSync(embeddingsPath)) {
    console.error(`Embeddings file not found: ${embeddingsPath}`);
    process.exit(1);
  }
  
  const fileStream = fs.createReadStream(embeddingsPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let count = 0;

  for await (const line of rl) {
    const values = line.split(' ');
    const word = values[0];
    const vector = values.slice(1).map(Number);
    
    if (vector.length === EMBEDDING_DIM) {
      // Add to index
      index.addPoint(vector, count);
      
      // Store mappings
      wordToId.set(word, count);
      idToWord.push(word);
      
      count++;
      
      if (count % 10000 === 0) {
        console.log(`Indexed ${count} word embeddings...`);
      }
      
      if (count >= MAX_ELEMENTS) {
        console.log(`Reached maximum elements (${MAX_ELEMENTS}), stopping indexing.`);
        break;
      }
    }
  }

  // Save the index and mappings
  const indexPath = join(__dirname, '../embeddings/hnsw_index.bin');
  const wordMapPath = join(__dirname, '../embeddings/word_to_id.json');
  const idMapPath = join(__dirname, '../embeddings/id_to_word.json');
  
  index.writeIndex(indexPath);
  fs.writeFileSync(wordMapPath, JSON.stringify(Array.from(wordToId.entries())));
  fs.writeFileSync(idMapPath, JSON.stringify(idToWord));
  
  const loadTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`Finished building index for ${count} word embeddings in ${loadTime} seconds`);
  console.log(`Index saved to ${indexPath}`);
}

buildIndex().catch(err => {
  console.error('Error building index:', err);
});