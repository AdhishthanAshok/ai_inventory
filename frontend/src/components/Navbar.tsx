// Top navigation bar with links and auth state
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { logger } from "@/utils/logger";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (loading) return null;

  const links = [
    { href: "/wardrobe", label: "Wardrobe" },
    { href: "/recommend", label: "Style AI" },
    { href: "/evaluate", label: "Shop Check" },
  ];

  return (
    <nav style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      height: "72px",
      background: "rgba(15, 15, 26, 0.85)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border-color)",
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
    }}>
      <Link href={user ? "/wardrobe" : "/"} style={{
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}>
        <span style={{ fontSize: "1.5rem" }}>👔</span>
        <span style={{
          fontSize: "1.15rem",
          fontWeight: 700,
          background: "linear-gradient(135deg, var(--color-primary-light), var(--color-primary))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          SmartWardrobe
        </span>
      </Link>

      {user && (
        <>
          {/* Desktop links */}
          {!isMobile && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    textDecoration: "none",
                    padding: "8px 16px",
                    borderRadius: "var(--radius)",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    color: pathname === link.href ? "var(--color-primary-light)" : "var(--text-secondary)",
                    background: pathname === link.href ? "rgba(124, 58, 237, 0.1)" : "transparent",
                    transition: "all 0.2s ease",
                  }}
                >
                  {link.label}
                </Link>
              ))}
              <div style={{
                width: "1px",
                height: "24px",
                background: "var(--border-color)",
                margin: "0 8px",
              }} />
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                {user.username}
              </span>
              <button onClick={() => {
                logger.info("Navbar: User clicked logout");
                logout();
              }} className="btn-ghost" style={{
                padding: "6px 14px",
                fontSize: "0.85rem",
              }}>
                Logout
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          {isMobile && (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-primary)",
                fontSize: "1.5rem",
                cursor: "pointer",
                padding: "4px",
              }}
            >
              {mobileOpen ? "✕" : "☰"}
            </button>
          )}

          {/* Mobile menu */}
          {isMobile && mobileOpen && (
            <div style={{
              position: "absolute",
              top: "72px",
              left: 0,
              right: 0,
              background: "var(--bg-secondary)",
              borderBottom: "1px solid var(--border-color)",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              animation: "fadeIn 0.2s ease-out",
            }}>
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    textDecoration: "none",
                    padding: "12px 16px",
                    borderRadius: "var(--radius)",
                    color: pathname === link.href ? "var(--color-primary-light)" : "var(--text-secondary)",
                    background: pathname === link.href ? "rgba(124, 58, 237, 0.1)" : "transparent",
                  }}
                >
                  {link.label}
                </Link>
              ))}
              <button onClick={() => { 
                logger.info("Navbar (mobile): User clicked logout");
                logout(); 
                setMobileOpen(false); 
              }} className="btn-ghost" style={{
                marginTop: "8px",
              }}>
                Logout
              </button>
            </div>
          )}
        </>
      )}
    </nav>
  );
}
