import { Sha256 } from "@aws-crypto/sha256-js";
import { parseUrl } from "@smithy/core/protocols";
import { SignatureV4MultiRegion } from "@aws-sdk/signature-v4-multi-region";
import { env } from "../config/env";

const SIGNED_URL_EXPIRES_IN_SECONDS = 15 * 60;
const UNSIGNED_PAYLOAD = "UNSIGNED-PAYLOAD";
const SHA256_HEADER = "X-Amz-Content-Sha256";

const isS3Url = (value: string) => {
  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname.toLowerCase();

    return hostname.includes("s3") || pathname.includes("/s3/");
  } catch {
    return false;
  }
};

const formatSignedUrl = (signedRequest: {
  username?: string;
  password?: string;
  protocol?: string;
  hostname?: string;
  port?: number;
  path?: string;
  query?: Record<string, unknown>;
  fragment?: string;
}) => {
  const { port, query } = signedRequest;
  let { protocol, path, hostname } = signedRequest;

  if (protocol && protocol.slice(-1) !== ":") {
    protocol += ":";
  }
  if (port) {
    hostname += `:${port}`;
  }
  if (path && path.charAt(0) !== "/") {
    path = `/${path}`;
  }

  const queryString = query ? Object.entries(query)
    .flatMap(([key, rawValue]) => {
      if (Array.isArray(rawValue)) return rawValue.map((value) => [key, value]);
      return [[key, rawValue]];
    })
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("&") : "";

  let auth = "";
  if (signedRequest.username != null || signedRequest.password != null) {
    const username = signedRequest.username ?? "";
    const password = signedRequest.password ?? "";
    auth = `${username}:${password}@`;
  }

  let fragment = "";
  if (signedRequest.fragment) {
    fragment = `#${signedRequest.fragment}`;
  }

  return `${protocol}//${auth}${hostname}${path ?? ""}${queryString ? `?${queryString}` : ""}${fragment}`;
};

export const signProductImageUrl = async (value: string): Promise<string> => {
  if (!value || !isS3Url(value)) return value;
  if (!env.S3_REGION || !env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) return value;

  try {
    const parsed = parseUrl(value);
    const signer = new SignatureV4MultiRegion({
      service: "s3",
      region: env.S3_REGION,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      },
      sha256: Sha256,
      uriEscapePath: false,
      applyChecksum: false,
    });

    parsed.headers = {
      ...(parsed.headers ?? {}),
      [SHA256_HEADER]: UNSIGNED_PAYLOAD,
    };

    const currentHostHeader = parsed.headers.host;
    const expectedHostHeader = `${parsed.hostname}${parsed.port != null ? `:${parsed.port}` : ""}`;
    if (!currentHostHeader || (currentHostHeader === parsed.hostname && parsed.port != null)) {
      parsed.headers.host = expectedHostHeader;
    }

    const signedRequest = await signer.presign(
      {
        method: "GET",
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.path,
        query: parsed.query,
        headers: parsed.headers,
      },
      {
        expiresIn: SIGNED_URL_EXPIRES_IN_SECONDS,
      },
    );

    return formatSignedUrl(signedRequest);
  } catch {
    return value;
  }
};

const signImageFields = async (input: unknown): Promise<unknown> => {
  if (Array.isArray(input)) {
    return Promise.all(input.map((item) => signImageFields(item)));
  }

  if (!input || typeof input !== "object") return input;

  const entries = await Promise.all(
    Object.entries(input as Record<string, unknown>).map(async ([key, value]) => {
      if (key === "image" && typeof value === "string") {
        return [key, await signProductImageUrl(value)];
      }

      return [key, await signImageFields(value)];
    }),
  );

  return Object.fromEntries(entries);
};

export const withSignedProductImages = async <T>(value: T): Promise<T> => {
  if (value === null || value === undefined) return value;

  const cloned = JSON.parse(JSON.stringify(value));
  return signImageFields(cloned) as Promise<T>;
};
