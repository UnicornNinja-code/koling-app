/*
 * captcha.ts
 * Self-Hosted High-Performance SVG CAPTCHA Generator with HMAC Signature in TypeScript
 * Works 100% offline without external dependencies.
 */

import { createHmac, randomBytes } from "crypto";

const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET || "cozis_captcha_secure_salt_2026_key";
const CAPTCHA_TTL_MS = 5 * 60 * 1000; // 5 minutes

export interface CaptchaChallenge {
  captcha_id: string;
  svg: string;
  expires_at: number;
}

export class CaptchaUtil {
  /**
   * Generate random 5-character alphanumeric text (excluding confusing chars like 0, O, 1, I, l)
   */
  private static generateRandomText(length: number = 5): string {
    const charset = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    let result = "";
    const bytes = randomBytes(length);
    for (let i = 0; i < length; i++) {
      result += charset[bytes[i] % charset.length];
    }
    return result;
  }

  /**
   * Generate distorted SVG image data URL
   */
  private static generateSvg(text: string): string {
    const width = 160;
    const height = 48;
    const colors = ["#FF634A", "#FFA500", "#10B981", "#3B82F6", "#EC4899", "#8B5CF6"];

    let charsSvg = "";
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const x = 20 + i * 26 + (Math.random() * 6 - 3);
      const y = 32 + (Math.random() * 8 - 4);
      const rotate = Math.floor(Math.random() * 30 - 15);
      const color = colors[i % colors.length];
      const fontSize = 24 + Math.floor(Math.random() * 4);

      charsSvg += `
        <text 
          x="${x}" 
          y="${y}" 
          font-family="monospace, Courier, sans-serif" 
          font-size="${fontSize}" 
          font-weight="bold" 
          fill="${color}" 
          transform="rotate(${rotate} ${x} ${y})"
        >${char}</text>
      `;
    }

    // Add noise lines and dots
    let noiseSvg = "";
    for (let i = 0; i < 4; i++) {
      const x1 = Math.floor(Math.random() * width);
      const y1 = Math.floor(Math.random() * height);
      const x2 = Math.floor(Math.random() * width);
      const y2 = Math.floor(Math.random() * height);
      const lineColor = colors[(i + 2) % colors.length];
      noiseSvg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${lineColor}" stroke-width="1.5" stroke-opacity="0.4" />`;
    }

    for (let i = 0; i < 20; i++) {
      const cx = Math.floor(Math.random() * width);
      const cy = Math.floor(Math.random() * height);
      noiseSvg += `<circle cx="${cx}" cy="${cy}" r="1" fill="#71717A" opacity="0.6" />`;
    }

    const rawSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect width="${width}" height="${height}" rx="12" fill="#18181D" stroke="#2C2C36" stroke-width="1"/>
        ${noiseSvg}
        ${charsSvg}
      </svg>
    `.trim();

    return `data:image/svg+xml;utf8,${encodeURIComponent(rawSvg)}`;
  }

  /**
   * Create signed HMAC token
   */
  private static signPayload(text: string, expiresAt: number): string {
    const payload = `${text.toUpperCase()}:${expiresAt}`;
    const hmac = createHmac("sha256", CAPTCHA_SECRET).update(payload).digest("hex");
    return Buffer.from(JSON.stringify({ text: text.toUpperCase(), exp: expiresAt, sig: hmac })).toString("base64url");
  }

  /**
   * Generate a fresh CAPTCHA challenge
   */
  public static generate(): CaptchaChallenge {
    const text = this.generateRandomText(5);
    const expiresAt = Date.now() + CAPTCHA_TTL_MS;
    const captchaId = this.signPayload(text, expiresAt);
    const svg = this.generateSvg(text);

    return {
      captcha_id: captchaId,
      svg,
      expires_at: expiresAt,
    };
  }

  /**
   * Verify provided CAPTCHA answer
   */
  public static verify(captchaId: string, answer: string): boolean {
    if (!captchaId || !answer) return false;

    try {
      const decoded = JSON.parse(Buffer.from(captchaId, "base64url").toString("utf8"));
      const { text, exp, sig } = decoded;

      if (!text || !exp || !sig) return false;

      // Check expiration
      if (Date.now() > exp) {
        return false;
      }

      // Verify HMAC Signature
      const expectedSig = createHmac("sha256", CAPTCHA_SECRET).update(`${text}:${exp}`).digest("hex");
      if (sig !== expectedSig) {
        return false;
      }

      // Check text match (case-insensitive)
      return text.trim().toUpperCase() === answer.trim().toUpperCase();
    } catch {
      return false;
    }
  }
}
