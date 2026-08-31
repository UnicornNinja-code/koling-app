import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, getRoleLandingPath } from "../../context/AuthContext.jsx";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";
import { Button } from "../../components/common/Button.jsx";

export function NotFoundPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || "GUEST";
  const homePath = user ? getRoleLandingPath(role) : "/login";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-lg text-center space-y-5">
        {/* Icon Header */}
        <div className="w-14 h-14 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-600 mx-auto shadow-xs">
          <FileQuestion className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 uppercase tracking-widest">
            HTTP 404 • NOT FOUND
          </span>
          <h1 className="text-xl md:text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-normal leading-relaxed">
            Halaman yang Anda tuju tidak tersedia atau tautan URL telah dipindahkan.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <Button
            onClick={() => navigate(homePath)}
            variant="primary"
            className="w-full py-2.5 shadow-xs font-bold"
            leftIcon={user ? Home : ArrowLeft}
          >
            {user ? "Kembali ke Dashboard Utama" : "Kembali ke Halaman Login"}
          </Button>
        </div>
      </div>
    </div>
  );
}
