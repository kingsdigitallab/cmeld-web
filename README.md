# CMELD Web

A proof of concept for a semantic search interface that allows users to explore
book reviews through both text search and visual exploration.

## Features

- **Semantic Search**: Uses transformers.js (with the all-MiniLM-L6-v2 model) to
  perform semantic search on book reviews
- **Interactive Visualization**: Displays reviews in a 2D space using Observable
  Plot, where:
  - Dark blue circles represent all reviews in the dataset
  - Search results are highlighted in orange
  - Hovering over points reveals the work titles
- **User Interface**:
  - Search form with adjustable number of results
  - Real-time visualization updates
  - Ranked results list with similarity scores

## Technical Implementation

### Search (`src/lib/index.js`)

- Powered by `@xenova/transformers` library
- Uses the `all-MiniLM-L6-v2` model for feature extraction
- Implements cosine similarity for ranking results
- Optimizes storage by quantizing embeddings to INT8

### Visualisation (`src/lib/components/Plot.svelte`)

- Built with `@observablehq/plot`
- Interactive 2D scatter plot
- Responsive design with hover tooltips

### Frontend

- Built with SvelteKit
- Styled with Pico CSS
- Static site generation for optimal performance

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

1. Run development server:

   ```bash
   npm run dev
   ```

1. Build for production:

   ```bash
   npm run build
   ```

## Dependencies

- `@xenova/transformers`: For semantic search functionality
- `@observablehq/plot`: For data visualization
- `@sveltejs/kit`: Web framework
- `@picocss/pico`: CSS framework

## License

MIT License - See LICENSE file for details
