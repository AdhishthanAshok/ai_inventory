// Clothing item card with image, status badge, and quick actions
"use client";

import Image from "next/image";
import { logger } from "@/utils/logger";

interface ItemCardProps {
  item: {
    id: string;
    image_url: string;
    category: string;
    color: string | null;
    tags: string[];
    status: string;
  };
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

const statusOptions = ["CLEAN", "WORN", "LAUNDRY"] as const;

export default function ItemCard({ item, onStatusChange, onDelete }: ItemCardProps) {
  const badgeClass = `badge badge-${item.status.toLowerCase()}`;

  return (
    <div className="glass-card animate-fade-in" style={{
      overflow: "hidden",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      cursor: "default",
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
      (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-glow)";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      (e.currentTarget as HTMLElement).style.boxShadow = "none";
    }}
    >
      {/* Image */}
      <div style={{
        position: "relative",
        width: "100%",
        aspectRatio: "1",
        background: "var(--bg-primary)",
        overflow: "hidden",
      }}>
        <Image
          src={item.image_url}
          alt={`${item.category} - ${item.color || ""}`}
          fill
          style={{ objectFit: "contain", padding: "12px" }}
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        <span className={badgeClass} style={{
          position: "absolute",
          top: "10px",
          right: "10px",
        }}>
          {item.status}
        </span>
      </div>

      {/* Info */}
      <div style={{ padding: "16px" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
        }}>
          <span style={{
            fontSize: "0.95rem",
            fontWeight: 600,
            textTransform: "capitalize",
          }}>
            {item.category}
          </span>
          {item.color && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}>
              <div style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: item.color,
                border: "1px solid var(--border-color)",
              }} />
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "capitalize" }}>
                {item.color}
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        {item.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "12px" }}>
            {item.tags.map((tag) => (
              <span key={tag} className="tag-chip">{tag}</span>
            ))}
          </div>
        )}

        {/* Status toggle */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
          {statusOptions.map((s) => (
            <button
              key={s}
              onClick={() => {
                logger.trace(`ItemCard: Status toggle clicked for item ${item.id} -> ${s}`);
                onStatusChange(item.id, s);
              }}
              style={{
                flex: 1,
                padding: "6px 4px",
                border: item.status === s ? "1px solid var(--color-primary)" : "1px solid var(--border-color)",
                borderRadius: "8px",
                background: item.status === s ? "rgba(124, 58, 237, 0.15)" : "transparent",
                color: item.status === s ? "var(--color-primary-light)" : "var(--text-muted)",
                fontSize: "0.7rem",
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.3px",
                transition: "all 0.15s ease",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Delete */}
        <button
          onClick={() => {
            logger.trace(`ItemCard: Delete clicked for item ${item.id}`);
            onDelete(item.id);
          }}
          style={{
            width: "100%",
            padding: "6px",
            background: "transparent",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "8px",
            color: "var(--color-danger)",
            fontSize: "0.8rem",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(239, 68, 68, 0.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
