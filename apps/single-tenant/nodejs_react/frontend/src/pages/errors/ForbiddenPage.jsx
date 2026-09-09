import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, getRoleLandingPath } from "../../context/AuthContext.jsx";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import { Button, StatusBadge, Card, MovaLogo } from "../../components/ui";

export function ForbiddenPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || "GUEST";
  const homePath = getRoleLandingPath(role);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 font-sans select-none">
      <div className="mb-6">
        <MovaLogo size="md" className="items-center" />
      </div>

      <Card className="bg-white w-full max-w-md p-6 sm:p-8 rounded-[8px] border border-[#E2E8F0] shadow-sm text-center space-y-5">
        <div className="w-12 h-12 bg-rose-50 border border-rose-200 rounded-[8px] flex items-center justify-center text-rose-600 mx-auto shadow-2xs">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-[4px] border border-rose-200 uppercase tracking-widest">
            HTTP 403 • FORBIDDEN
          </span>
          <h1 className="text-xl font-extrabold text-[#111111] tracking-tight">
            Akses Dibatasi
          </h1>
          <p className="text-xs text-[#64748B] font-normal leading-relaxed">
            Peran akun Anda saat ini tidak memiliki wewenang untuk membuka halaman ini.
          </p>
        </div>

        {user && (
          <div className="p-3 bg-[#F8FAFC] rounded-[6px] border border-[#E2E8F0] flex items-center justify-between text-xs">
            <span className="text-[#64748B] font-medium">Peran Anda:</span>
            <StatusBadge variant="primary" size="sm">
              {role}
            </StatusBadge>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <Button
            onClick={() => navigate(homePath)}
            variant="primary"
            className="w-full py-2.5 font-bold"
            leftIcon={ArrowLeft}
          >
            Kembali ke Area {role === "RIDER" ? "Operasional" : "Dashboard"}
          </Button>

          <Button
            onClick={logout}
            variant="secondary"
            className="w-full py-2.5 text-xs text-[#64748B]"
            leftIcon={LogOut}
          >
            Ganti Akun / Keluar Sesi
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default ForbiddenPage;
