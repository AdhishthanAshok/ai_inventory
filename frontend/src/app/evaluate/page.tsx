// Shopping link evaluator page - paste a URL to check against your wardrobe
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { evaluatePurchase } from "@/services/api";
import { logger } from "@/utils/logger";

interface EvalResult {
  product_name: string;
  product_image: string | null;
  versatility_score: number;
  redundancies: string[];
  recommendation: string;
  suggested_pairings: string[];
}

export default function EvaluatePage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<EvalResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    logger.info("EvaluatePage mounted");
    if (!loading && !user) router.replace("/auth");
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !url) return;

    setSubmitting(true);
    setError("");
    setResult(null);

    try {
      logger.info(`Evaluating purchase for URL: ${url}`);
      const data = await evaluatePurchase(token, url);
      logger.info("Purchase evaluation successful", data);
      setResult(data);
    } catch (err) {
      logger.error("Failed to evaluate purchase", err);
      setError(err instanceof Error ? err.message : "Failed to evaluate purchase");
    } finally {
      setSubmitting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return "var(--color-success)";
    if (score >= 4) return "var(--color-warning)";
    return "var(--color-danger)";
  };

  if (loading || !user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <div className="spinner" style={{ width: "40px", height: "40px" }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 24px" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "8px" }}>
        🛒 Shop Check
      </h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
        Paste a shopping link and I&apos;ll tell you if it&apos;s a smart buy based on your wardrobe.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <input
          className="input-field"
          type="url"
          placeholder="Paste product URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn-primary" disabled={submitting || !url} style={{ whiteSpace: "nowrap" }}>
          {submitting ? (
            <><div className="spinner" style={{ width: "18px", height: "18px" }} /> Analyzing...</>
          ) : (
            "Evaluate"
          )}
        </button>
      </form>

      {error && (
        <div className="glass-card" style={{
          padding: "20px",
          borderColor: "rgba(239, 68, 68, 0.3)",
        }}>
          <p style={{ color: "var(--color-danger)" }}>{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="animate-slide-up">
          {/* Product header */}
          <div className="glass-card" style={{
            padding: "24px",
            display: "flex",
            gap: "24px",
            alignItems: "flex-start",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}>
            {result.product_image && (
              <img
                src={result.product_image}
                alt={result.product_name}
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "var(--radius)",
                  background: "var(--bg-primary)",
                }}
              />
            )}
            <div style={{ flex: 1, minWidth: "200px" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "16px" }}>
                {result.product_name}
              </h2>

              {/* Versatility score */}
              <div style={{ marginBottom: "8px" }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    Versatility Score
                  </span>
                  <span style={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: getScoreColor(result.versatility_score),
                  }}>
                    {result.versatility_score}/10
                  </span>
                </div>
                <div className="score-bar">
                  <div
                    className="score-bar-fill"
                    style={{
                      width: `${result.versatility_score * 10}%`,
                      background: `linear-gradient(90deg, ${getScoreColor(result.versatility_score)}, ${getScoreColor(result.versatility_score)}aa)`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="glass-card" style={{ padding: "20px", marginBottom: "12px" }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-primary-light)", marginBottom: "10px" }}>
              📋 Recommendation
            </h3>
            <p style={{ color: "var(--text-primary)", lineHeight: 1.7, fontSize: "0.95rem" }}>
              {result.recommendation}
            </p>
          </div>

          {/* Redundancies */}
          {result.redundancies.length > 0 && (
            <div className="glass-card" style={{ padding: "20px", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-danger)", marginBottom: "10px" }}>
                ⚠️ Similar Items You Own
              </h3>
              <ul style={{ paddingLeft: "20px", color: "var(--text-secondary)", lineHeight: 1.8 }}>
                {result.redundancies.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested pairings */}
          {result.suggested_pairings.length > 0 && (
            <div className="glass-card" style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-success)", marginBottom: "10px" }}>
                ✅ Would Pair Well With
              </h3>
              <ul style={{ paddingLeft: "20px", color: "var(--text-secondary)", lineHeight: 1.8 }}>
                {result.suggested_pairings.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
