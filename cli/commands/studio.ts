// cli/commands/studio.ts
import http from 'http';
import fs from 'fs';
import { exec } from 'child_process';
import { resolveXalorPaths } from '../../shared/utils';
import {
  STUDIO_PROXY_BRIDGE_TEMPLATE,
  STUDIO_COMMAND_CONFIG,
  STUDIO_SERVER_CONNECTION_COMMANDS,
} from '../models';
import { StudioCLIEngineService } from '../service';
import { fsContext } from '../../shared';

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
  const xalorSecuritySecret = STUDIO_COMMAND_CONFIG.xalorSecuritySecret;

  /* prettier-ignore */
  const studioProductionUrl = STUDIO_COMMAND_CONFIG.studioProductionUrl(studioBaseUrl, xalorSecuritySecret)

  console.log('\n====================================================');
  console.log('🛰️  [Xalor Studio] CONNECTING SECURE MESSAGE PIPELINE...');
  console.log(`🌐 Local Gateway Entry: ${connectionUrl}`);
  console.log(`🔒 Active Handshake Key: ${xalorSecuritySecret}`);
  console.log('====================================================\n');

  process.env.XALOR_CLI_STUDIO = 'true';

  const studioEngine = new StudioCLIEngineService();

  const connectedClientSocketsPool = new Set<http.ServerResponse>();

  // =========================================================================
  // 🟢 FIXED SINGLETON FILE WATCHER UTILITY (Commandment VIII Alignment)
  // =========================================================================
  // Instantiated exactly ONCE on boot. Eliminates the MaxListenersExceeded leak permanently.
  if (fsContext.fileExists(paths.vaultFile)) {
    fs.watch(paths.vaultFile, async (eventType) => {
      if (eventType === 'change' && connectedClientSocketsPool.size > 0) {
        try {
          const freshPayload =
            await studioEngine.compileDashboardOverviewDataset(port);
          const ssePacket = `data: ${JSON.stringify(freshPayload)}\n\n`;

          // Broadcast the fresh type matrix to all open active frontend channels simultaneously
          for (const clientResponseSocket of connectedClientSocketsPool) {
            clientResponseSocket.write(ssePacket);
          }
        } catch {
          // Suppress broad-cast loop drop errors to protect process thread parameters
        }
      }
    });
  }

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

    // =========================================================================
    // 📡 UPGRADED PIPELINE B: INTERNAL COHESIVE READ BACKPLANE
    // =========================================================================
    if (req.url === '/api/vault-direct') {
      res.writeHead(200, { 'Content-Type': 'application/json' });

      studioEngine
        .compileDashboardOverviewDataset(port)
        .then((payload) => {
          res.end(JSON.stringify(payload));
        })
        .catch(() => {
          res.end(
            JSON.stringify({ error: 'STUDIO_METRICS_COMPILATION_FAILED' }),
          );
        });
      return;
    }
    if (req.url === '/api/vault-stream') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });

      connectedClientSocketsPool.add(res);

      studioEngine.compileDashboardOverviewDataset(port).then((payload) => {
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
      });

      req.on('close', () => {
        connectedClientSocketsPool.delete(res);
        res.end();
      });
      return;
    }
    res.writeHead(404);
    res.end('Not Found');
  });

  server.listen(port, () => {
    console.log(
      `🚀 [Xalor CLI] Local Studio broker streaming cleanly on port ${port}`,
    );
    const launchBinary = STUDIO_SERVER_CONNECTION_COMMANDS[process.platform];
    if (!launchBinary) {
      /* prettier-ignore */
      console.log(`\n💡 [Xalor Note]: Automated browser launch is not supported natively on '${process.platform}'.`);
      /* prettier-ignore */
      console.log(`🔗 Please manually open your browser navigation tab to: ${connectionUrl}\n`);
      return;
    }
    exec(`${launchBinary} "${connectionUrl}"`, (error) => {
      if (error) {
        /* prettier-ignore */
        console.log(`\n💡 [Xalor Note]: Automated browser launcher failed to execute.`);
        /* prettier-ignore */
        console.log(`🔗 Please manually open your browser navigation tab to: ${connectionUrl}\n`);
      }
    });
  });
}
