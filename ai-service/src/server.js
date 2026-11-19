import dotenv from 'dotenv';
import { createApp } from './app.js';

dotenv.config({ path: new URL('../.env', import.meta.url) });
const port = Number(process.env.PORT || 8000);
const host = process.env.HOST || '127.0.0.1';
const server = createApp().listen(port, host, () => {
  console.log(`[RentGuard AI] Listening on http://${host}:${port}`);
});
server.on('error', (error) => {
  console.error(`[RentGuard AI] ${error.message}`);
  process.exitCode = 1;
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => server.close());
}
