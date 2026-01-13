import 'reflect-metadata';

/**
 * Main Entry Point - Mode Dispatcher
 *
 * Reads NODE_MODE environment variable and bootstraps the appropriate mode:
 * - 'api' → API only (HTTP server, no workers)
 * - 'workers' → Workers only (BullMQ consumers, no HTTP server)
 * - 'hybrid' → Both API and Workers (default)
 *
 * This allows flexible deployment strategies:
 * - Scale API and Workers independently on Railway
 * - Run everything in one process for development
 */

type NodeMode = 'api' | 'workers' | 'hybrid';

const NODE_MODE = (process.env.NODE_MODE || 'hybrid') as NodeMode;

const VALID_MODES: NodeMode[] = ['api', 'workers', 'hybrid'];

async function bootstrap() {
  // Validate NODE_MODE
  if (!VALID_MODES.includes(NODE_MODE)) {
    console.error(`❌ Invalid NODE_MODE: "${NODE_MODE}"`);
    console.error(`   Valid values: ${VALID_MODES.join(', ')}`);
    console.error(`   Defaulting to 'hybrid' mode`);
    process.env.NODE_MODE = 'hybrid';
  }

  console.log(`🚀 Starting FND SaaS QuickLaunch in ${NODE_MODE.toUpperCase()} mode...`);

  try {
    switch (NODE_MODE) {
      case 'api': {
        const { bootstrapApi } = await import('./main.api');
        await bootstrapApi();
        break;
      }
      case 'workers': {
        const { bootstrapWorkers } = await import('./main.workers');
        await bootstrapWorkers();
        break;
      }
      case 'hybrid': {
        const { bootstrapHybrid } = await import('./main.hybrid');
        await bootstrapHybrid();
        break;
      }
      default: {
        // TypeScript should prevent this, but just in case
        throw new Error(`Unhandled NODE_MODE: ${NODE_MODE}`);
      }
    }

    console.log(`✅ FND SaaS QuickLaunch ${NODE_MODE.toUpperCase()} mode started successfully`);
  } catch (error) {
    console.error(`❌ Failed to start FND SaaS QuickLaunch in ${NODE_MODE} mode:`, error);
    process.exit(1);
  }
}

bootstrap();
