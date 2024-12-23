export class MetricsAggregator {
  private state: DurableObjectState;
  private env: Env;
  private metrics: Map<string, any[]>;
  
  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.metrics = new Map();
  }

  async fetch(request: Request) {
    const url = new URL(request.url);
    const { pathname } = url;

    switch (pathname) {
      case '/collect':
        return this.handleMetricCollection(request);
      case '/query':
        return this.handleMetricQuery(request);
      default:
        return new Response('Not Found', { status: 404 });
    }
  }

  private async handleMetricCollection(request: Request) {
    const metric = await request.json();
    const key = `${metric.target}:${metric.location}`;
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    
    this.metrics.get(key).push(metric);
    await this.state.storage.put(key, this.metrics.get(key));
    await this.archiveOldData(metric.target);
    
    return new Response('OK');
  }

  private async handleMetricQuery(request: Request) {
    const url = new URL(request.url);
    const target = url.searchParams.get('target');
    const location = url.searchParams.get('location');
    
    if (!target || !location) {
      return new Response('Missing parameters', { status: 400 });
    }
    
    const key = `${target}:${location}`;
    const metrics = await this.state.storage.get(key);
    
    return new Response(JSON.stringify(metrics), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async archiveOldData(website: string) {
    const now = new Date();
    const monthData = await this.state.storage.get('currentMonth');
    
    if (!monthData) return;

    if (now.getMonth() !== monthData.month) {
      const path = `${website}/${monthData.year}/${String(monthData.month + 1).padStart(2, '0')}.json`;
      await this.env.METRICS_BUCKET.put(path, JSON.stringify(monthData.metrics));
      await this.state.storage.delete('currentMonth');
      await this.state.storage.put('currentMonth', {
        month: now.getMonth(),
        year: now.getFullYear(),
        metrics: []
      });
    }
  }
}