import { next } from '@vercel/functions';

/**
 * Password gate for the attendance register.
 *
 * Runs as Vercel Routing Middleware (file convention) on the Node.js runtime,
 * so `SITE_PASSWORD` is read on the server and is never included in the
 * client bundle.
 *
 * Required environment variable:
 *   SITE_PASSWORD = <the shared access password>
 */

const COOKIE_NAME = 'srusti_auth';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
const TOKEN_CONTEXT = 'srusti-attendance-auth-v1';
const LOGIN_PATH = '/login.html';

const encoder = new TextEncoder();

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function sha256(value) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
}

/** Constant-time comparison so password checks do not leak timing information. */
function constantTimeEqual(a, b) {
  const length = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < length; i += 1) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

async function passwordsMatch(submitted, expected) {
  const [submittedHash, expectedHash] = await Promise.all([
    sha256(submitted),
    sha256(expected),
  ]);

  let diff = 0;
  for (let i = 0; i < submittedHash.length; i += 1) {
    diff |= submittedHash[i] ^ expectedHash[i];
  }
  return diff === 0;
}

/** HMAC session token derived from the password, so rotation invalidates cookies. */
async function createToken(password) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(TOKEN_CONTEXT)
  );
  return toHex(signature);
}

function readCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function sanitizeNext(value) {
  if (typeof value !== 'string') return '/';
  if (!value.startsWith('/') || value.startsWith('//')) return '/';
  if (value.startsWith(LOGIN_PATH)) return '/';
  return value;
}

function secureCookieSuffix(url) {
  return url.protocol === 'https:' ? '; Secure' : '';
}

function redirect(location, extraHeaders = {}) {
  return new Response(null, {
    status: 303,
    headers: {
      Location: location,
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}

function redirectToLogin(url) {
  const loginUrl = new URL(LOGIN_PATH, url.origin);
  const nextPath = `${url.pathname}${url.search}`;
  if (nextPath && nextPath !== '/' && nextPath !== LOGIN_PATH) {
    loginUrl.searchParams.set('next', nextPath);
  }
  return redirect(`${loginUrl.pathname}${loginUrl.search}`);
}

function serviceUnavailable() {
  return new Response(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Access not configured</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #0f172a; color: #e2e8f0; font-family: system-ui, sans-serif; padding: 24px; }
      .card { max-width: 440px; background: #1e293b; border: 1px solid #334155; border-radius: 20px; padding: 32px; }
      h1 { margin: 0 0 12px; font-size: 20px; }
      p { margin: 0; line-height: 1.6; color: #94a3b8; }
      code { background: #0f172a; padding: 2px 6px; border-radius: 6px; color: #6ee7b7; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Access is not configured</h1>
      <p>The <code>SITE_PASSWORD</code> environment variable is missing. Add it in your Vercel project settings and redeploy.</p>
    </div>
  </body>
</html>`,
    {
      status: 503,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    }
  );
}

async function handleLogin(request, expectedPassword) {
  const formData = await request.formData();
  const submitted = String(formData.get('password') ?? '');
  const nextPath = sanitizeNext(formData.get('next'));

  if (!(await passwordsMatch(submitted, expectedPassword))) {
    const params = new URLSearchParams({ error: '1' });
    if (nextPath !== '/') params.set('next', nextPath);
    return redirect(`${LOGIN_PATH}?${params.toString()}`);
  }

  const token = await createToken(expectedPassword);
  const cookie = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${COOKIE_MAX_AGE_SECONDS}`,
    secureCookieSuffix(new URL(request.url)).replace(/^; /, ''),
  ]
    .filter(Boolean)
    .join('; ');

  return redirect(nextPath, { 'Set-Cookie': cookie });
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const expectedPassword = process.env.SITE_PASSWORD;

  if (url.pathname === '/api/login') {
    if (request.method !== 'POST') return redirect(LOGIN_PATH);
    if (!expectedPassword) return serviceUnavailable();
    return handleLogin(request, expectedPassword);
  }

  if (url.pathname === '/api/logout') {
    const cookie = [
      `${COOKIE_NAME}=`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      'Max-Age=0',
      secureCookieSuffix(url).replace(/^; /, ''),
    ]
      .filter(Boolean)
      .join('; ');
    return redirect(LOGIN_PATH, { 'Set-Cookie': cookie });
  }

  if (url.pathname === LOGIN_PATH) {
    if (expectedPassword) {
      const token = readCookie(request.headers.get('cookie'), COOKIE_NAME);
      if (token) {
        const expectedToken = await createToken(expectedPassword);
        if (constantTimeEqual(token, expectedToken)) return redirect('/');
      }
    }
    return next();
  }

  if (!expectedPassword) return serviceUnavailable();

  const token = readCookie(request.headers.get('cookie'), COOKIE_NAME);
  if (token) {
    const expectedToken = await createToken(expectedPassword);
    if (constantTimeEqual(token, expectedToken)) return next();
  }

  return redirectToLogin(url);
}

export const config = {
  // Protect every route except the login page itself (which is self-contained).
  matcher: ['/((?!login\\.html).*)'],
  runtime: 'nodejs',
};
