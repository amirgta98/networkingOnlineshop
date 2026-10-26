/**
 * Resolves the accurate public base URL of the frontend application.
 * Handles:
 * 1. Configured domain in environment variables (for production deployments, e.g. https://my-site.ir)
 * 2. Reverse proxies (x-forwarded-host, x-forwarded-proto, Cloudflare, Caddy, Nginx)
 * 3. Localhost / Docker dev servers (safely replacing 0.0.0.0 with localhost so modern browsers can resolve the address)
 */
export function getAppBaseUrl(req: Request): string {
  // 1. Production environment variable takes highest priority if explicitly configured
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.SITE_URL ||
    process.env.APP_URL;

  if (envUrl && envUrl.startsWith("http")) {
    return envUrl.replace(/\/$/, "");
  }

  // 2. Check headers from reverse proxy / client
  const forwardedHost = req.headers.get("x-forwarded-host");
  const hostHeader = forwardedHost || req.headers.get("host");

  let proto = req.headers.get("x-forwarded-proto");
  if (!proto) {
    try {
      proto = new URL(req.url).protocol.replace(":", "");
    } catch {
      proto = "http";
    }
  }

  if (hostHeader) {
    let cleanHost = hostHeader.split(",")[0].trim();

    // CRITICAL: Replace 0.0.0.0 with localhost for browser compatibility
    if (cleanHost.startsWith("0.0.0.0")) {
      cleanHost = cleanHost.replace("0.0.0.0", "localhost");
    }

    const isLocal =
      cleanHost.includes("localhost") ||
      cleanHost.includes("127.0.0.1") ||
      cleanHost.includes("[::1]");

    const finalProto = !isLocal && proto !== "http" ? "https" : proto;

    return `${finalProto}://${cleanHost}`;
  }

  // 3. Fallback from req.url
  try {
    const parsed = new URL(req.url);
    let host = parsed.host;
    if (host.startsWith("0.0.0.0")) {
      host = host.replace("0.0.0.0", "localhost");
    }
    return `${parsed.protocol}//${host}`;
  } catch {
    return "http://localhost:3000";
  }
}
