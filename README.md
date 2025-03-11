This project visualizes semantic relationships between words by recursively finding midpoints between their embedding vectors, revealing intermediate semantic connections and demonstrating how closely concepts relate in language. It iteratively computes midpoint embeddings between two given words, identifies the nearest existing word embeddings, and recursively repeats this process to map semantic spaces.
￼
🔧 High-Level System Architecture
	•	Frontend:
	◦	Interface: Web application allowing users to input two words and view recursively identified midpoint words visually.
	◦	Tools/Libraries: React.js and eventually Chart.js (visualization).
	•	Backend:
	◦	Service: Express backend serving embeddings using GloVe, computing cosine similarities, vector midpoints, and nearest neighbors.
	◦	Algorithms/Libraries: TensorFlow.js (embedding operations, cosine similarity), math.js (vector arithmetic), Express.js (API handling), pre-trained embeddings (e.g., GloVe, FastText).
	•	Algorithms: Cosine similarity, recursive midpoint computation between two words, nearest neighbor search (brute-force initially; optimized indexing in future iterations).
Below is a concise outline of what a minimal viable product (MVP) might look like for VectorMind, including recommended libraries, a high‐level dataflow diagram (in Mermaid), and a proposed directory structure.

1. High-Level Technical Specs (MVP)
Frontend
	•	Framework: React (create-react-app or Vite for quick scaffolding).
	•	Visualization:
	◦	Chart.js or D3.js for plotting points in a 2D plane.
	◦	Optional: A small library like react-chartjs-2 or react-force-graph if you want a more “network‐like” feel.
	•	Core Responsibilities
	1	Capture user’s two input words.
	2	Submit them to the backend.
	3	Render the returned midpoint chain or graph in a 2D plot.
	4	Provide basic UI elements (e.g., text fields, “Submit” button, “PCA” button).
Backend
	•	Server Framework: Express.js for a simple Node.js REST API.
	•	Embeddings & Vector Ops:
	◦	Pre-trained word embeddings (e.g., GloVe or FastText).
	◦	TensorFlow.js or mathjs for vector arithmetic and cosine similarity if you prefer staying entirely in JS.
	◦	(MVP Approach) Brute-force nearest neighbor by comparing the midpoint vector to each word embedding and picking the top N matches.
	•	Core Responsibilities
	1	Load embeddings into memory (once, at server start).
	2	On request, retrieve vectors for the user’s input words.
	3	Compute the midpoint vector and find the nearest existing embedding(s).
	4	Recursively repeat until a max depth or stopping criterion (e.g. min distance).
	5	Return the list/chain of discovered “midpoint” words (plus their vectors) to the frontend.
Workflow Summary
	1	User enters two words on the React front end.
	2	Frontend hits POST /api/findMidpoints with {"word1": "...", "word2": "..."}.
	3	Backend fetches vectors for both words, recursively computes midpoints and nearest neighbors.
	4	Backend returns a JSON structure of nodes and edges.
	5	Frontend renders it via a chart or similar 2D plot.

2. High-Level Dataflow Diagram
flowchart LR
    A[User inputs two words] --> B[Frontend]
    B -->|POST /api/findMidpoints| C[Express Backend]
    C --> D[Load Embeddings in Memory on startup]
    C --> E[Compute vectors for the two input words]
    E --> F[Compute midpoint vector & find nearest neighbors]
    F --> G[Repeat recursively until stopping criteria]
    G --> H[Return JSON of words + vectors + connections]
    H --> B[Frontend Renders 2D Visualization]


3. Recommended Libraries for an MVP
	1	Frontend
	◦	React for the UI.
	◦	Charting: Chart.js (via react-chartjs-2) or D3.js.
	2	Backend
	◦	Express.js for routing.
	◦	Math/Linear Algebra:
	▪	Either mathjs for basic operations or
	▪	TensorFlow.js for more GPU-accelerated or advanced embedding ops.
	◦	Pre-trained embeddings (GloVe, FastText).
	◦	File handling: fs (built-in) to load embeddings at startup.
	3	Dev Tooling
	◦	Nodemon (for auto-restart on changes).
	◦	ESLint/Prettier (for code formatting).
For the MVP, brute force neighbor search is fine. Later optimizations might include approximate nearest neighbor libraries or a dedicated vector database.

4. Proposed Directory Structure
A simple structure that keeps frontend and backend code separate could look like this:
vectormind/
├─ client/                       # React Frontend
│  ├─ public/
│  │   └─ index.html
│  └─ src/
│      ├─ components/
│      │   ├─ WordInput.js
│      │   ├─ Visualization.js
│      │   └─ ...
│      ├─ pages/
│      │   └─ HomePage.js
│      ├─ services/
│      │   └─ api.js            # Helper for calling backend
│      └─ App.js
├─ server/                       # Node.js / Express Backend
│  ├─ controllers/
│  │   └─ embeddingsController.js
│  ├─ routes/
│  │   └─ embeddingsRoutes.js    # e.g. POST /api/findMidpoints
│  ├─ services/
│  │   ├─ embeddingService.js    # loads & stores vectors in memory
│  │   └─ midpointService.js     # logic for midpoint & neighbor search
│  ├─ embeddings/
│  │   └─ glove.6B.300d.txt      # example GloVe file
│  ├─ utils/
│  │   └─ mathHelpers.js         # vector math functions
│  └─ index.js                   # Express entry point
├─ config/                       # config, env variables, etc. (optional)
│  └─ default.json
├─ package.json                  # top-level package (may also have separate one in /client)
├─ README.md
└─ .gitignore

Key Notes
	•	client/ and server/ each have their own package.json and build scripts if you want them to run independently.
	•	Embedding files (e.g. glove.6B.300d.txt) can be large, so watch out for memory usage. In a production environment, you might store them in a more optimized format or in a separate data store.

Next Steps / Enhancements
	1	Approximate Nearest Neighbor Search
	◦	Switch from brute-force to a library like Faiss (Python) or a Node‐compatible alternative if the vocabulary is large.
	2	Dimensionality Reduction
	◦	If you want a real 2D layout that captures more relationships, consider PCA/UMAP/TSNE for the final embeddings.
	3	Advanced UI
	◦	Interactive graph with panning, zooming, or force-directed edges.

That’s it! With this outline, you have a straightforward plan for spinning up an MVP: a React front end to gather words and visualize results, and an Express backend that loads pre-trained embeddings, handles midpoint searches, and returns those results.
