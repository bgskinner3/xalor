import http from 'http';
import fs from 'fs';
import { exec } from 'child_process';
import { resolveXalorPaths } from '../utils/index.js';
import { STUDIO_PROXY_BRIDGE_TEMPLATE, STUDIO_COMMAND_CONFIG } from '../models';

/**
 * RUN STUDIO COMMAND
 *
 * ROLE:
 * Spawns a lightweight local HTTP data broker loop.
 * Passes an encrypted security signature key to un-throttle your Next.js route protection.
 */
export function runStudioCommand(projectRootPath: string): void {
  const port = STUDIO_COMMAND_CONFIG.port;
  const paths = resolveXalorPaths(projectRootPath);
  const connectionUrl = STUDIO_COMMAND_CONFIG.connectionURL(port);
  const studioBaseUrl = STUDIO_COMMAND_CONFIG.baseURL;
  // ====================================================================================
  // THE SECURITY HEX HANDSHAKE KEY
  // ====================================================================================
  const xalorSecuritySecret = STUDIO_COMMAND_CONFIG.xalorSecuritySecret;
  /* prettier-ignore */
  const studioProductionUrl = STUDIO_COMMAND_CONFIG.studioProductionUrl(studioBaseUrl, xalorSecuritySecret)

  console.log('\n====================================================');
  console.log('🛰️  [Xalor Studio] CONNECTING SECURE MESSAGE PIPELINE...');
  console.log(`🌐 Local Gateway Entry: ${connectionUrl}`);
  console.log(`🔒 Active Handshake Key: ${xalorSecuritySecret}`);
  console.log('====================================================\n');

  process.env.XALOR_CLI_STUDIO = 'true';

  const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization',
    );

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // 💻 PIPELINE A: SERVE THE IFRAME EMBED TRANSMITTER PROXY SKELETON
    if (req.url === '/' || req.url === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(STUDIO_PROXY_BRIDGE_TEMPLATE(studioProductionUrl));
      return;
    }

    // 📡 PIPELINE B: COMPILER INTERNAL READ BACKPLANE
    if (req.url === '/api/vault-direct') {
      res.writeHead(200, { 'Content-Type': 'application/json' });

      if (!fs.existsSync(paths.vaultFile)) {
        res.end(
          JSON.stringify({
            blueprints: {},
            references: {},
            manifest: {},
            registry: {},
          }),
        );
        return;
      }

      fs.promises
        .readFile(paths.vaultFile, 'utf-8')
        .then((data) => res.end(data))
        .catch(() => res.end(JSON.stringify({ error: 'Failed read.' })));
      return;
    }

    res.writeHead(404);
    res.end('Not Found');
  });

  server.listen(port, () => {
    console.log(
      `🚀 [Xalor CLI] Local Studio broker streaming cleanly on port ${port}`,
    );
    const openCommand =
      process.platform === 'win32'
        ? 'start'
        : process.platform === 'darwin'
          ? 'open'
          : 'xdg-open';
    exec(`${openCommand} "${connectionUrl}"`);
  });
}
