/**
 * STUDIO PROXY BRIDGE TEMPLATE
 *
 * ROLE:
 * An immutable, mechanical zero-I/O background data pipeline wrapper.
 * Embeds your secure Next.js dashboard inside a localhost iframe boundary container.
 * Constantly pushes local precompiled type snapshot modifications upward via cross-origin postMessage.
 */
export const STUDIO_PROXY_BRIDGE_TEMPLATE = (studioProductionUrl: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Xalor Secure Bridge Proxy</title>
  <style>body, html { margin:0; padding:0; width:100%; height:100%; overflow:hidden; background:#0f172a; }</style>
</head>
<body>
  <!-- Mounts your Next.js website page passing your secure token signature key! -->
  <iframe id="studio-frame" src="${studioProductionUrl}" style="border:none; width:100%; height:100%;"></iframe>
  
  <script>
    function transmitFreshPayload(payload) {
      const targetIframe = document.getElementById('studio-frame');
      
      if (targetIframe && targetIframe.contentWindow) {
        // Pushes data cross-origin natively using the wildcard target
        targetIframe.contentWindow.postMessage({
          type: 'XALOR_VAULT_PAYLOAD',
          payload: payload
        }, '*');
      }
    }

    function syncDataLoop() {
      fetch('/api/vault-direct')
        .then(res => res.json())
        .then(data => transmitFreshPayload(data))
        .catch(() => {});
    }

    setInterval(syncDataLoop, 1200);
  </script>
</body>
</html>
`;

export const STUDIO_COMMAND_CONFIG = {
  port: 8001,
  baseURL: 'https://www.masterofsum.dev/studio',
  xalorSecuritySecret: '0d4f8d5490d5607582d2aeb180a6dec9',
  /* prettier-ignore */ connectionURL: (port: number) => `http://127.0.0.1:${port}`,
  /* prettier-ignore */ studioProductionUrl: (studioBaseUrl: string, secret: string) => `${studioBaseUrl}?token=${secret}`,
} as const;
