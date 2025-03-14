import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import cors from 'cors';
import apiRoutes from './routes/api.js';
import embeddingService from './services/embeddingService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Update the CORS middleware configuration
app.use(cors({
  origin: process.env.VERCEL_ENV === 'production' 
    ? ['https://vector-mind.vercel.app', 'https://luminode.vercel.app'] // Add your Vercel domains
    : '*',  // Allow all origins during development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', apiRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // For Vercel, we don't need to serve static files here
  // as they are handled by Vercel's static deployment
  app.get('*', (req, res) => {
    // Only handle API routes, let Vercel handle the rest
    if (!req.path.startsWith('/api/')) {
      res.status(404).send('Not found');
    }
  });
}

// Check if embeddings directory exists
const embeddingsDir = join(__dirname, 'embeddings');
if (!fs.existsSync(embeddingsDir)) {
  fs.mkdirSync(embeddingsDir, { recursive: true });
  console.log(`Created embeddings directory at ${embeddingsDir}`);
  console.log('Please place glove.6B.200d.txt file in this directory before starting the server.');
}

// Function to start server with port fallback
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    
    // Start loading embeddings in the background
    embeddingService.loadEmbeddings()
      .then(() => {
        console.log('Embeddings loaded successfully');
      })
      .catch(err => {
        console.error('Failed to load embeddings:', err);
      });
  });
  
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.warn(`Port ${port} is already in use, trying ${port + 1}...`);
      server.close();
      startServer(port + 1);
    } else {
      console.error('Server error:', error);
    }
  });
};

// Start the server if not in Vercel serverless environment
if (process.env.VERCEL_ENV !== 'production') {
  startServer(PORT);
}

// Export for Vercel serverless function
export default app; 