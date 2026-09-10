/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   Overpass API Shared Utility Client with Fallback Mirrors, Custom Headers & Singleton Pattern
 */

export class OverpassApiClient {
  static instance = null;

  constructor() {
    if (OverpassApiClient.instance) {
      return OverpassApiClient.instance;
    }

    this.mirrors = [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
      "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
    ];

    this.userAgent = "MantaKopi-App/1.0 (contact@kopikeliling.com)";
    OverpassApiClient.instance = this;
  }

  static getInstance() {
    if (!OverpassApiClient.instance) {
      OverpassApiClient.instance = new OverpassApiClient();
    }
    return OverpassApiClient.instance;
  }

  /**
   * Helper sleep delay
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Executing Overpass QL Query with exponential backoff & targeted mirror failover
   */
  async fetchOverpassData(query, maxRetriesPerMirror = 2) {
    if (!query || query.trim() === "") {
      throw new Error("Query Overpass QL tidak boleh kosong");
    }

    const params = new URLSearchParams();
    params.append("data", query.trim());

    let lastError = null;

    for (let mirrorIdx = 0; mirrorIdx < this.mirrors.length; mirrorIdx++) {
      const url = this.mirrors[mirrorIdx];

      for (let attempt = 1; attempt <= maxRetriesPerMirror; attempt++) {
        try {
          console.log(`🌐 [OverpassApiClient] Memanggil API: ${url} (Percobaan ${attempt}/${maxRetriesPerMirror})...`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

          const response = await fetch(url, {
            method: "POST",
            headers: {
              "User-Agent": this.userAgent,
              "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
              "Accept": "application/json, */*",
            },
            body: params.toString(),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const isTransient = [429, 500, 502, 503, 504].includes(response.status);
            const text = await response.text();
            console.warn(`⚠️ [OverpassApiClient] (${url}) HTTP ${response.status}: ${text.slice(0, 150)}`);
            lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);

            if (isTransient && attempt < maxRetriesPerMirror) {
              const backoffMs = attempt * 1500;
              console.log(`⏳ [OverpassApiClient] Menunggu backoff ${backoffMs}ms sebelum retry...`);
              await this.sleep(backoffMs);
              continue;
            }
            break; // Move to next mirror on non-retryable or exhausted retries
          }

          const data = await response.json();
          return data.elements || [];
        } catch (error) {
          const isTimeoutOrNetwork = error.name === "AbortError" || error.code === "ECONNRESET" || error.code === "ETIMEDOUT";
          console.error(`💥 [OverpassApiClient] Error (${url}) percobaan ${attempt}:`, error.message);
          lastError = error;

          if (isTimeoutOrNetwork && attempt < maxRetriesPerMirror) {
            const backoffMs = attempt * 1500;
            console.log(`⏳ [OverpassApiClient] Menunggu backoff ${backoffMs}ms akibat network timeout...`);
            await this.sleep(backoffMs);
            continue;
          }
          break; // Move to next mirror
        }
      }
    }

    throw new Error(`Gagal mengambil data dari seluruh server Overpass API. Detail: ${lastError?.message || 'Unknown error'}`);
  }
}

// Singleton Instance Export
export const overpassApiClient = OverpassApiClient.getInstance();

// Backward Compatibility Wrapper Function
export const fetchOverpassData = (query) => overpassApiClient.fetchOverpassData(query);
