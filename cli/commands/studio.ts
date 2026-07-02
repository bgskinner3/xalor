// cli/commands/studio.ts
import { resolveXalorPaths } from '../../shared/utils';
import { STUDIO_COMMAND_CONFIG } from '../models';
import { studioEngine } from '../service';
// import { auditEngineService } from '../service';
/**
 * RUN STUDIO COMMAND (Refactored: Immediate Payload Output & Exit)
 *
 * ROLE:
 * Directly compiles the local project dashboard overview metrics payload,
 * flushes a recursive log out to stdout, and terminates instantly.
 */
export async function runStudioCommand(projectRootPath: string): Promise<void> {
  const port = STUDIO_COMMAND_CONFIG.port;
  const paths = resolveXalorPaths(projectRootPath);

  console.log('\n====================================================');
  console.log(
    '🛰️ [Xalor Studio] COMPILED FRESH METRICS PAYLOAD...',
    paths.rootDir,
  );
  console.log('====================================================\n');

  try {
    // Direct linear compilation pass
    const freshPayload =
      await studioEngine.compileDashboardOverviewDataset(port);
    // const freshPayload = await auditEngineService.executeFullAuditRun({
    //   fix: false,
    //   debug: false,
    // });
    // Deep recursive output flush to console
    console.dir(freshPayload, {
      depth: null,
      colors: true,
    });
    // const sizeInMB = measurePayloadSizeMB(freshPayload);
    // console.log(`📦 Compiled Layout Volume: ${sizeInMB} MB`);
    console.log('\n✅ [Xalor Studio] Payload dumped cleanly. Exiting.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ [Xalor Studio] Studio metrics compilation failed.');
    console.error(error);
    process.exit(1);
  }
}
// // cli/commands/studio.ts
// import http from 'http';
// import fs from 'fs';
// import { exec } from 'child_process';
// import { resolveXalorPaths } from '../../shared/utils';
// import {
//   STUDIO_PROXY_BRIDGE_TEMPLATE,
//   STUDIO_COMMAND_CONFIG,
//   STUDIO_SERVER_CONNECTION_COMMANDS,
// } from '../models';
// import { studioEngine } from '../service';
// import { fsContext } from '../../shared';

// /**
//  * RUN STUDIO COMMAND
//  *
//  * ROLE:
//  * Spawns a lightweight local HTTP data broker loop.
//  * Passes an encrypted security signature key to un-throttle your Next.js route protection.
//  */
// export function runStudioCommand(projectRootPath: string): void {
//   const port = STUDIO_COMMAND_CONFIG.port;
//   const paths = resolveXalorPaths(projectRootPath);
//   const connectionUrl = STUDIO_COMMAND_CONFIG.connectionURL(port);
//   const studioBaseUrl = STUDIO_COMMAND_CONFIG.baseURL;
//   const xalorSecuritySecret = STUDIO_COMMAND_CONFIG.xalorSecuritySecret;

//   /* prettier-ignore */
//   const studioProductionUrl = STUDIO_COMMAND_CONFIG.studioProductionUrl(studioBaseUrl, xalorSecuritySecret)

//   console.log('\n====================================================');
//   console.log('🛰️  [Xalor Studio] CONNECTING SECURE MESSAGE PIPELINE...');
//   console.log(`🌐 Local Gateway Entry: ${connectionUrl}`);
//   console.log(`🔒 Active Handshake Key: ${xalorSecuritySecret}`);
//   console.log('====================================================\n');

//   process.env.XALOR_CLI_STUDIO = 'true';

//   const connectedClientSocketsPool = new Set<http.ServerResponse>();

//   // =========================================================================
//   // 🟢 FIXED SINGLETON FILE WATCHER UTILITY (Commandment VIII Alignment)
//   // =========================================================================
//   // Instantiated exactly ONCE on boot. Eliminates the MaxListenersExceeded leak permanently.
//   if (fsContext.fileExists(paths.vaultFile)) {
//     fs.watch(paths.vaultFile, async (eventType) => {
//       if (eventType === 'change' && connectedClientSocketsPool.size > 0) {
//         try {
//           const freshPayload =
//             await studioEngine.compileDashboardOverviewDataset(port);
//           console.dir(freshPayload, {
//             depth: null, // 👈 fully recursive
//             colors: true, // optional, nicer output
//           });
//           const ssePacket = `data: ${JSON.stringify(freshPayload)}\n\n`;

//           // Broadcast the fresh type matrix to all open active frontend channels simultaneously
//           for (const clientResponseSocket of connectedClientSocketsPool) {
//             clientResponseSocket.write(ssePacket);
//           }
//         } catch {
//           // Suppress broad-cast loop drop errors to protect process thread parameters
//         }
//       }
//     });
//   }

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

//     // =========================================================================
//     // 📡 UPGRADED PIPELINE B: INTERNAL COHESIVE READ BACKPLANE
//     // =========================================================================
//     if (req.url === '/api/vault-direct') {
//       res.writeHead(200, { 'Content-Type': 'application/json' });

//       studioEngine
//         .compileDashboardOverviewDataset(port)
//         .then((payload) => {
//           res.end(JSON.stringify(payload));
//         })
//         .catch(() => {
//           res.end(
//             JSON.stringify({ error: 'STUDIO_METRICS_COMPILATION_FAILED' }),
//           );
//         });
//       return;
//     }
//     if (req.url === '/api/vault-stream') {
//       res.writeHead(200, {
//         'Content-Type': 'text/event-stream',
//         'Cache-Control': 'no-cache',
//         Connection: 'keep-alive',
//       });

//       connectedClientSocketsPool.add(res);

//       studioEngine.compileDashboardOverviewDataset(port).then((payload) => {
//         res.write(`data: ${JSON.stringify(payload)}\n\n`);
//       });

//       req.on('close', () => {
//         connectedClientSocketsPool.delete(res);
//         res.end();
//       });
//       return;
//     }
//     res.writeHead(404);
//     res.end('Not Found');
//   });

//   server.listen(port, () => {
//     console.log(
//       `🚀 [Xalor CLI] Local Studio broker streaming cleanly on port ${port}`,
//     );
//     const launchBinary = STUDIO_SERVER_CONNECTION_COMMANDS[process.platform];
//     if (!launchBinary) {
//       /* prettier-ignore */
//       console.log(`\n💡 [Xalor Note]: Automated browser launch is not supported natively on '${process.platform}'.`);
//       /* prettier-ignore */
//       console.log(`🔗 Please manually open your browser navigation tab to: ${connectionUrl}\n`);
//       return;
//     }
//     exec(`${launchBinary} "${connectionUrl}"`, (error) => {
//       if (error) {
//         /* prettier-ignore */
//         console.log(`\n💡 [Xalor Note]: Automated browser launcher failed to execute.`);
//         /* prettier-ignore */
//         console.log(`🔗 Please manually open your browser navigation tab to: ${connectionUrl}\n`);
//       }
//     });
//   });
// }
