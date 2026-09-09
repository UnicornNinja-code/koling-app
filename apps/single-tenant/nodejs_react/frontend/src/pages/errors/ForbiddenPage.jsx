import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, getRoleLandingPath } from "../../context/AuthContext.jsx";
import { ShieldAlert, ArrowLeft, LogOut, Coffee } from "lucide-react";
import { Button } from "../../components/common/Button.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";

export function ForbiddenPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || "GUEST";
  const homePath = getRoleLandingPath(role);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-lg text-center space-y-5">
        {/* Brand Icon Header */}
        <div className="w-14 h-14 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center text-rose-600 mx-auto shadow-xs">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-mono font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 uppercase tracking-widest">
            HTTP 403 • FORBIDDEN
          </span>
          <h1 className="text-xl md:text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
            Akses Dibatasi
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-normal leading-relaxed">
            Peran akun Anda saat ini tidak memiliki wewenang untuk membuka halaman ini.
          </p>
        </div>

        {user && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Peran Anda:</span>
            <StatusBadge variant="primary" size="sm">
              {role}
            </StatusBadge>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <Button
            onClick={() => navigate(homePath)}
            variant="primary"
            className="w-full py-2.5 shadow-xs font-bold"
            leftIcon={ArrowLeft}
          >
            Kembali ke Area {role === "RIDER" ? "Operasional" : "Dashboard"}
          </Button>

          <Button
            onClick={logout}
            variant="outline"
            className="w-full py-2.5 text-xs text-slate-600"
            leftIcon={LogOut}
          >
            Ganti Akun / Keluar Sesi
          </Button>
        </div>
      </div>
    </div>
  );
}
