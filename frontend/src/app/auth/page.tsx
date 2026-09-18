// Auth page with login/register toggle + demo auto-login
"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { logger } from "@/utils/logger";

function AuthForm() {
  const { user, login, register, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const autoSubmitDone = useRef(false);

  const isDemo = searchParams.get("demo") === "true";

  useEffect(() => {
    logger.info("AuthPage mounted");
    if (!loading && user) router.replace("/wardrobe");
  }, [user, loading, router]);

  // Auto-fill demo credentials when ?demo=true
  useEffect(() => {
    if (isDemo && !autoSubmitDone.current) {
      logger.info("Demo mode detected — auto-filling credentials");
      setUsername("demo");
      setPassword("Demo@123");
      setIsRegister(false);
      setDemoLoading(true);
    }
  }, [isDemo]);

  // Auto-submit after 1 second delay for demo mode
  const handleDemoSubmit = useCallback(async () => {
    if (!demoLoading || autoSubmitDone.current || loading) return;
    autoSubmitDone.current = true;

    logger.info("Demo mode: auto-submitting login after delay");
    setSubmitting(true);
    try {
      await login("demo", "Demo@123");
      logger.info("Demo login successful");
    } catch (err) {
      logger.error("Demo auto-login failed:", err);
      setError(err instanceof Error ? err.message : "Demo login failed. Please try manually.");
      setDemoLoading(false);
    } finally {
      setSubmitting(false);
    }
  }, [demoLoading, loading, login]);

  useEffect(() => {
    if (demoLoading && !autoSubmitDone.current && !loading) {
      const timer = setTimeout(handleDemoSubmit, 1000);
      return () => clearTimeout(timer);
    }
  }, [demoLoading, loading, handleDemoSubmit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isRegister && password !== confirmPassword) {
      logger.warn("Registration failed: Passwords do not match");
      setError("Passwords do not match");
      return;
    }

    logger.info(`Submitting auth form (isRegister: ${isRegister}, username: ${username})`);
    setSubmitting(true);
    try {
      if (isRegister) {
        await register(username, password);
      } else {
        await login(username, password);
      }
      logger.info(`Auth successful for ${username}`);
    } catch (err) {
      logger.error(`Auth failed for ${username}:`, err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <div className="spinner" style={{ width: "40px", height: "40px" }} />
      </div>
    );
  }

  // Demo auto-login indicator
  if (demoLoading && !error) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "80vh",
        gap: "20px",
      }}>
        <div className="spinner" style={{ width: "40px", height: "40px" }} />
        <p style={{
          color: "var(--text-secondary)",
          fontSize: "1rem",
          fontFamily: "var(--font-mono), monospace",
          letterSpacing: "0.5px",
        }}>
          Logging you into demo...
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "calc(100vh - 72px)",
      padding: "24px",
    }}>
      <div className="glass-card animate-slide-up" style={{
        padding: "40px",
        width: "100%",
        maxWidth: "420px",
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "12px" }}>👔</span>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            {isRegister ? "Create Account" : "Welcome Back"}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "8px" }}>
            {isRegister ? "Start organizing your wardrobe" : "Sign in to your wardrobe"}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
              Username
            </label>
            <input
              className="input-field"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              autoComplete="username"
            />
          </div>

          <div>
            <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
              Password
            </label>
            <input
              className="input-field"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
          </div>

          {isRegister && (
            <div>
              <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                Confirm Password
              </label>
              <input
                className="input-field"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
          )}

          {error && (
            <p style={{ color: "var(--color-danger)", fontSize: "0.85rem", textAlign: "center" }}>{error}</p>
          )}

          <button type="submit" className="btn-primary" disabled={submitting} style={{ marginTop: "8px" }}>
            {submitting ? (
              <><div className="spinner" style={{ width: "18px", height: "18px" }} /> Please wait...</>
            ) : (
              isRegister ? "Create Account" : "Sign In"
            )}
          </button>
        </form>

        <p style={{
          textAlign: "center",
          marginTop: "24px",
          color: "var(--text-secondary)",
          fontSize: "0.9rem",
        }}>
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => { setIsRegister(!isRegister); setError(""); }}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-primary-light)",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {isRegister ? "Sign In" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <div className="spinner" style={{ width: "40px", height: "40px" }} />
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}
