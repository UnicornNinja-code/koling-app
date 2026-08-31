/*
 * fleet.types.ts
 */

export type ArmadaStatus = "AVAILABLE" | "HOLD" | "IN_USE" | "MAINTENANCE" | "INACTIVE";

export interface Armada {
  id: number | string;
  code: string;
  name: string;
  type?: string | null;
  license_plate?: string | null;
  status: ArmadaStatus;
  current_rider_id?: number | string | null;
  current_rider_name?: string | null;
  current_zone_id?: number | string | null;
  battery_level?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  hold_expires_at?: Date | string | null;
  held_by_rider_id?: number | string | null;
  notes?: string | null;
  created_at?: Date | string;
  updated_at?: Date | string;
  [key: string]: any;
}

export interface ArmadaHoldRequest {
  armada_id: number | string;
  rider_id: number | string;
  hold_duration_seconds?: number;
}
