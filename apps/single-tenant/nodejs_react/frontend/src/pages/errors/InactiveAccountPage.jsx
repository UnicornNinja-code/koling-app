import React from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { UserX, LogOut, HelpCircle } from "lucide-react";
import { Button, StatusBadge, Card, MovaLogo } from "../../components/ui";

export function InactiveAccountPage() {
  const { user, logout } = useAuth();
  const role = user?.role || "GUEST";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 font-sans select-none">
      <div className="mb-6">
        <MovaLogo size="md" className="items-center" />
      </div>

      <Card className="bg-white w-full max-w-md p-6 sm:p-8 rounded-[8px] border border-rose-200 shadow-sm text-center space-y-5">
        <div className="w-12 h-12 bg-rose-50 border border-rose-200 rounded-[8px] flex items-center justify-center text-rose-600 mx-auto shadow-2xs">
          <UserX className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-[4px] border border-rose-200 uppercase tracking-widest">
            STATUS: NONAKTIF
          </span>
          <h1 className="text-xl font-extrabold text-[#111111] tracking-tight">
            Akses Akun Dinonaktifkan
          </h1>
          <p className="text-xs text-[#64748B] font-normal leading-relaxed">
            Akun Anda saat ini tidak memiliki izin aktif untuk mengakses platform operasional MOVA.
          </p>
        </div>

        {user && (
          <div className="p-3 bg-[#F8FAFC] rounded-[6px] border border-[#E2E8F0] text-xs text-left space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[#64748B]">Nama Pengguna:</span>
              <span className="font-bold text-[#111111]">{user.name || user.username}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#64748B]">Peran Akun:</span>
              <StatusBadge variant="neutral" size="sm">{role}</StatusBadge>
            </div>
          </div>
        )}

        <div className="p-3 bg-amber-50 rounded-[6px] border border-amber-200 text-amber-900 text-xs text-left flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Silakan hubungi Super Admin atau Tim Manajemen MOVA untuk aktivasi kembali akun Anda.
          </p>
        </div>

        <div className="pt-2">
          <Button
            onClick={logout}
            variant="danger"
            className="w-full py-2.5 font-bold"
            leftIcon={LogOut}
          >
            Keluar dari Sesi
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default InactiveAccountPage;
