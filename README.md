# Cloudflare Website Monitoring

This project implements a global website monitoring system using Cloudflare Workers, Durable Objects, R2, and Pages.

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
