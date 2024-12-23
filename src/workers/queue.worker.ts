export interface Env {
  METRICS: DurableObjectNamespace;
}

export default {
  async queue(batch: MessageBatch<any>, env: Env) {
    // Group metrics by target website
    const metricsByTarget = new Map<string, any[]>();
    
    for (const message of batch.messages) {
      const metric = message.body;
      if (!metricsByTarget.has(metric.target)) {
        metricsByTarget.set(metric.target, []);
      }
      metricsByTarget.get(metric.target).push(metric);
    }
    
    // Process each target's metrics through its Durable Object
    for (const [target, metrics] of metricsByTarget) {
      // Create a stable ID for the target's metrics aggregator
      const id = env.METRICS.idFromName(target);
      const obj = env.METRICS.get(id);
      
      // Send metrics to the Durable Object
      await obj.fetch('http://internal/collect', {
        method: 'POST',
        body: JSON.stringify(metrics)
      });
    }
  }
};