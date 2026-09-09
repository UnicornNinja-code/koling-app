import React from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { UserX, LogOut, Mail, HelpCircle } from "lucide-react";
import { Button } from "../../components/common/Button.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";

export function InactiveAccountPage() {
  const { user, logout } = useAuth();
  const role = user?.role || "GUEST";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-6 sm:p-8 rounded-2xl border border-rose-200 shadow-xl text-center space-y-5">
        {/* Deactivated Badge / Icon */}
        <div className="w-16 h-16 bg-rose-50 border-2 border-rose-200 rounded-2xl flex items-center justify-center text-rose-600 mx-auto shadow-xs">
          <UserX className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-mono font-bold text-rose-700 bg-rose-100 px-3 py-1 rounded-full border border-rose-200 uppercase tracking-widest">
            STATUS: NONAKTIF
          </span>
          <h1 className="text-xl md:text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
            Akses Akun Dinonaktifkan
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-normal leading-relaxed">
            Akun Anda saat ini tidak memiliki izin aktif untuk mengakses platform operasional COZIS.
          </p>
        </div>

        {user && (
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Nama Pengguna:</span>
              <span className="font-bold text-slate-900">{user.name || user.username}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Peran Akun:</span>
              <StatusBadge variant="neutral" size="sm">{role}</StatusBadge>
            </div>
          </div>
        )}

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs text-left flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Silakan hubungi Super Admin atau Tim Manajemen COZIS untuk aktivasi kembali akun Anda.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <Button
            onClick={logout}
            variant="danger"
            className="w-full py-2.5 shadow-xs font-bold"
            leftIcon={LogOut}
          >
            Keluar dari Sesi
          </Button>
        </div>
      </div>
    </div>
  );
}
