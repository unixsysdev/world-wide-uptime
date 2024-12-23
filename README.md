# Cloudflare Website Monitoring

This project implements a global website monitoring system using Cloudflare Workers, Durable Objects, R2, and Pages.

## Architecture

```mermaid
graph TB
    subgraph "Edge Network"
        W1[Worker - Location 1]
        W2[Worker - Location 2]
        W3[Worker - Location 3]
    end

    subgraph "Cloudflare Services"
        D1[(Durable Objects)]
        KV[(KV Store)]
        Q[Queue]
        R2[R2 Storage]
    end

    subgraph "Frontend"
        P[Pages]
        WS[Workers - WebSocket API]
    end

    W1 & W2 & W3 -->|Metrics| Q
    Q -->|Aggregate| D1
    D1 -->|Archive| R2
    D1 -->|Recent Data| KV
    KV <--> WS
    WS <--> P
    
    C[Cron Trigger] -->|Schedule| W1 & W2 & W3
```

### Components
- **Edge Workers**: Monitor websites from multiple global locations
- **Queue**: Buffers and batches incoming metrics
- **Durable Objects**: Aggregates metrics and maintains consistency
- **KV Store**: Stores recent metrics for quick access
- **R2 Storage**: Archives historical data
- **WebSocket API**: Provides real-time updates to frontend
- **Pages**: Hosts the dashboard interface

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure Cloudflare:
   - Create a new Cloudflare Workers project
   - Set up R2 bucket
   - Create KV namespace
   - Configure Queues

3. Update wrangler.toml with your configuration values

4. Deploy:
   ```bash
   npm run deploy
   npm run pages:deploy
   ```
