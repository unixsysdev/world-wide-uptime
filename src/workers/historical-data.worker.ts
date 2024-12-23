interface Env {
  METRICS_BUCKET: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    const website = url.searchParams.get('website');
    const year = url.searchParams.get('year');
    const month = url.searchParams.get('month');

    if (!website || !year || !month) {
      return new Response('Missing parameters', { status: 400 });
    }

    try {
      const path = `${website}/${year}/${month.padStart(2, '0')}.json`;
      const object = await env.METRICS_BUCKET.get(path);
      
      if (!object) {
        return new Response('Data not found', { status: 404 });
      }

      return new Response(object.body, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (error) {
      return new Response('Error fetching data', { status: 500 });
    }
  }
};