import crypto from 'node:crypto';
import firebaseConfig from '../../firebase-applet-config.json' with { type: 'json' };

const FIREBASE_CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

export interface VerifiedFirebaseToken {
  uid: string;
  email?: string;
  name?: string;
  aud: string;
  iss: string;
  sub: string;
  exp: number;
  iat: number;
  auth_time?: number;
}

interface CachedCerts {
  certs: Record<string, string>;
  expiresAtMs: number;
}

let cachedCerts: CachedCerts | null = null;

function parseMaxAgeMs(cacheControl: string | null): number {
  if (!cacheControl) return 3600 * 1000;
  const match = cacheControl.match(/max-age=(\d+)/i);
  if (!match) return 3600 * 1000;
  const seconds = Math.max(60, Number(match[1]));
  return seconds * 1000;
}

function decodeBase64UrlJson<T>(segment: string): T {
  const json = Buffer.from(segment, 'base64url').toString('utf8');
  return JSON.parse(json) as T;
}

export async function getFirebasePublicCerts(
  forceRefresh = false
): Promise<Record<string, string>> {
  const now = Date.now();
  if (!forceRefresh && cachedCerts && cachedCerts.expiresAtMs > now) {
    return cachedCerts.certs;
  }

  const response = await fetch(FIREBASE_CERTS_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch Firebase public certificates (${response.status}).`);
  }

  const certs = (await response.json()) as Record<string, string>;
  const maxAgeMs = parseMaxAgeMs(response.headers.get('cache-control'));
  cachedCerts = {
    certs,
    expiresAtMs: now + maxAgeMs,
  };
  return certs;
}

export function verifyFirebaseJwtWithCerts(
  token: string,
  projectId: string,
  certs: Record<string, string>,
  nowSeconds = Math.floor(Date.now() / 1000)
): VerifiedFirebaseToken {
  const parts = token.split('.');
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
    throw new Error('Malformed Firebase ID token.');
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  const header = decodeBase64UrlJson<{ alg?: string; kid?: string }>(headerB64);

  if (header.alg !== 'RS256' || typeof header.kid !== 'string' || !header.kid) {
    throw new Error('Unsupported Firebase token algorithm or missing key ID.');
  }

  const certPem = certs[header.kid];
  if (!certPem) {
    throw new Error('MISSING_KID');
  }

  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(`${headerB64}.${payloadB64}`);
  verifier.end();
  const signatureBuf = Buffer.from(signatureB64, 'base64url');
  if (!verifier.verify(certPem, signatureBuf)) {
    throw new Error('Invalid Firebase token signature.');
  }

  const payload = decodeBase64UrlJson<{
    aud?: string;
    iss?: string;
    sub?: string;
    exp?: number;
    iat?: number;
    auth_time?: number;
    email?: string;
    name?: string;
  }>(payloadB64);

  const expectedIssuer = `https://securetoken.google.com/${projectId}`;
  if (payload.aud !== projectId) {
    throw new Error('Firebase token audience mismatch.');
  }
  if (payload.iss !== expectedIssuer) {
    throw new Error('Firebase token issuer mismatch.');
  }
  if (typeof payload.sub !== 'string' || !payload.sub || payload.sub.length > 128) {
    throw new Error('Firebase token missing valid subject.');
  }
  if (typeof payload.exp !== 'number' || payload.exp <= nowSeconds) {
    throw new Error('Firebase token has expired.');
  }
  if (typeof payload.iat !== 'number' || payload.iat > nowSeconds + 60) {
    throw new Error('Firebase token issued-at timestamp is invalid.');
  }
  if (
    typeof payload.auth_time === 'number' &&
    payload.auth_time > nowSeconds + 60
  ) {
    throw new Error('Firebase token auth_time is invalid.');
  }

  return {
    uid: payload.sub,
    email: typeof payload.email === 'string' ? payload.email : undefined,
    name: typeof payload.name === 'string' ? payload.name : undefined,
    aud: payload.aud,
    iss: payload.iss,
    sub: payload.sub,
    exp: payload.exp,
    iat: payload.iat,
    auth_time: payload.auth_time,
  };
}

export const adminAuth = {
  async verifyIdToken(token: string): Promise<VerifiedFirebaseToken> {
    const projectId = firebaseConfig.projectId;
    const certs = await getFirebasePublicCerts(false);
    try {
      return verifyFirebaseJwtWithCerts(token, projectId, certs);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'MISSING_KID') {
        const refreshed = await getFirebasePublicCerts(true);
        return verifyFirebaseJwtWithCerts(token, projectId, refreshed);
      }
      throw err;
    }
  },
};