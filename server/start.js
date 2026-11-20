// "npm run server": the local server alone, for a browser on this computer, for tests and for machines without a
// screen. The desktop app (desktop/main.js) runs the same server inside Electron.
import { readConfig } from './config.js';
import { createApp } from './index.js';

async function main() {
  let config = readConfig();
  let app = createApp(config);
  let port;
  try {
    port = await app.listen();
  } catch (e) {
    if (e.code !== 'EADDRINUSE' || process.env.PORT) throw e.code === 'EADDRINUSE' ? new Error(`Port ${config.port} is in use. Choose another one with PORT=...`) : e;
    config = { ...config, port: 0 };
    app = createApp(config);
    port = await app.listen();
  }
  console.log(`Pseudonymizer running at http://localhost:${port}`);

  // Whatever ends the server, no AI tool keeps running and the model is released in order. A signal would otherwise
  // end the process without any of that.
  let isEnding = false;
  const end = async () => {
    if (isEnding) return;
    isEnding = true;
    await app.close().catch(() => {}); // ending anyway; 'exit' below still stops what is left
    process.exit(0);
  };
  process.on('exit', () => app.stopNow());
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK']) process.on(signal, () => void end());
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
