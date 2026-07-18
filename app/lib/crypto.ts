// Encryption-at-rest helpers using the Web Crypto API (AES-GCM + PBKDF2).

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export interface Envelope {
  enc: 1;
  iv: string;
  ct: string;
}

function b64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}
function unb64(s: string): Uint8Array {
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
}

export function randomBytes(n: number): Uint8Array {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return a;
}

// Coerce byte arrays to BufferSource across TS lib versions.
function bs(b: Uint8Array): BufferSource {
  return b as unknown as BufferSource;
}

export function cryptoSupported(): boolean {
  return (
    typeof crypto !== "undefined" &&
    !!crypto.subtle &&
    typeof crypto.subtle.deriveKey === "function"
  );
}

export async function deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    bs(encoder.encode(pin)),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: bs(salt), iterations: 150000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
}

export async function encryptWithKey(key: CryptoKey, obj: unknown): Promise<Envelope> {
  const iv = randomBytes(12);
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: bs(iv) },
    key,
    bs(encoder.encode(JSON.stringify(obj))),
  );
  return { enc: 1, iv: b64(iv), ct: b64(ct) };
}

export async function decryptWithKey<T = unknown>(key: CryptoKey, env: Envelope): Promise<T> {
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: bs(unb64(env.iv)) },
    key,
    bs(unb64(env.ct)),
  );
  return JSON.parse(decoder.decode(pt)) as T;
}

export async function exportKeyRaw(key: CryptoKey): Promise<string> {
  return b64(await crypto.subtle.exportKey("raw", key));
}
export async function importKeyRaw(raw: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    bs(unb64(raw)),
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
}

// Type guard for a stored encrypted envelope.
export function isEnvelope(x: unknown): x is Envelope {
  return (
    !!x &&
    typeof x === "object" &&
    (x as { enc?: unknown }).enc === 1 &&
    typeof (x as { ct?: unknown }).ct === "string"
  );
}

export { b64, unb64 };
