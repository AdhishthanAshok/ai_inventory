// Public retro landing page — B&W brutalist showcase for Smart Wardrobe
"use client";

import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="retro-theme" style={{ minHeight: "100vh", marginTop: "-72px", paddingTop: "72px" }}>
      {/* Scanline overlay */}
      <div className="retro-scanlines" />

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "60px 24px 80px" }}>

        {/* ═══════════ HERO SECTION ═══════════ */}
        <section className="retro-fade-in" style={{ textAlign: "center", marginBottom: "80px" }}>
          <div className="retro-label" style={{ marginBottom: "24px" }}>
            Full-Stack AI Project
          </div>

          <h1 style={{
            fontSize: "clamp(1.8rem, 5vw, 3.2rem)",
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: "-1px",
            textTransform: "uppercase",
            marginBottom: "28px",
          }}>
            The Context-Aware<br />
            Digital Wardrobe<br />
            <span className="retro-cursor" style={{ color: "#888" }}>&amp; AI Stylist</span>
          </h1>

          <p style={{
            fontSize: "0.95rem",
            color: "#888",
            maxWidth: "520px",
            margin: "0 auto",
            lineHeight: 1.7,
            letterSpacing: "0.3px",
          }}>
            Digitize your closet. Get outfit recommendations powered by Gemini AI.
            Evaluate purchases before you buy. Zero decision fatigue.
          </p>
        </section>

        <hr className="retro-divider" />

        {/* ═══════════ PROBLEM vs SOLUTION ═══════════ */}
        <section className="retro-fade-in retro-fade-in-delay-1" style={{ marginBottom: "80px" }}>
          <p className="retro-subheading" style={{ marginBottom: "32px" }}>
            The Problem → The Solution
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}>
            {/* Problem */}
            <div className="retro-card">
              <div style={{ fontSize: "0.7rem", color: "#666", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "16px" }}>
                ✕ THE PROBLEM
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "16px" }}>
                Closet Blindness
              </h3>
              <ul style={{ listStyle: "none", padding: 0, color: "#aaa", fontSize: "0.85rem", lineHeight: 2 }}>
                <li>→ &quot;I have nothing to wear&quot; (you have 47 items)</li>
                <li>→ Decision fatigue every morning</li>
                <li>→ Buying duplicates you already own</li>
                <li>→ No system for what&apos;s clean vs. worn</li>
              </ul>
            </div>

            {/* Solution */}
            <div className="retro-card" style={{ borderColor: "#fff" }}>
              <div style={{ fontSize: "0.7rem", color: "#00ff41", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "16px" }}>
                ✓ THE SOLUTION
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "16px" }}>
                Digital Wardrobe + AI
              </h3>
              <ul style={{ listStyle: "none", padding: 0, color: "#aaa", fontSize: "0.85rem", lineHeight: 2 }}>
                <li>→ Photo inventory with auto background removal</li>
                <li>→ AI outfit picks for any occasion &amp; weather</li>
                <li>→ Shopping link evaluator vs. existing wardrobe</li>
                <li>→ Track item status: Clean / Worn / Laundry</li>
              </ul>
            </div>
          </div>
        </section>

        <hr className="retro-divider" />

        {/* ═══════════ SYSTEM ARCHITECTURE ═══════════ */}
        <section className="retro-fade-in retro-fade-in-delay-2" style={{ marginBottom: "40px" }}>
          <p className="retro-subheading" style={{ marginBottom: "32px" }}>
            System Design
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="retro-card" style={{ padding: "8px" }}>
              <div style={{ fontSize: "0.7rem", color: "#666", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px", textAlign: "center" }}>
                High Level Design (HLD)
              </div>
              <Image 
                src="/High Level Design (HLD).png" 
                alt="High Level Design" 
                width={1200} 
                height={675} 
                style={{ width: "100%", height: "auto", borderRadius: "4px" }} 
              />
            </div>

            <div className="retro-card" style={{ padding: "8px" }}>
              <div style={{ fontSize: "0.7rem", color: "#666", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px", textAlign: "center" }}>
                Upload Flow
              </div>
              <Image 
                src="/Low Level Design - Upload Flow.png" 
                alt="Upload Flow" 
                width={1200} 
                height={675} 
                style={{ width: "100%", height: "auto", borderRadius: "4px" }} 
              />
            </div>

            <div className="retro-card" style={{ padding: "8px" }}>
              <div style={{ fontSize: "0.7rem", color: "#666", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px", textAlign: "center" }}>
                Recommendation Flow
              </div>
              <Image 
                src="/Low Level Design - Recommendation Flow.png" 
                alt="Recommendation Flow" 
                width={1200} 
                height={675} 
                style={{ width: "100%", height: "auto", borderRadius: "4px" }} 
              />
            </div>

            <div className="retro-card" style={{ padding: "8px" }}>
              <div style={{ fontSize: "0.7rem", color: "#666", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px", textAlign: "center" }}>
                Shopping Analysis
              </div>
              <Image 
                src="/Low Level Design - Shopping Analysis.png" 
                alt="Shopping Analysis" 
                width={1200} 
                height={675} 
                style={{ width: "100%", height: "auto", borderRadius: "4px" }} 
              />
            </div>
          </div>

          {/* Tech stack chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {[
              "Next.js 16", "React 19", "FastAPI", "PostgreSQL", "Gemini API",
              "Cloudinary", "SQLAlchemy", "JWT", "rembg", "TailwindCSS v4",
            ].map((tech) => (
              <span key={tech} style={{
                padding: "6px 14px",
                border: "1px solid #444",
                fontSize: "0.72rem",
                color: "#888",
                letterSpacing: "0.5px",
              }}>
                {tech}
              </span>
            ))}
          </div>
        </section>

        <hr className="retro-divider" />

        {/* ═══════════ ENGINEERING NOTICE ═══════════ */}
        <section className="retro-fade-in retro-fade-in-delay-3" style={{ marginBottom: "80px" }}>
          <p className="retro-subheading" style={{ marginBottom: "32px" }}>
            Engineering Notice
          </p>

          <div className="retro-terminal">
            <div style={{ color: "#00ff41", fontSize: "0.8rem", marginBottom: "16px" }}>
              $ cat /var/log/deploy_notice.txt
            </div>
            <div style={{ color: "#ccc", fontSize: "0.85rem", lineHeight: 1.8 }}>
              <p style={{ marginBottom: "12px" }}>
                <span style={{ color: "#ff5f57" }}>⚠ UPLOAD_SERVICE=DISABLED</span>
              </p>
              <p style={{ marginBottom: "12px" }}>
                Direct image upload requires <span style={{ color: "#fff" }}>rembg</span> (background
                removal) + <span style={{ color: "#fff" }}>ONNX Runtime</span>, which consume
                ~<span style={{ color: "#fff" }}>1.2 GB RAM</span> at inference.
              </p>
              <p style={{ marginBottom: "12px" }}>
                Free-tier serverless platforms (Render/Railway) cap at{" "}
                <span style={{ color: "#fff" }}>512 MB</span>. The upload route returns{" "}
                <span style={{ color: "#fff" }}>HTTP 501</span> in production.
              </p>
              <p style={{ borderTop: "1px solid #333", paddingTop: "12px", color: "#00ff41" }}>
                ✓ AI Style Check — fully operational on pre-loaded items<br />
                ✓ Shopping Evaluator — fully operational via Gemini API<br />
                ✓ Wardrobe CRUD — browse, filter, toggle item status
              </p>
            </div>
          </div>
        </section>

        <hr className="retro-divider" />

        {/* ═══════════ DEMO ACCESS CTA ═══════════ */}
        <section className="retro-fade-in retro-fade-in-delay-4" style={{ textAlign: "center", marginBottom: "40px" }}>
          <p className="retro-subheading" style={{ marginBottom: "32px" }}>
            Try The Demo
          </p>

          <h2 style={{
            fontSize: "clamp(1.4rem, 3vw, 2rem)",
            fontWeight: 800,
            textTransform: "uppercase",
            marginBottom: "36px",
            letterSpacing: "-0.5px",
          }}>
            See it in action
          </h2>

          {/* Credentials box */}
          <div className="retro-cred-box" style={{
            maxWidth: "360px",
            margin: "0 auto 36px",
            textAlign: "left",
          }}>
            <div style={{ fontSize: "0.7rem", color: "#666", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "16px" }}>
              DEMO CREDENTIALS
            </div>
            <div className="retro-cred-row">
              <span className="label">User:</span>
              <span className="value">demo</span>
            </div>
            <div className="retro-cred-row" style={{ borderTop: "1px solid #222", paddingTop: "12px" }}>
              <span className="label">Pass:</span>
              <span className="value">Demo@123</span>
            </div>
          </div>

          {/* CTA Button */}
          <Link href="/auth?demo=true" className="retro-btn retro-pulse retro-glitch">
            See Demo →
          </Link>

          <p style={{ color: "#555", fontSize: "0.75rem", marginTop: "20px", letterSpacing: "0.5px" }}>
            Auto-login with demo account · No signup required
          </p>
        </section>

        {/* ═══════════ FOOTER ═══════════ */}
        <footer style={{
          borderTop: "1px solid #222",
          paddingTop: "32px",
          marginTop: "40px",
          textAlign: "center",
        }}>
          <p style={{ color: "#444", fontSize: "0.75rem", letterSpacing: "1px" }}>
            BUILT USING · FASTAPI + NEXT.JS + GEMINI AI
          </p>
          <p style={{ color: "#333", fontSize: "0.65rem", marginTop: "8px" }}>
            © {new Date().getFullYear()} · Smart Wardrobe Project
          </p>
        </footer>

      </div>
    </div>
  );
}
