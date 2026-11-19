import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';

async function startServer() {
  await connectDB();

  const server = app.listen(env.port, () => {
    console.log(`=======================================================`);
    console.log(`  RentGuard Backend Service running on port ${env.port}`);
    console.log(`  Environment: ${env.nodeEnv}`);
    console.log(`  Health Check: http://localhost:${env.port}/api/v1/health`);
    console.log(`=======================================================`);
  });

  const shutdown = async (signal) => {
    console.log(`[RentGuard Backend] Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDB();
      console.log('[RentGuard Backend] Closed out remaining connections.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer();

