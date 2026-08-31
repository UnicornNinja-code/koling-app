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
   * Executing Overpass QL Query with automatic mirror failover & retry logic
   */
  async fetchOverpassData(query) {
    if (!query || query.trim() === "") {
      throw new Error("Query Overpass QL tidak boleh kosong");
    }

    const params = new URLSearchParams();
    params.append("data", query.trim());

    let lastError = null;

    for (const url of this.mirrors) {
      try {
        console.log(`🌐 [OverpassApiClient] Memanggil API: ${url}...`);
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "User-Agent": this.userAgent,
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Accept": "application/json, */*",
          },
          body: params.toString(),
        });

        if (!response.ok) {
          const text = await response.text();
          console.warn(`⚠️ [OverpassApiClient] (${url}) HTTP ${response.status} ${response.statusText}: ${text.slice(0, 200)}`);
          lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
          continue; // Failover to next mirror
        }

        const data = await response.json();
        return data.elements || [];
      } catch (error) {
        console.error(`💥 [OverpassApiClient] Error mirror (${url}):`, error.message);
        lastError = error;
      }
    }

    throw new Error(`Gagal mengambil data dari seluruh server Overpass API. Detail: ${lastError?.message || 'Unknown error'}`);
  }
}

// Singleton Instance Export
export const overpassApiClient = OverpassApiClient.getInstance();

// Backward Compatibility Wrapper Function
export const fetchOverpassData = (query) => overpassApiClient.fetchOverpassData(query);
