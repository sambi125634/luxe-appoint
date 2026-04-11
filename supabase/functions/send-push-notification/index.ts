import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PushPayload {
  user_id: string;
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

// Web Push: send using raw Web Push Protocol (VAPID)
async function sendWebPush(
  subscriptionStr: string,
  payload: { title: string; body: string; url?: string; tag?: string },
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<{ success: boolean; expired?: boolean }> {
  try {
    const subscription = JSON.parse(subscriptionStr);
    const endpoint: string = subscription.endpoint;
    const p256dh: string = subscription.keys?.p256dh;
    const auth: string = subscription.keys?.auth;

    if (!endpoint || !p256dh || !auth) {
      console.error("Invalid subscription format");
      return { success: false };
    }

    // For Deno Edge Functions, we use a simplified approach:
    // Send unencrypted push via fetch with VAPID auth
    // In production, consider using a push library
    const payloadStr = JSON.stringify(payload);

    // Create JWT for VAPID
    const vapidToken = await createVapidJWT(endpoint, vapidPublicKey, vapidPrivateKey);

    // Encrypt the payload using Web Push encryption
    const encrypted = await encryptPayload(payloadStr, p256dh, auth);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Encoding": "aes128gcm",
        "Content-Length": String(encrypted.body.byteLength),
        TTL: "86400",
        Authorization: `vapid t=${vapidToken.token}, k=${vapidToken.publicKey}`,
      },
      body: encrypted.body,
    });

    if (response.status === 410 || response.status === 404) {
      return { success: false, expired: true };
    }

    if (!response.ok) {
      const text = await response.text();
      console.error(`Push failed: ${response.status} ${text}`);
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    console.error("sendWebPush error:", err);
    return { success: false };
  }
}

// VAPID JWT creation
async function createVapidJWT(
  endpoint: string,
  publicKey: string,
  privateKey: string
): Promise<{ token: string; publicKey: string }> {
  const audience = new URL(endpoint).origin;

  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 3600,
    sub: "mailto:kontakt@beauty-funnels.com",
  };

  const headerB64 = base64urlEncode(JSON.stringify(header));
  const payloadB64 = base64urlEncode(JSON.stringify(payload));
  const unsigned = `${headerB64}.${payloadB64}`;

  // Import the private key
  const keyData = base64urlDecode(privateKey);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  // Sign
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    new TextEncoder().encode(unsigned)
  );

  // Convert DER to raw r||s format
  const sigBytes = new Uint8Array(signature);
  const rawSig = derToRaw(sigBytes);

  const signatureB64 = base64urlEncodeBuffer(rawSig);
  const token = `${unsigned}.${signatureB64}`;

  return { token, publicKey };
}

// Web Push payload encryption using aes128gcm
async function encryptPayload(
  payloadStr: string,
  p256dhKey: string,
  authSecret: string
): Promise<{ body: Uint8Array }> {
  const payload = new TextEncoder().encode(payloadStr);

  // Decode subscriber keys
  const clientPublicKey = base64urlDecode(p256dhKey);
  const clientAuth = base64urlDecode(authSecret);

  // Generate local ECDH key pair
  const localKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );

  // Import client public key
  const clientKey = await crypto.subtle.importKey(
    "raw",
    clientPublicKey,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  // Derive shared secret
  const sharedSecret = await crypto.subtle.deriveBits(
    { name: "ECDH", public: clientKey },
    localKeyPair.privateKey,
    256
  );

  // Export local public key
  const localPublicKey = await crypto.subtle.exportKey(
    "raw",
    localKeyPair.publicKey
  );
  const localPublicKeyBytes = new Uint8Array(localPublicKey);

  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Derive encryption key using HKDF
  const ikm = await deriveIKM(
    new Uint8Array(sharedSecret),
    clientAuth,
    new Uint8Array(clientPublicKey),
    localPublicKeyBytes
  );

  const prk = await hmacSha256(salt, ikm);
  const contentEncryptionKeyInfo = createInfo("aesgcm", new Uint8Array(clientPublicKey), localPublicKeyBytes);
  const nonceInfo = createInfo("nonce", new Uint8Array(clientPublicKey), localPublicKeyBytes);

  const cek = await hmacSha256(prk, concatBuffers(contentEncryptionKeyInfo, new Uint8Array([1])));
  const nonce = await hmacSha256(prk, concatBuffers(nonceInfo, new Uint8Array([1])));

  // Build the aes128gcm header: salt(16) + rs(4) + idlen(1) + keyid(65)
  const rs = 4096;
  const header = new Uint8Array(16 + 4 + 1 + localPublicKeyBytes.length);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(16, rs, false);
  header[20] = localPublicKeyBytes.length;
  header.set(localPublicKeyBytes, 21);

  // Pad and encrypt payload
  const paddedPayload = new Uint8Array(payload.length + 2);
  paddedPayload.set(payload, 0);
  paddedPayload[payload.length] = 2; // Delimiter
  paddedPayload[payload.length + 1] = 0; // No padding

  const cekKey = await crypto.subtle.importKey(
    "raw",
    cek.slice(0, 16),
    "AES-GCM",
    false,
    ["encrypt"]
  );

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce.slice(0, 12) },
    cekKey,
    paddedPayload
  );

  const body = concatBuffers(header, new Uint8Array(encrypted));
  return { body };
}

