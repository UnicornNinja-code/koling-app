/*
 * distributionService.ts
 * REST Client for Rider Duty Queue & Operational Plotting in TypeScript
 */

import { axiosInstance } from '../lib/axios';

export interface DutyQueueItem {
  id: string;
  rider_id: string;
  rider_name: string;
  rider_email?: string;
  duty_date: string;
  confirmed_at: string;
  status: 'WAITING' | 'PLOTTED' | 'CANCELLED';
}

export interface ZoneDistributionItem {
  id?: string;
  zone_id?: string;
  name: string;
  max_capacity: number;
  assigned_count: number;
  remaining_capacity: number;
  available_slots?: number;
  is_full?: boolean;
  status?: string;
  topsis_rank?: number;
  topsis_score?: number;
}

export interface AssignmentItem {
  id: string;
  rider_id: string;
  rider_name: string;
  rider_email?: string;
  zone_id: string;
  zone_name: string;
  armada_id?: string;
  armada_code?: string;
  assignment_type: 'AUTO' | 'MANUAL';
  assignment_date: string;
  status: 'ASSIGNED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';
  check_in_time?: string;
  check_out_time?: string;
  created_at: string;
}

export interface ArmadaAvailableItem {
  id: string;
  code: string;
  type: string;
  status: string;
}

export interface DistributionOverview {
  duty_date: string;
  time_slot?: string;
  summary: {
    total_waiting: number;
    total_plotted: number;
    total_capacity: number;
    total_assigned: number;
    available_armadas_count: number;
  };
  duty_queue: DutyQueueItem[];
  zones: ZoneDistributionItem[];
  assignments: AssignmentItem[];
  available_armadas: ArmadaAvailableItem[];
}

export const distributionService = {
  getOverview: async (): Promise<DistributionOverview> => {
    const res = await axiosInstance.get('/distribution/overview');
    return res.data;
  },

  autoDistribute: async (): Promise<{ msg: string; total_assigned: number; details: any[] }> => {
    const res = await axiosInstance.post('/distribution/auto');
    return res.data;
  },

  manualDistribute: async (data: {
    rider_id: string;
    zone_id: string;
    armada_id?: string;
  }): Promise<{ msg: string; assignment: AssignmentItem }> => {
    const res = await axiosInstance.post('/distribution/manual', data);
    return res.data;
  },

  confirmDuty: async (rider_id?: string): Promise<any> => {
    const res = await axiosInstance.post('/distribution/duty-confirm', { rider_id });
    return res.data;
  },
};
