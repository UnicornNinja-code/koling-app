/**
 * Canonical Socket.IO Real-Time Event Names (Backend Phase 6 Parity)
 */
export const SOCKET_EVENTS = {
  // Connection / Lifecycle
  CONNECT: "connect",
  CONNECT_ERROR: "connect_error",
  DISCONNECT: "disconnect",

  // Operational State Events
  RIDER_ASSIGNED: "rider:assigned_notification",
  ARMADA_HELD: "armada:held_broadcast",
  ARMADA_RELEASED: "armada:released_broadcast",
  ARMADA_CLAIMED: "armada:claimed_broadcast",
  SUPERVISOR_RIDER_MOVED: "supervisor:rider_moved",
  GEOFENCE_BREACH: "rider:geofence_warning",
  RIDER_CHECKED_IN: "supervisor:rider_checked_in",
  SALE_RECORDED_MANAGEMENT: "management:sale_recorded",
  SALE_RECORDED_SUPERVISOR: "supervisor:sale_recorded",
  RIDER_CHECKED_OUT: "supervisor:rider_checked_out",

  // Rider LBS Telemetry Outgoing
  RIDER_LOCATION_UPDATE: "rider:location_update",

  // System Announcements
  SYSTEM_ANNOUNCEMENT: "system:announcement",
};

/**
 * Socket.IO Room Constants
 */
export const SOCKET_ROOMS = {
  MANAGEMENT: "management_room",
  SUPERVISOR: "supervisors_room",
  RIDER: (riderId) => `rider_${riderId}_room`,
};
