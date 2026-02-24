// Cloudflare Pages Worker for NodeJS compatibility
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle static assets and API routes
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/song/')) {
      // Forward to NodeJS server
      const backendUrl = `https://your-backend-url.com${url.pathname}${url.search}`;
      const response = await fetch(backendUrl);
      return response;
    }
    
    // Serve static files
    return env.ASSETS.fetch(request);
  }
};
