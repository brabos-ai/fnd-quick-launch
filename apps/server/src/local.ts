/**
 * Local Development Entry Point
 *
 * Sets NODE_MODE=hybrid by default for local development.
 * This runs both API and Workers in a single process for convenience.
 *
 * To run in specific modes:
 * - API only: NODE_MODE=api npm run dev:api
 * - Workers only: NODE_MODE=workers npm run dev:api
 * - Hybrid (default): npm run dev:api
 */

// Set default mode for local development
if (!process.env.NODE_MODE) {
  process.env.NODE_MODE = 'hybrid';
  console.log('📝 NODE_MODE not set, defaulting to "hybrid" for local development');
}

// Import and run main dispatcher
import('./main');