// Helper functions
function base64urlEncode(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlEncodeBuffer(buf: Uint8Array): string {
  let binary = "";
  for (const byte of buf) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(str: string): Uint8Array {
  const padded = str + "=".repeat((4 - (str.length % 4)) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function derToRaw(der: Uint8Array): Uint8Array {
  // If it's already 64 bytes, assume raw format
  if (der.length === 64) return der;
  // DER format: 0x30 len 0x02 rlen r 0x02 slen s
  const raw = new Uint8Array(64);
  let offset = 2; // skip 0x30 + total len
  if (der[offset] !== 0x02) return der;
  offset++;
  const rLen = der[offset++];
  const rStart = rLen > 32 ? offset + (rLen - 32) : offset;
  const rPadStart = rLen < 32 ? 32 - rLen : 0;
  raw.set(der.slice(rStart, rStart + Math.min(rLen, 32)), rPadStart);
  offset += rLen;
  if (der[offset] !== 0x02) return der;
  offset++;
  const sLen = der[offset++];
  const sStart = sLen > 32 ? offset + (sLen - 32) : offset;
  const sPadStart = sLen < 32 ? 32 - sLen : 0;
  raw.set(der.slice(sStart, sStart + Math.min(sLen, 32)), 32 + sPadStart);
  return raw;
}

function concatBuffers(...buffers: Uint8Array[]): Uint8Array {
  const totalLength = buffers.reduce((sum, b) => sum + b.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const buf of buffers) {
    result.set(buf, offset);
    offset += buf.length;
  }
  return result;
}

async function hmacSha256(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, data);
  return new Uint8Array(sig);
}

async function deriveIKM(
  sharedSecret: Uint8Array,
  authSecret: Uint8Array,
  clientPublicKey: Uint8Array,
  serverPublicKey: Uint8Array
): Promise<Uint8Array> {
  const prk = await hmacSha256(authSecret, sharedSecret);
  const info = concatBuffers(
    new TextEncoder().encode("WebPush: info\0"),
    clientPublicKey,
    serverPublicKey
  );
  return await hmacSha256(prk, concatBuffers(info, new Uint8Array([1])));
}

function createInfo(
  type: string,
  clientPublicKey: Uint8Array,
  serverPublicKey: Uint8Array
): Uint8Array {
  const typeBytes = new TextEncoder().encode(`Content-Encoding: ${type}\0`);
  const p256dhBytes = new TextEncoder().encode("P-256\0");

  const clientLen = new Uint8Array(2);
  new DataView(clientLen.buffer).setUint16(0, clientPublicKey.length, false);

  const serverLen = new Uint8Array(2);
  new DataView(serverLen.buffer).setUint16(0, serverPublicKey.length, false);

  return concatBuffers(
    typeBytes,
    p256dhBytes,
    clientLen,
    clientPublicKey,
    serverLen,
    serverPublicKey
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { user_id, title, body, url, tag } = (await req.json()) as PushPayload;

    if (!user_id || !title || !body) {
      return new Response(
        JSON.stringify({ error: "user_id, title, body are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: tokens, error: tokensError } = await supabase
      .from("push_tokens")
      .select("id, device_token, platform")
      .eq("user_id", user_id);

    if (tokensError) throw tokensError;

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, message: "No push tokens found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sent = 0;
    const expiredIds: string[] = [];

    for (const token of tokens) {
      if (token.platform === "web") {
        const result = await sendWebPush(
          token.device_token,
          { title, body, url, tag },
          vapidPublicKey,
          vapidPrivateKey
        );
        if (result.success) {
          sent++;
        } else if (result.expired) {
          expiredIds.push(token.id);
        }
      }
      // TODO: FCM for Android, APNs for iOS
    }

    // Clean up expired tokens
    if (expiredIds.length > 0) {
      await supabase.from("push_tokens").delete().in("id", expiredIds);
    }

    return new Response(
      JSON.stringify({ sent, expired_cleaned: expiredIds.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-push-notification error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
