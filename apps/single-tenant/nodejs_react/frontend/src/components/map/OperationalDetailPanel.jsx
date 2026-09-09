import React from "react";
import {
  X,
  MapPin,
  Navigation,
  Bike,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Coins,
  Sparkles,
  Crosshair,
  TrendingUp,
} from "lucide-react";

/**
 * Compact Operational Detail Panel / Drawer
 * Displays detailed information when a Zone, Rider, or Armada is clicked
 */
export function OperationalDetailPanel({
  selectedItem,
  itemType, // 'rider' | 'zone' | 'armada'
  onClose,
  onCenterMap,
  onClaimZone,
  userRole = "SUPERADMIN",
}) {
  if (!selectedItem) return null;

  return (
    <div className="absolute bottom-3 right-3 z-30 w-80 bg-white border border-[#E5E5E5] rounded-[6px] shadow-lg p-3.5 select-none animate-in fade-in slide-in-from-bottom-2 duration-150">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#E5E5E5]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-[4px] bg-[#F5F5F5] border border-[#E5E5E5] flex items-center justify-center shrink-0">
            {itemType === "rider" && <Navigation className="w-3.5 h-3.5 text-[#2563EB]" />}
            {itemType === "zone" && <MapPin className="w-3.5 h-3.5 text-[#16A34A]" />}
            {itemType === "armada" && <Bike className="w-3.5 h-3.5 text-[#111111]" />}
          </div>
          <div className="min-w-0">
            <h3 className="text-[13px] font-bold text-[#111111] truncate">
              {selectedItem.name || selectedItem.code || `ID: ${selectedItem.id}`}
            </h3>
            <span className="text-[10px] text-[#737373] uppercase tracking-wider font-semibold">
              {itemType.toUpperCase()} DETAILS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onCenterMap && (
            <button
              type="button"
              onClick={onCenterMap}
              title="Center on Map"
              className="p-1 text-[#737373] hover:text-[#111111] rounded-[4px] hover:bg-[#F5F5F5]"
            >
              <Crosshair className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#737373] hover:text-[#111111] rounded-[4px] hover:bg-[#F5F5F5]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* BODY ACCORDING TO ITEM TYPE */}
      {itemType === "rider" && (
        <div className="space-y-2.5 text-[12px]">
          {/* Status & Compliance Pill Matrix */}
          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-[4px] p-2">
              <div className="text-[10px] text-[#737373] uppercase">Duty Status</div>
              <div className="font-semibold text-[#111111] flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    selectedItem.status === "OPERATING"
                      ? "bg-[#16A34A]"
                      : selectedItem.status === "WAITING"
                      ? "bg-[#D97706]"
                      : "bg-[#737373]"
                  }`}
                />
                <span>{selectedItem.status || "STANDBY"}</span>
              </div>
            </div>

            <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-[4px] p-2">
              <div className="text-[10px] text-[#737373] uppercase">Zone Compliance</div>
              <div className="font-semibold text-[#111111] flex items-center gap-1.5 mt-0.5">
                {selectedItem.zone_compliance === "COMPLIANT" ? (
                  <>
                    <ShieldCheck className="w-3 h-3 text-[#16A34A]" />
                    <span className="text-[#16A34A]">COMPLIANT</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3 h-3 text-[#DC2626]" />
                    <span className="text-[#DC2626]">
                      {selectedItem.zone_compliance || "DEVIATED"}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Road Restriction Alert Status */}
          <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-[4px] p-2">
            <div className="text-[10px] text-[#737373] uppercase">Road Restriction Status</div>
            <div className="text-[12px] font-medium text-[#111111] mt-0.5 flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  selectedItem.road_alert ? "bg-[#DC2626]" : "bg-[#16A34A]"
                }`}
              />
              <span>
                {selectedItem.road_alert ? "PROHIBITED ROAD ALERT" : "NO ROAD RESTRICTION ALERT"}
              </span>
            </div>
          </div>

          {/* Assigned Context */}
          <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-[4px] p-2 space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#737373]">Assigned Zone:</span>
              <span className="font-medium text-[#111111]">
                {selectedItem.zone_name || selectedItem.assigned_zone || "None"}
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-[#737373]">Armada Vehicle:</span>
              <span className="font-medium text-[#111111]">
                {selectedItem.armada_code || selectedItem.armada_id || "Unassigned"}
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-[#737373]">Last GPS Telemetry:</span>
              <span className="font-mono text-[#525252]">
                {selectedItem.last_ping || "Live (Real-time)"}
              </span>
            </div>
          </div>
        </div>
      )}

      {itemType === "zone" && (
        <div className="space-y-2.5 text-[12px]">
          {/* Zone Capacity & DSS Rank */}
          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-[4px] p-2">
              <div className="text-[10px] text-[#737373] uppercase">Rider Capacity</div>
              <div className="font-semibold text-[#111111] text-[14px] mt-0.5">
                {selectedItem.assigned_count || 0} / {selectedItem.max_capacity || 4}
              </div>
            </div>

            <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-[4px] p-2">
              <div className="text-[10px] text-[#737373] uppercase">DSS TOPSIS Rank</div>
              <div className="font-semibold text-[#2563EB] text-[14px] mt-0.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>#{selectedItem.topsis_rank || 1}</span>
              </div>
            </div>
          </div>

          {/* POI & Preference Specs */}
          <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-[4px] p-2 space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#737373]">Relative Preference (V_i):</span>
              <span className="font-mono font-semibold text-[#111111]">
                {selectedItem.preference_score !== undefined && selectedItem.preference_score !== null
                  ? Number(selectedItem.preference_score).toFixed(4)
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-[#737373]">Total POIs in Zone:</span>
              <span className="font-medium text-[#111111]">
                {selectedItem.total_poi ?? selectedItem.total_pois ?? "N/A"} locations
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-[#737373]">Status:</span>
              <span className="font-medium text-[#16A34A]">OPERATIONAL READY</span>
            </div>
          </div>

          {/* Rider 5-Min Hold Claim CTA */}
          {userRole === "RIDER" && onClaimZone && (
            <button
              type="button"
              onClick={() => onClaimZone(selectedItem.id)}
              className="w-full h-8 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12px] font-medium rounded-[4px] transition-colors flex items-center justify-center gap-1.5 mt-2"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Claim 5-Min Hold Lock</span>
            </button>
          )}
        </div>
      )}

      {itemType === "armada" && (
        <div className="space-y-2.5 text-[12px]">
          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-[4px] p-2">
              <div className="text-[10px] text-[#737373] uppercase">Vehicle Code</div>
              <div className="font-mono font-bold text-[#111111] text-[13px] mt-0.5">
                {selectedItem.code}
              </div>
            </div>
            <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-[4px] p-2">
              <div className="text-[10px] text-[#737373] uppercase">Status</div>
              <div className="font-semibold text-[#16A34A] text-[12px] mt-0.5">
                {selectedItem.status || "AVAILABLE"}
              </div>
            </div>
          </div>

          <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-[4px] p-2 space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#737373]">Type:</span>
              <span className="font-medium text-[#111111]">
                {selectedItem.type || "MOTOR_LISTRIK"}
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-[#737373]">Battery Level:</span>
              <span className="font-medium text-[#16A34A]">92% Optimal</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
