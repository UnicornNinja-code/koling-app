/*
 * systemReadinessService.ts
 * REST Client for System Readiness & Foundation Configuration in TypeScript
 */

import { axiosInstance } from '../lib/axios';

export interface ReadinessItem {
  id: string;
  category: 'IDENTITY' | 'OPERATIONAL_BASE' | 'ZONES' | 'DSS' | 'FLEET';
  title: string;
  description: string;
  is_mandatory: boolean;
  status: 'READY' | 'ACTION_REQUIRED';
  current_value?: any;
  route: string;
  action_label: string;
}

export interface SystemReadinessReport {
  overall_status: 'READY' | 'NEEDS_CONFIGURATION';
  readiness_percentage: number;
  mandatory_passed: number;
  mandatory_total: number;
  items: ReadinessItem[];
  hub_config: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    radius_km: number;
  };
  spatial_rules?: {
    protocol_road_prohibited: boolean;
    toll_road_prohibited: boolean;
  };
  schedule_config?: {
    slots: Array<{ code: string; name: string; time_range: string; is_active: boolean }>;
    days: string[];
    hold_duration_minutes: number;
  };
  security_policies?: {
    invitation_token_hours: number;
    jwt_access_token_minutes: number;
    refresh_token_rotation: boolean;
    anti_account_enumeration: boolean;
  };
}

export const systemReadinessService = {
  getReadiness: async (): Promise<SystemReadinessReport> => {
    const res = await axiosInstance.get('/system/readiness');
    return res.data;
  },

  updateSettings: async (data: {
    hub_name?: string;
    hub_address?: string;
    hub_latitude?: number;
    hub_longitude?: number;
    operational_radius_km?: number;
    protocol_road_prohibited?: boolean;
    toll_road_prohibited?: boolean;
  }): Promise<{ msg: string; report: SystemReadinessReport }> => {
    const res = await axiosInstance.put('/system/settings', data);
    return res.data;
  },
};
