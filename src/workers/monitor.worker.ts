export interface Env {
  PING_QUEUE: Queue;
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const targets = ["example.com", "test.com"];
    
    for (const target of targets) {
      const start = Date.now();
      try {
        const response = await fetch(`https://${target}`, {
          cf: { cacheTtl: 0 }
        });
        const latency = Date.now() - start;
        
        await env.PING_QUEUE.send({
          timestamp: new Date().toISOString(),
          target,
          location: event.colo,
          latency,
          status: response.status
        });
      } catch (error) {
        await env.PING_QUEUE.send({
          timestamp: new Date().toISOString(),
          target,
          location: event.colo,
          error: error.message,
          status: 0
        });
      }
    }
  }
};