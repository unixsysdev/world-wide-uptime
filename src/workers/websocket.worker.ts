export interface Env {
  METRICS_KV: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env) {
    if (request.headers.get('Upgrade') === 'websocket') {
      const [client, server] = Object.values(new WebSocketPair());
      
      server.accept();
      
      const sendUpdates = async () => {
        const latest = await env.METRICS_KV.get('latest_metrics');
        if (latest) {
          server.send(latest);
        }
      };
      
      const intervalId = setInterval(sendUpdates, 5000);
      
      server.addEventListener('close', () => {
        clearInterval(intervalId);
      });
      
      return new Response(null, {
        status: 101,
        webSocket: client
      });
    }
    
    return new Response('Expected WebSocket', { status: 400 });
  }
};