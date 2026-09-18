// AI outfit recommendation page - ask the AI what to wear
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getRecommendation } from "@/services/api";
import { logger } from "@/utils/logger";

interface OutfitItem {
  category: string;
  description: string;
}

interface Recommendation {
  outfit: OutfitItem[];
  explanation: string;
  styling_tips: string | null;
}

export default function RecommendPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [occasion, setOccasion] = useState("");
  const [weather, setWeather] = useState("");
  const [preferences, setPreferences] = useState("");
  const [result, setResult] = useState<Recommendation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    logger.info("RecommendPage mounted");
    if (!loading && !user) router.replace("/auth");
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !occasion) return;

    setSubmitting(true);
    setError("");
    setResult(null);

    try {
      logger.info(`Requesting outfit recommendation for occasion: ${occasion}`);
      const data = await getRecommendation(token, occasion, weather || undefined, preferences || undefined);
      logger.info("Successfully received outfit recommendation", data);
      setResult(data);
    } catch (err) {
      logger.error("Failed to get recommendation", err);
      setError(err instanceof Error ? err.message : "Failed to get recommendation");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <div className="spinner" style={{ width: "40px", height: "40px" }} />
      </div>
    );
  }

  const quickOccasions = [
    "Casual day out",
    "Office / Work",
    "Date night",
    "Wedding guest",
    "Workout / Gym",
    "Beach day",
  ];

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 24px" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "8px" }}>
        🤖 Style AI
      </h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
        Tell me the occasion and I&apos;ll pick the perfect outfit from your wardrobe.
      </p>

      {/* Quick occasion buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
        {quickOccasions.map((occ) => (
          <button
            key={occ}
            onClick={() => setOccasion(occ)}
            className="btn-ghost"
            style={{
              fontSize: "0.85rem",
              padding: "8px 16px",
              borderColor: occasion === occ ? "var(--color-primary)" : undefined,
              color: occasion === occ ? "var(--color-primary-light)" : undefined,
            }}
          >
            {occ}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
            Occasion / Event *
          </label>
          <input
            className="input-field"
            type="text"
            placeholder="e.g., Casual brunch with friends"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            required
          />
        </div>

        <div>
          <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
            Weather (optional)
          </label>
          <input
            className="input-field"
            type="text"
            placeholder="e.g., Hot and sunny, 35°C"
            value={weather}
            onChange={(e) => setWeather(e.target.value)}
          />
        </div>

        <div>
          <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
            Preferences (optional)
          </label>
          <input
            className="input-field"
            type="text"
            placeholder="e.g., Keep it minimal, prefer dark colors"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={submitting || !occasion}>
          {submitting ? (
            <><div className="spinner" style={{ width: "18px", height: "18px" }} /> Thinking...</>
          ) : (
            "✨ Get Outfit Suggestion"
          )}
        </button>
      </form>

      {error && (
        <div className="glass-card" style={{
          marginTop: "24px",
          padding: "20px",
          borderColor: "rgba(239, 68, 68, 0.3)",
        }}>
          <p style={{ color: "var(--color-danger)" }}>{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="animate-slide-up" style={{ marginTop: "32px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "20px" }}>
            Your Outfit
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
            {result.outfit.map((item, i) => (
              <div key={i} className="glass-card" style={{
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}>
                <span style={{
                  background: "rgba(124, 58, 237, 0.15)",
                  color: "var(--color-primary-light)",
                  padding: "6px 12px",
                  borderRadius: "var(--radius)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  textTransform: "capitalize",
                  minWidth: "80px",
                  textAlign: "center",
                }}>
                  {item.category}
                </span>
                <span style={{ color: "var(--text-primary)", fontSize: "0.95rem" }}>
                  {item.description}
                </span>
              </div>
            ))}
          </div>

          {/* Explanation */}
          <div className="glass-card" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-primary-light)", marginBottom: "10px" }}>
              Why this works
            </h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontSize: "0.9rem" }}>
              {result.explanation}
            </p>
          </div>

          {result.styling_tips && (
            <div className="glass-card" style={{ padding: "20px", marginTop: "12px" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-accent)", marginBottom: "10px" }}>
                💡 Styling Tips
              </h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontSize: "0.9rem" }}>
                {result.styling_tips}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
