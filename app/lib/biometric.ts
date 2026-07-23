// Biometric unlock (Face ID / Touch ID / Windows Hello) via WebAuthn platform authenticator.
import { b64, randomBytes, unb64 } from "./crypto";

const BIO_ID = "debt-manager-pro:bioid";

export function biometricSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.PublicKeyCredential !== "undefined" &&
    !!navigator.credentials
  );
}

export async function platformAuthenticatorAvailable(): Promise<boolean> {
  if (!biometricSupported()) return false;
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export function biometricEnabled(): boolean {
  return typeof localStorage !== "undefined" && !!localStorage.getItem(BIO_ID);
}

// Register a platform credential; returns true on success.
export async function registerBiometric(): Promise<boolean> {
  if (!biometricSupported()) return false;
  try {
    const cred = (await navigator.credentials.create({
      publicKey: {
        challenge: randomBytes(32) as unknown as BufferSource,
        rp: { name: "Debt Manager Pro" },
        user: {
          id: randomBytes(16) as unknown as BufferSource,
          name: "owner",
          displayName: "Owner",
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "preferred",
        },
        timeout: 60000,
        attestation: "none",
      },
    })) as PublicKeyCredential | null;
    if (!cred) return false;
    localStorage.setItem(BIO_ID, b64(cred.rawId));
    return true;
  } catch {
    return false;
  }
}

// Prompt for biometric; returns true if the user verified.
export async function assertBiometric(): Promise<boolean> {
  const id = typeof localStorage !== "undefined" ? localStorage.getItem(BIO_ID) : null;
  if (!id) return false;
  try {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: randomBytes(32) as unknown as BufferSource,
        allowCredentials: [{ type: "public-key", id: unb64(id) as unknown as BufferSource }],
        userVerification: "required",
        timeout: 60000,
      },
    });
    return !!assertion;
  } catch {
    return false;
  }
}

export function disableBiometric() {
  localStorage.removeItem(BIO_ID);
}
