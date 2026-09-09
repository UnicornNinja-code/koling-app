import React, { useState } from "react";
import { X, Info, MapPin, Layers, Search } from "lucide-react";
import { POI_CATEGORY_GROUPS } from "../../lib/poiTheme.js";

/**
 * Enterprise Map Semantic Legend Panel with Authentic Boxicons POI Symbols
 */
export function MapLegendPanel({ onClose }) {
  const [activeTab, setActiveTab] = useState("poi"); // "poi" | "spatial"
  const [searchQuery, setSearchQuery] = useState("");

  const riderStatuses = [
    { label: "Operating (In Zone)", color: "bg-[#16A34A]", desc: "Rider aktif berjualan di dalam radius geofence" },
    { label: "Waiting / Standby", color: "bg-[#D97706]", desc: "Armada terparkir/berhenti menunggu pesanan" },
    { label: "Deviated / Route Violation", color: "bg-[#DC2626]", desc: "Melanggar buffer jalan protokol/tol (<50m)" },
    { label: "Outside Operational Zone", color: "bg-[#737373]", desc: "Rider berada di luar zona resmi penugasan" },
  ];

  const spatialElements = [
    { label: "Geofence Operasional (Polygon)", symbol: "h-3 w-4 border border-[#2563EB] bg-[#2563EB]/15 rounded-[2px]", desc: "Batas resmi wilayah jualan berizin" },
    { label: "Jalan Protokol Terlarang (Buffer 50m)", symbol: "h-0.5 w-4 bg-[#DC2626] border-t-2 border-dashed border-[#DC2626]", desc: "Zona merah dilarang mangkal & berjualan" },
    { label: "Jalan Tol Bebas Hambatan", symbol: "h-1 w-4 bg-[#7F1D1D] rounded-[1px]", desc: "Akses tertutup berbahaya untuk gerobak" },
    { label: "Zona Rekomendasi DSS Peringkat #1", symbol: "h-3 w-4 border border-[#16A34A] bg-[#16A34A]/25 rounded-[2px]", desc: "Zona optimal berdasar cuaca & crowd" },
    { label: "Armada Aktif (Gerobak/Motor Listrik)", symbol: "w-3 h-3 rounded-full bg-[#111111] border border-white", desc: "Posisi real-time armada di lapangan" },
  ];

  const filteredPoiGroups = POI_CATEGORY_GROUPS.filter((group) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      group.groupName.toLowerCase().includes(q) ||
      group.description.toLowerCase().includes(q) ||
      group.categories.some((c) => c.toLowerCase().includes(q))
    );
  });

  return (
    <div className="absolute top-12 right-3 z-30 w-88 max-h-[calc(100vh-130px)] bg-white border border-[#E5E5E5] rounded-[8px] shadow-xl flex flex-col select-none animate-in fade-in zoom-in-95 duration-100 overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#FAFAFA] border-b border-[#E5E5E5] shrink-0">
        <div className="flex items-center gap-2 text-[13px] font-extrabold text-[#111111] tracking-tight">
          <div className="w-6 h-6 rounded-[4px] bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB]">
            <Info className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="leading-none">Legenda GIS & Simbol Peta</div>
            <div className="text-[10px] text-[#737373] font-medium mt-0.5">Kamus Visual & Klasifikasi Spasial</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-[#737373] hover:text-[#111111] p-1 rounded-[4px] hover:bg-[#EAEAEA] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center bg-[#F5F5F5] p-1 border-b border-[#E5E5E5] shrink-0">
        <button
          onClick={() => setActiveTab("poi")}
          className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-[4px] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "poi"
              ? "bg-white text-[#111111] shadow-2xs border border-[#E5E5E5]"
              : "text-[#737373] hover:text-[#111111]"
          }`}
        >
          <MapPin className="w-3 h-3 text-[#EA580C]" />
          <span>Simbol POI Boxicons ({POI_CATEGORY_GROUPS.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("spatial")}
          className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-[4px] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "spatial"
              ? "bg-white text-[#111111] shadow-2xs border border-[#E5E5E5]"
              : "text-[#737373] hover:text-[#111111]"
          }`}
        >
          <Layers className="w-3 h-3 text-[#2563EB]" />
          <span>Batas & LBS</span>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto p-3 space-y-3 flex-1 custom-scrollbar text-xs">
        {activeTab === "poi" ? (
          <div className="space-y-2.5">
            {/* Search Filter Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#737373]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kategori POI atau tag..."
                className="w-full pl-8 pr-2.5 py-1.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-[6px] text-xs text-[#111111] placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all font-sans"
              />
            </div>

            <div className="flex items-center justify-between px-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">
                Daftar Simbol & Warna Kategori
              </span>
              <span className="text-[10px] font-bold text-[#EA580C] bg-orange-50 px-1.5 py-0.5 rounded-[3px] border border-orange-100">
                {filteredPoiGroups.length} Kategori
              </span>
            </div>

            {/* List of Categories */}
            <div className="space-y-2">
              {filteredPoiGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-start gap-2.5 p-2 rounded-[6px] border border-[#EFEFEF] hover:border-[#D4D4D4] hover:bg-[#FAFAFA] transition-all group bg-white shadow-2xs"
                >
                  {/* Google Maps Style Circular Pin with Boxicons */}
                  <div
                    style={{ backgroundColor: group.color }}
                    className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-white border-2 border-white shadow-xs mt-0.5"
                  >
                    <i className={`bx ${group.boxicon} text-[14px] leading-none`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-extrabold text-[#111111] text-[11px] leading-tight truncate">
                        {group.groupName}
                      </span>
                      {group.timePeak && (
                        <span
                          style={{
                            color: group.color,
                            backgroundColor: group.bgLight,
                            borderColor: group.borderColor,
                          }}
                          className="text-[9px] font-bold px-1.5 py-0.2 rounded-[3px] border shrink-0"
                        >
                          {group.timePeak}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#525252] mt-0.5 leading-snug">
                      {group.description}
                    </p>
                    <div className="text-[9px] text-[#888888] mt-1 font-mono truncate">
                      Tags: {group.categories.slice(0, 3).join(", ")}...
                    </div>
                  </div>
                </div>
              ))}

              {filteredPoiGroups.length === 0 && (
                <div className="p-4 text-center text-xs text-[#737373] bg-[#FAFAFA] rounded-[6px] border border-dashed border-[#E5E5E5]">
                  Tidak ada kategori POI yang cocok dengan "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {/* Rider Status Legend */}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#737373] mb-2">
                Status Telemetry Rider LBS
              </h4>
              <div className="space-y-1.5">
                {riderStatuses.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-[6px] bg-[#FAFAFA] border border-[#F0F0F0] flex items-start gap-2"
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0 mt-0.5`} />
                    <div>
                      <div className="text-[11px] font-bold text-[#111111]">{item.label}</div>
                      <div className="text-[10px] text-[#737373] mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Spatial Geometry Legend */}
            <div className="pt-2 border-t border-[#E5E5E5]">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#737373] mb-2">
                Batas Geometri Spasial
              </h4>
              <div className="space-y-1.5">
                {spatialElements.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-[6px] bg-[#FAFAFA] border border-[#F0F0F0] flex items-start gap-2.5"
                  >
                    <div className="w-5 flex items-center justify-center shrink-0 mt-0.5">
                      <span className={item.symbol} />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-[#111111]">{item.label}</div>
                      <div className="text-[10px] text-[#737373] mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 bg-[#F9F9F9] border-t border-[#E5E5E5] text-[10px] text-[#737373] text-center font-medium shrink-0 flex items-center justify-center gap-1">
        <i className="bx bx-check-shield text-[#16A34A] text-xs" />
        <span>Ikon POI Boxicons terintegrasi dengan EPSG:4326</span>
      </div>
    </div>
  );
}
