/*
 * riderService.ts
 * REST Client Service for Rider Operations (Session, Armada Claim, Check-In, POS Sales)
 */

import { axiosInstance } from "../lib/axios";

export interface RiderActiveSession {
  has_active_session: boolean;
  session?: {
    id: string;
    session_code: string;
    time_slot: string;
    date: string;
    status: string;
  };
  duty?: {
    id: string;
    status: "QUEUED" | "ASSIGNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
    zone_id?: string;
    zone_name?: string;
    armada_id?: string;
    armada_code?: string;
    checked_in_at?: string;
  };
  armada?: {
    id: string;
    code: string;
    name: string;
    battery_level?: number;
    status: string;
  };
}

export interface HubArmadaItem {
  id: string;
  code: string;
  name: string;
  type: string;
  status: "AVAILABLE" | "HOLD" | "IN_USE" | "MAINTENANCE";
  battery_level: number;
  is_claimable: boolean;
  is_held_by_me?: boolean;
  hold_expires_at?: string;
}

export interface RiderSaleItem {
  product_id: string;
  quantity: number;
  unit_price?: number;
}

export const riderService = {
  // 1. Fetch active operational session & duty
  getActiveSession: async (): Promise<RiderActiveSession> => {
    const res = await axiosInstance.get("/rider/active-session");
    return res.data;
  },

  // 2. Fetch all armadas in Hub with claimable status
  getHubArmadas: async (): Promise<HubArmadaItem[]> => {
    const res = await axiosInstance.get("/rider/hub-armadas");
    return res.data?.armadas || res.data || [];
  },

  // 3. Temporary 5-minute hold on armada
  holdArmada: async (armada_id: string): Promise<any> => {
    const res = await axiosInstance.post("/rider/hold-armada", { armada_id });
    return res.data;
  },

  // 4. Cancel hold
  cancelHoldArmada: async (armada_id: string): Promise<any> => {
    const res = await axiosInstance.post("/rider/cancel-hold-armada", { armada_id });
    return res.data;
  },

  // 5. Confirm permanent claim after physical checklist
  claimArmada: async (armada_id: string, checklist: Record<string, boolean>): Promise<any> => {
    const res = await axiosInstance.post("/rider/claim-armada", { armada_id, checklist });
    return res.data;
  },

  // 6. GPS check-in to assigned zone
  checkInZone: async (latitude: number, longitude: number): Promise<any> => {
    const res = await axiosInstance.post("/rider/check-in", { latitude, longitude });
    return res.data;
  },

  // 7. Record daily product sale
  recordSale: async (items: RiderSaleItem[], payment_method: "CASH" | "QRIS"): Promise<any> => {
    const res = await axiosInstance.post("/rider/record-sale", { items, payment_method });
    return res.data;
  },

  // 8. Fetch personal sales history
  getMySales: async (): Promise<any> => {
    const res = await axiosInstance.get("/rider/my-sales");
    return res.data;
  },

  // 9. Checkout shift session and return armada
  checkoutSession: async (): Promise<any> => {
    const res = await axiosInstance.post("/rider/checkout");
    return res.data;
  },
};
