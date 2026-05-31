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

  const studioEngine = new StudioCLIEngineService(projectRootPath);

  const connectedClientSocketsPool = new Set<http.ServerResponse>();

  // =========================================================================
  // 🟢 FIXED SINGLETON FILE WATCHER UTILITY (Commandment VIII Alignment)
  // =========================================================================
  // Instantiated exactly ONCE on boot. Eliminates the MaxListenersExceeded leak permanently.
  if (fs.existsSync(paths.vaultFile)) {
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

/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */
// const server = http.createServer((req, res) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
//   res.setHeader(
//     'Access-Control-Allow-Headers',
//     'Content-Type, Authorization',
//   );

//   if (req.method === 'OPTIONS') {
//     res.writeHead(204);
//     res.end();
//     return;
//   }

//   // 💻 PIPELINE A: SERVE THE IFRAME EMBED TRANSMITTER PROXY SKELETON
//   if (req.url === '/' || req.url === '/index.html') {
//     res.writeHead(200, { 'Content-Type': 'text/html' });
//     res.end(
//       STUDIO_PROXY_BRIDGE_TEMPLATE(
//         STUDIO_COMMAND_CONFIG.studioProductionUrl(
//           STUDIO_COMMAND_CONFIG.baseURL,
//           STUDIO_COMMAND_CONFIG.xalorSecuritySecret,
//         ),
//       ),
//     );
//     return;
//   }

//   // =========================================================================
//   // 📡 UPGRADED PIPELINE B: INTERNAL COHESIVE READ BACKPLANE
//   // =========================================================================
//   if (req.url === '/api/vault-direct') {
//     res.writeHead(200, { 'Content-Type': 'application/json' });

//     // Directly invoke your presentation-layer adapter to compile the comprehensive payload object on-demand
//     studioEngine
//       .compileDashboardOverviewDataset(port)
//       .then((payload) => {
//         // Stream the rich pre-compiled macro data metrics packet safely down the wire point-free
//         res.end(JSON.stringify(payload));
//       })
//       .catch(() => {
//         // Fallback gate returning clean zero-state structures if ingestion or parsing faults drop
//         res.end(
//           JSON.stringify({ error: 'STUDIO_METRICS_COMPILATION_FAILED' }),
//         );
//       });
//     return;
//   }

//   res.writeHead(404);
//   res.end('Not Found');
// });

// server.listen(port, () => {
//   console.log(
//     `🚀 [Xalor CLI] Local Studio broker streaming cleanly on port ${port}`,
//   );
//   const openCommand =
//     process.platform === 'win32'
//       ? 'start'
//       : process.platform === 'darwin'
//         ? 'open'
//         : 'xdg-open';
//   exec(`${openCommand} "${connectionUrl}"`);
// });
// const server = http.createServer((req, res) => {
//   // Phase 6 Cross-Origin Security Shield Headers
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
//   res.setHeader(
//     'Access-Control-Allow-Headers',
//     'Content-Type, Authorization',
//   );

//   if (req.method === 'OPTIONS') {
//     res.writeHead(204);
//     res.end();
//     return;
//   }

//   if (req.url === '/' || req.url === '/index.html') {
//     res.writeHead(200, { 'Content-Type': 'text/html' });
//     // Clear out the HTML embedding layout
//     res.end(STUDIO_PROXY_BRIDGE_TEMPLATE_TEMP(studioProductionUrl));
//     return;
//   }

//   // =========================================================================
//   // 📡 PIPELINE B: INTERNAL COHESIVE READ BACKPLANE (UPGRADED SSE)
//   // =========================================================================
//   if (req.url === '/api/vault-direct') {
//     res.writeHead(200, {
//       'Content-Type': 'text/event-stream',
//       'Cache-Control': 'no-cache',
//       Connection: 'keep-alive',
//     });

//     // Hydrate the browser canvas layout instantly on initial handshake connect
//     studioEngine
//       .compileDashboardOverviewDataset(port)
//       .then((initialPayload) => {
//         res.write(`data: ${JSON.stringify(initialPayload)}\n\n`);
//       })
//       .catch(() => {
//         res.write(
//           `data: ${JSON.stringify({ error: 'INITIAL_STUDIO_COMPILATION_FAILED' })}\n\n`,
//         );
//       });

//     // Register the response stream into our global tracking registry pool
//     connectedClientSocketsPool.add(res);

//     // Cleanly evict the socket reference when the frontend tab closes to prevent memory leaks
//     req.on('close', () => {
//       connectedClientSocketsPool.delete(res);
//       res.end();
//     });
//     return;
//   }
//   // if (req.url === '/api/vault-direct') {
//   //   res.writeHead(200, { 'Content-Type': 'application/json' });

//   //   if (!fs.existsSync(paths.vaultFile)) {
//   //     res.end(
//   //       JSON.stringify({
//   //         blueprints: {},
//   //         references: {},
//   //         manifest: {},
//   //         registry: {},
//   //       }),
//   //     );
//   //     return;
//   //   }

//   //   fs.promises
//   //     .readFile(paths.vaultFile, 'utf-8')
//   //     .then((data) => res.end(data))
//   //     .catch(() => res.end(JSON.stringify({ error: 'Failed read.' })));
//   //   return;
//   // }

//   res.writeHead(404);
//   res.end('Not Found');
// });

// server.listen(port, () => {
//   console.log(
//     `🚀 [Xalor CLI] Local Studio broker streaming cleanly on port ${port}`,
//   );

//   const openCommand =
//     process.platform === 'win32'
//       ? 'start'
//       : process.platform === 'darwin'
//         ? 'open'
//         : 'xdg-open';

//   exec(`${openCommand} "${connectionUrl}"`);
// });
// }

/**
 * ORIGINALLL
 */
// export function runStudioCommand(projectRootPath: string): void {
//   const port = STUDIO_COMMAND_CONFIG.port;
//   const paths = resolveXalorPaths(projectRootPath);
//   const connectionUrl = STUDIO_COMMAND_CONFIG.connectionURL(port);
//   const studioBaseUrl = STUDIO_COMMAND_CONFIG.baseURL;
//   // ====================================================================================
//   // THE SECURITY HEX HANDSHAKE KEY
//   // ====================================================================================
//   const xalorSecuritySecret = STUDIO_COMMAND_CONFIG.xalorSecuritySecret;
//   /* prettier-ignore */
//   const studioProductionUrl = STUDIO_COMMAND_CONFIG.studioProductionUrl(studioBaseUrl, xalorSecuritySecret)

//   console.log('\n====================================================');
//   console.log('🛰️  [Xalor Studio] CONNECTING SECURE MESSAGE PIPELINE...');
//   console.log(`🌐 Local Gateway Entry: ${connectionUrl}`);
//   console.log(`🔒 Active Handshake Key: ${xalorSecuritySecret}`);
//   console.log('====================================================\n');

//   process.env.XALOR_CLI_STUDIO = 'true';

//   const studioEngine = new StudioCLIEngineService(projectRootPath);

//   const server = http.createServer((req, res) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
//     res.setHeader(
//       'Access-Control-Allow-Headers',
//       'Content-Type, Authorization',
//     );

//     if (req.method === 'OPTIONS') {
//       res.writeHead(204);
//       res.end();
//       return;
//     }

//     // 💻 PIPELINE A: SERVE THE IFRAME EMBED TRANSMITTER PROXY SKELETON
//     if (req.url === '/' || req.url === '/index.html') {
//       res.writeHead(200, { 'Content-Type': 'text/html' });
//       res.end(STUDIO_PROXY_BRIDGE_TEMPLATE(studioProductionUrl));
//       return;
//     }

//     // if (req.url === '/api/vault-direct') {
//     //   res.writeHead(200, { 'Content-Type': 'application/json' });

//     //   // Directly invoke your presentation-layer adapter to compile the comprehensive payload object on-demand
//     //   studioEngine
//     //     .compileDashboardOverviewDataset(port)
//     //     .then((payload) => {
//     //       // Stream the rich pre-compiled macro data metrics packet safely down the wire point-free
//     //       res.end(JSON.stringify(payload));
//     //     })
//     //     .catch(() => {
//     //       // Fallback gate returning clean zero-state structures if ingestion or parsing faults drop
//     //       res.end(
//     //         JSON.stringify({ error: 'STUDIO_METRICS_COMPILATION_FAILED' }),
//     //       );
//     //     });
//     //   return;
//     // }
//     if (req.url === '/api/vault-direct') {
//       // Establish long-lived HTTP Event Stream headers
//       res.writeHead(200, {
//         'Content-Type': 'text/event-stream',
//         'Cache-Control': 'no-cache',
//         Connection: 'keep-alive',
//         'Access-Control-Allow-Origin': '*',
//       });

//       // Internal wrapper function to compile and write the SSE formatted string packet
//       const dispatchFreshMetrics = async () => {
//         try {
//           const payload =
//             await studioEngine.compileDashboardOverviewDataset(port);
//           // SSE requirements: Data must be prefixed with 'data: ' and end with a double newline
//           res.write(`data: ${JSON.stringify(payload)}\n\n`);
//         } catch {
//           res.write(
//             `data: ${JSON.stringify({ error: 'STREAM_COMPILATION_FAILED' })}\n\n`,
//           );
//         }
//       };

//       // 1. Initial fire pass to hydrate the browser canvas immediately on boot
//       dispatchFreshMetrics();

//       // 2. FILE HYDRATION WATCH GATEWAY (Commandment VIII Alignment)
//       // Watch the active vault snapshot file safely. The exact millisecond your background
//       // watch daemon writes a change, this watcher triggers a non-blocking push.
//       const fileWatcher = fs.watch(paths.vaultFile, (eventType) => {
//         if (eventType === 'change') {
//           dispatchFreshMetrics();
//         }
//       });

//       // Handle structural cleanup when the frontend tab closes or client disconnects
//       req.on('close', () => {
//         fileWatcher.close();
//         res.end();
//       });
//       return;
//     }
//     res.writeHead(404);
//     res.end('Not Found');
//   });

// server.listen(port, () => {
//   console.log(
//     `🚀 [Xalor CLI] Local Studio broker streaming cleanly on port ${port}`,
//   );

//   // Fetch the matching binary execution tool keyword straight from the dictionary
//   const launchBinary = STUDIO_SERVER_CONNECTION_COMMANDS[process.platform];

//   // 🪐 ZERO-CAST DEFENSIVE LAUNCH SHIELD
//   // If the browser utility is missing or execution platform is headless, bypass exec()
//   // entirely to shield the terminal thread from throwing messy shell runtime exceptions.
//   if (!launchBinary) {
//     /* prettier-ignore */
//     console.log(`\n💡 [Xalor Note]: Automated browser launch is not supported natively on '${process.platform}'.`);
//     /* prettier-ignore */
//     console.log(`🔗 Please manually open your browser navigation tab to: ${connectionUrl}\n`);
//     return;
//   }

//   exec(`${launchBinary} "${connectionUrl}"`, (error) => {
//     if (error) {
//       /* prettier-ignore */
//       console.log(`\n💡 [Xalor Note]: Automated browser launcher failed to execute.`);
//       /* prettier-ignore */
//       console.log(`🔗 Please manually open your browser navigation tab to: ${connectionUrl}\n`);
//     }
//   });
//   });
//
