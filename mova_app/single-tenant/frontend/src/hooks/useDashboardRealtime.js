import { useEffect, useState, useCallback, useRef } from "react";
import { socketManager } from "../sockets/socketManager.js";
import { SOCKET_EVENTS } from "../sockets/socketEvents.js";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * useDashboardRealtime Hook
 * Connects to MOVA Socket.io server and aggregates live LBS telemetry,
 * real-time plotting notifications, geofence breaches, and sales stream.
 */
export function useDashboardRealtime({
  onRiderMoved,
  onRiderAssigned,
  onRiderCheckedIn,
  onRiderCheckedOut,
  onGeofenceBreach,
  onSaleRecorded,
  onArmadaUpdate,
} = {}) {
  const { token, user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [livePositions, setLivePositions] = useState({});
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [salesIncrement, setSalesIncrement] = useState({ transactions: 0, revenue: 0 });

  // Store callbacks in ref to avoid re-subscribing on each render
  const callbacksRef = useRef({
    onRiderMoved,
    onRiderAssigned,
    onRiderCheckedIn,
    onRiderCheckedOut,
    onGeofenceBreach,
    onSaleRecorded,
    onArmadaUpdate,
  });

  useEffect(() => {
    callbacksRef.current = {
      onRiderMoved,
      onRiderAssigned,
      onRiderCheckedIn,
      onRiderCheckedOut,
      onGeofenceBreach,
      onSaleRecorded,
      onArmadaUpdate,
    };
  });

  useEffect(() => {
    if (!token) return;

    const socket = socketManager.connect(token);
    if (!socket) return;

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on(SOCKET_EVENTS.CONNECT, handleConnect);
    socket.on(SOCKET_EVENTS.DISCONNECT, handleDisconnect);
    setIsConnected(socket.connected);

    // 1. Live Rider LBS Movement
    const handleRiderMoved = (payload) => {
      const data = payload?.data || payload;
      if (!data?.rider_id) return;

      setLivePositions((prev) => ({
        ...prev,
        [data.rider_id]: {
          ...prev[data.rider_id],
          latitude: data.latitude,
          longitude: data.longitude,
          speed: data.speed,
          heading: data.heading,
          updated_at: data.updated_at || new Date().toISOString(),
        },
      }));

      if (callbacksRef.current.onRiderMoved) {
        callbacksRef.current.onRiderMoved(data);
      }
    };

    // 2. Rider Plotting & Assignment
    const handleRiderAssigned = (payload) => {
      const data = payload?.data || payload;
      if (callbacksRef.current.onRiderAssigned) {
        callbacksRef.current.onRiderAssigned(data);
      }
    };

    // 3. Rider Check-in
    const handleRiderCheckedIn = (payload) => {
      const data = payload?.data || payload;
      if (data?.rider_id) {
        setLivePositions((prev) => ({
          ...prev,
          [data.rider_id]: {
            ...prev[data.rider_id],
            status: "OPERATING",
            latitude: data.latitude || prev[data.rider_id]?.latitude,
            longitude: data.longitude || prev[data.rider_id]?.longitude,
          },
        }));
      }
      if (callbacksRef.current.onRiderCheckedIn) {
        callbacksRef.current.onRiderCheckedIn(data);
      }
    };

    // 4. Rider Check-out
    const handleRiderCheckedOut = (payload) => {
      const data = payload?.data || payload;
      if (data?.rider_id) {
        setLivePositions((prev) => ({
          ...prev,
          [data.rider_id]: {
            ...prev[data.rider_id],
            status: "COMPLETED",
          },
        }));
      }
      if (callbacksRef.current.onRiderCheckedOut) {
        callbacksRef.current.onRiderCheckedOut(data);
      }
    };

    // 5. Geofence Breach Warning
    const handleGeofenceBreach = (payload) => {
      const data = payload?.data || payload;
      if (data?.rider_id) {
        setLivePositions((prev) => ({
          ...prev,
          [data.rider_id]: {
            ...prev[data.rider_id],
            status: "DEVIATION",
          },
        }));
      }

      setLiveAlerts((prev) => [
        {
          id: `alert-${Date.now()}`,
          category: "GEOFENCE_BREACH",
          severity: "CRITICAL",
          title: `Deviasi: ${data.rider_name || "Rider"}`,
          message: data.message || `Rider keluar dari geofence zona ${data.zone_name || ""}`,
          timestamp: new Date().toISOString(),
        },
        ...prev.slice(0, 9),
      ]);

      if (callbacksRef.current.onGeofenceBreach) {
        callbacksRef.current.onGeofenceBreach(data);
      }
    };

    // 6. Real-Time Sale Recorded
    const handleSaleRecorded = (payload) => {
      const data = payload?.data || payload;
      const amount = parseFloat(data.total_price || data.total_amount || 0);

      setSalesIncrement((prev) => ({
        transactions: prev.transactions + 1,
        revenue: prev.revenue + amount,
      }));

      if (callbacksRef.current.onSaleRecorded) {
        callbacksRef.current.onSaleRecorded(data);
      }
    };

    // 7. Armada Status Broadcast
    const handleArmadaUpdate = (payload) => {
      const data = payload?.data || payload;
      if (callbacksRef.current.onArmadaUpdate) {
        callbacksRef.current.onArmadaUpdate(data);
      }
    };

    // Subscribe to events
    socketManager.on(SOCKET_EVENTS.SUPERVISOR_RIDER_MOVED, handleRiderMoved);
    socketManager.on("supervisor:rider_moved", handleRiderMoved);
    socketManager.on(SOCKET_EVENTS.RIDER_ASSIGNED, handleRiderAssigned);
    socketManager.on("supervisor:rider_assigned", handleRiderAssigned);
    socketManager.on(SOCKET_EVENTS.RIDER_CHECKED_IN, handleRiderCheckedIn);
    socketManager.on("supervisor:rider_checked_in", handleRiderCheckedIn);
    socketManager.on(SOCKET_EVENTS.RIDER_CHECKED_OUT, handleRiderCheckedOut);
    socketManager.on("supervisor:rider_checked_out", handleRiderCheckedOut);
    socketManager.on(SOCKET_EVENTS.GEOFENCE_BREACH, handleGeofenceBreach);
    socketManager.on("rider:geofence_warning", handleGeofenceBreach);
    socketManager.on(SOCKET_EVENTS.SALE_RECORDED_SUPERVISOR, handleSaleRecorded);
    socketManager.on(SOCKET_EVENTS.SALE_RECORDED_MANAGEMENT, handleSaleRecorded);
    socketManager.on(SOCKET_EVENTS.ARMADA_HELD, handleArmadaUpdate);
    socketManager.on(SOCKET_EVENTS.ARMADA_CLAIMED, handleArmadaUpdate);
    socketManager.on(SOCKET_EVENTS.ARMADA_RELEASED, handleArmadaUpdate);

    return () => {
      socket.off(SOCKET_EVENTS.CONNECT, handleConnect);
      socket.off(SOCKET_EVENTS.DISCONNECT, handleDisconnect);
      socketManager.off(SOCKET_EVENTS.SUPERVISOR_RIDER_MOVED, handleRiderMoved);
      socketManager.off("supervisor:rider_moved", handleRiderMoved);
      socketManager.off(SOCKET_EVENTS.RIDER_ASSIGNED, handleRiderAssigned);
      socketManager.off("supervisor:rider_assigned", handleRiderAssigned);
      socketManager.off(SOCKET_EVENTS.RIDER_CHECKED_IN, handleRiderCheckedIn);
      socketManager.off("supervisor:rider_checked_in", handleRiderCheckedIn);
      socketManager.off(SOCKET_EVENTS.RIDER_CHECKED_OUT, handleRiderCheckedOut);
      socketManager.off("supervisor:rider_checked_out", handleRiderCheckedOut);
      socketManager.off(SOCKET_EVENTS.GEOFENCE_BREACH, handleGeofenceBreach);
      socketManager.off("rider:geofence_warning", handleGeofenceBreach);
      socketManager.off(SOCKET_EVENTS.SALE_RECORDED_SUPERVISOR, handleSaleRecorded);
      socketManager.off(SOCKET_EVENTS.SALE_RECORDED_MANAGEMENT, handleSaleRecorded);
      socketManager.off(SOCKET_EVENTS.ARMADA_HELD, handleArmadaUpdate);
      socketManager.off(SOCKET_EVENTS.ARMADA_CLAIMED, handleArmadaUpdate);
      socketManager.off(SOCKET_EVENTS.ARMADA_RELEASED, handleArmadaUpdate);
    };
  }, [token]);

  return {
    isConnected,
    livePositions,
    liveAlerts,
    salesIncrement,
  };
}

export default useDashboardRealtime;
