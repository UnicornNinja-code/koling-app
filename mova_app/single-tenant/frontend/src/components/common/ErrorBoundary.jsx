import React, { Component } from "react";
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Home } from "lucide-react";

/**
 * MOVA ErrorBoundary — Enterprise Resilience Component SSOT
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the app.
 * Supports both 'global' (full-page shell) and 'widget' (card/panel level) modes.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log to console or external monitoring
    console.error(`[ErrorBoundary:${this.props.name || "Global"}]`, error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === "function"
          ? this.props.fallback(this.state.error, this.handleReset)
          : this.props.fallback;
      }

      const isWidget = this.props.mode === "widget";
      const { error, errorInfo, showDetails } = this.state;

      // Widget-level Fallback (For Map Canvas, Telemetry Cards, Charts)
      if (isWidget) {
        return (
          <div className="w-full p-4 rounded-[12px] bg-white dark:bg-[#131822] border border-[#E5E5E5] dark:border-[#263244] shadow-sm text-left">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-[8px] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-[#111111] dark:text-[#F8FAFC] tracking-tight">
                  {this.props.title || "Komponen Gagal Dimuat"}
                </h4>
                <p className="text-[11px] text-[#737373] dark:text-[#94A3B8] mt-0.5 leading-relaxed">
                  {error?.message || "Terjadi kendala saat merender komponen ini."}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    type="button"
                    onClick={this.handleReset}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-[6px] transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Coba Lagi</span>
                  </button>
                  {error && (
                    <button
                      type="button"
                      onClick={this.toggleDetails}
                      className="text-[11px] text-[#737373] dark:text-[#94A3B8] hover:text-[#111111] dark:hover:text-[#F8FAFC] underline transition-colors"
                    >
                      {showDetails ? "Sembunyikan Teknis" : "Detail Teknis"}
                    </button>
                  )}
                </div>
                {showDetails && (
                  <pre className="mt-2 p-2 bg-[#FAFAFA] dark:bg-[#0B0F17] border border-[#E5E5E5] dark:border-[#263244] rounded-[6px] text-[10px] text-red-600 dark:text-red-400 font-mono overflow-x-auto max-h-32">
                    {error?.stack}
                  </pre>
                )}
              </div>
            </div>
          </div>
        );
      }

      // Global Application-level Fallback
      return (
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F17] text-[#111111] dark:text-[#F8FAFC] flex flex-col items-center justify-center p-6 select-none font-sans">
          <div className="w-full max-w-md bg-white dark:bg-[#131822] border border-[#E5E5E5] dark:border-[#263244] rounded-[12px] p-6 shadow-md text-center space-y-4">
            <div className="w-12 h-12 rounded-[12px] bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 flex items-center justify-center text-red-600 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold tracking-tight text-[#111111] dark:text-[#F8FAFC]">
                Terjadi Kendala pada Antarmuka
              </h2>
              <p className="text-xs text-[#737373] dark:text-[#94A3B8] leading-relaxed">
                Aplikasi mendeteksi error pada komponen antarmuka. Anda dapat mencoba memulihkan komponen ini atau kembali ke halaman utama.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-[8px] transition-all cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Pulihkan Komponen</span>
              </button>
              <a
                href="/superadmin/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#262626] dark:text-[#F8FAFC] bg-[#F5F5F5] dark:bg-[#1E293B] hover:bg-[#E5E5E5] dark:hover:bg-[#263244] border border-[#E5E5E5] dark:border-[#263244] rounded-[8px] transition-all cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Ke Dashboard</span>
              </a>
            </div>

            {error && (
              <div className="pt-2 text-left">
                <button
                  type="button"
                  onClick={this.toggleDetails}
                  className="flex items-center justify-between w-full text-[11px] text-[#737373] dark:text-[#94A3B8] hover:text-[#111111] dark:hover:text-[#F8FAFC] py-1 border-t border-[#E5E5E5] dark:border-[#263244] transition-colors"
                >
                  <span>Detail Error Teknis</span>
                  {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                {showDetails && (
                  <pre className="mt-2 p-2.5 bg-[#FAFAFA] dark:bg-[#0B0F17] border border-[#E5E5E5] dark:border-[#263244] rounded-[6px] text-[10px] text-red-600 dark:text-red-400 font-mono overflow-x-auto max-h-40 whitespace-pre-wrap break-all">
                    {error?.toString()}
                    {"\n\n"}
                    {errorInfo?.componentStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
