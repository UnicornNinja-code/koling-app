/*
 *   Copyright (c) 2026
 *   All rights reserved.
 *   Turnstile.jsx — Cloudflare Turnstile React Component
 *   Conforms to IBM Carbon Design System & First Principles Defense-in-Depth anti-abuse.
 */

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { useTheme } from "../../context/ThemeContext.jsx";

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const SCRIPT_ID = "cf-turnstile-script";

/**
 * Cloudflare Turnstile Anti-Abuse Widget
 */
export const Turnstile = forwardRef(function Turnstile(
  {
    siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA",
    action = "login",
    cData,
    onVerify,
    onExpire,
    onError,
    size = "normal", // 'normal', 'compact', 'invisible'
    className = "",
  },
  ref
) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const themeContext = useTheme();
  const activeTheme = themeContext?.theme === "light" ? "light" : "dark";

  // Expose imperative handle for manual reset
  useImperativeHandle(ref, () => ({
    reset: () => {
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.reset(widgetIdRef.current);
      }
    },
    getResponse: () => {
      if (window.turnstile && widgetIdRef.current !== null) {
        return window.turnstile.getResponse(widgetIdRef.current);
      }
      return null;
    },
  }));

  useEffect(() => {
    let isMounted = true;

    // Helper to render the widget once script is ready
    const renderWidget = () => {
      if (!isMounted || !containerRef.current || !window.turnstile) return;

      // If already rendered, remove first
      if (widgetIdRef.current !== null) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {}
        widgetIdRef.current = null;
      }

      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: activeTheme,
          action: action,
          cData: cData,
          size: size,
          callback: (token) => {
            if (isMounted && onVerify) {
              onVerify(token);
            }
          },
          "expired-callback": () => {
            if (isMounted && onExpire) {
              onExpire();
            }
          },
          "error-callback": (errorCode) => {
            console.warn("[Turnstile] Widget error:", errorCode);
            if (isMounted && onError) {
              onError(errorCode);
            }
          },
        });
        widgetIdRef.current = id;
      } catch (err) {
        console.error("[Turnstile] Render error:", err);
      }
    };

    // Load Turnstile script if not already on page
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.turnstile) {
          window.turnstile.ready(renderWidget);
        }
      };
      document.head.appendChild(script);
    } else if (window.turnstile) {
      window.turnstile.ready(renderWidget);
    }

    return () => {
      isMounted = false;
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {}
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, activeTheme, action, cData, size, onVerify, onExpire, onError]);

  return (
    <div
      className={`min-h-[65px] flex items-center justify-center p-[8px] bg-[var(--cds-layer-01)] border border-[var(--cds-border-subtle)] ${className}`}
    >
      <div ref={containerRef} className="cf-turnstile-container" />
    </div>
  );
});

export default Turnstile;
