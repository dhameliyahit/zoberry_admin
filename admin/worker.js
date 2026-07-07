const BACKEND_URL = 'http://api.zoberryenterprise.info';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Proxy /api/* requests to backend
    if (url.pathname.startsWith('/api')) {
      const backendUrl = BACKEND_URL + url.pathname + url.search;

      const proxyHeaders = new Headers(request.headers);
      proxyHeaders.delete('host');

      const proxyRequest = new Request(backendUrl, {
        method: request.method,
        headers: proxyHeaders,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      });

      const response = await fetch(proxyRequest);

      const newResponse = new Response(response.body, response);
      newResponse.headers.delete('Access-Control-Allow-Origin');
      newResponse.headers.delete('Access-Control-Allow-Methods');
      newResponse.headers.delete('Access-Control-Allow-Headers');
      newResponse.headers.set('Access-Control-Allow-Origin', '*');
      newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      newResponse.headers.set('Access-Control-Allow-Headers', '*');

      return newResponse;
    }

    // Serve static assets for everything else
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};
