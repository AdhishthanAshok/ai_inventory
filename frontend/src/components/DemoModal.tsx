// Retro-themed demo mode modal for production environment
"use client";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoModal({ isOpen, onClose }: DemoModalProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        animation: "fadeIn 0.2s ease-out",
        padding: "24px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#000",
          border: "1px solid #fff",
          padding: "40px 32px",
          maxWidth: "520px",
          width: "100%",
          fontFamily: "var(--font-mono), monospace",
          animation: "slideUp 0.3s ease-out",
        }}
      >
        {/* Terminal header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "24px",
          paddingBottom: "16px",
          borderBottom: "1px solid #333",
        }}>
          <div style={{ display: "flex", gap: "6px" }}>
            <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ff5f57", display: "inline-block" }} />
            <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#febc2e", display: "inline-block" }} />
            <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#28c840", display: "inline-block" }} />
          </div>
          <span style={{ color: "#666", fontSize: "0.75rem", marginLeft: "8px" }}>
            system_notice.sh
          </span>
        </div>

        {/* ASCII header */}
        <pre style={{
          color: "#00ff41",
          fontSize: "0.7rem",
          lineHeight: 1.3,
          marginBottom: "20px",
          overflow: "hidden",
        }}>
{`╔══════════════════════════════════════╗
║   UPLOAD SERVICE — STATUS: PAUSED   ║
╚══════════════════════════════════════╝`}
        </pre>

        {/* Message */}
        <div style={{ color: "#ccc", fontSize: "0.9rem", lineHeight: 1.7 }}>
          <p style={{ marginBottom: "16px" }}>
            <span style={{ color: "#00ff41" }}>$</span>{" "}
            Item Digitization Paused in Demo.
          </p>
          <p style={{ color: "#888", fontSize: "0.85rem", marginBottom: "20px" }}>
            The background removal engine (<span style={{ color: "#fff" }}>rembg</span>) 
            requires ~1.2GB RAM, exceeding the free-tier serverless limit. 
            Use the pre-loaded wardrobe items below to test the{" "}
            <span style={{ color: "#fff" }}>AI Stylist</span> and{" "}
            <span style={{ color: "#fff" }}>Shopping Evaluator</span>.
          </p>
        </div>

        {/* Dismiss button */}
        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "12px 24px",
            background: "transparent",
            color: "#fff",
            border: "1px solid #fff",
            fontFamily: "var(--font-mono), monospace",
            fontSize: "0.85rem",
            fontWeight: 700,
            letterSpacing: "2px",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#fff";
            e.currentTarget.style.color = "#000";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#fff";
          }}
        >
          Understood
        </button>
      </div>
    </div>
  );
}
