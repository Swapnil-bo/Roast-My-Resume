import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UploadZone from "./components/UploadZone";
import RoleSelector from "./components/RoleSelector";
import RoastCard from "./components/RoastCard";
import RewriteCard from "./components/RewriteCard";

// ── Constants ────────────────────────────────────────────────────────────────
const PERSONAS = [
  { id: "gordon",    emoji: "👨‍🍳", label: "Gordon Ramsay",     desc: "Screams. Always right."         },
  { id: "hr",        emoji: "😤", label: "Burnt-Out HR",       desc: "Seen 10k resumes. Done."        },
  { id: "silicon",   emoji: "🤙", label: "Silicon Valley Bro", desc: "Where are your GitHub commits?" },
  { id: "professor", emoji: "🎓", label: "Oxford Professor",   desc: "Big words. Small verdict."      },
];

const STEPS = ["upload", "configure", "results"];

// ── Fade variants ────────────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.25 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [step, setStep]               = useState("upload");
  const [file, setFile]               = useState(null);
  const [role, setRole]               = useState("");
  const [industry, setIndustry]       = useState("");
  const [persona, setPersona]         = useState("gordon");
  const [roastText, setRoastText]     = useState("");
  const [rewriteText, setRewriteText] = useState("");
  const [roasting, setRoasting]       = useState(false);
  const [rewriting, setRewriting]     = useState(false);
  const [roastDone, setRoastDone]     = useState(false);
  const [rewriteDone, setRewriteDone] = useState(false);
  const [error, setError]             = useState("");

  const resultsRef = useRef(null);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleFileAccepted = useCallback((acceptedFile) => {
    setFile(acceptedFile);
    setStep("configure");
    setError("");
  }, []);

  const handleReset = useCallback(() => {
    setStep("upload");
    setFile(null);
    setRole("");
    setIndustry("");
    setPersona("gordon");
    setRoastText("");
    setRewriteText("");
    setRoasting(false);
    setRewriting(false);
    setRoastDone(false);
    setRewriteDone(false);
    setError("");
  }, []);

  const streamFromEndpoint = useCallback(async (endpoint, setter, setDone, setLoading) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("role", role);
    formData.append("industry", industry);
    if (endpoint === "/roast") formData.append("persona", persona);

    setter("");
    setDone(false);
    setLoading(true);
    setError("");

    try {
      const res = await fetch(endpoint, { method: "POST", body: formData });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const json = JSON.parse(line.slice(6));
            if (json.error) { setError(json.error); break; }
            if (json.token) setter((prev) => prev + json.token);
            if (json.done)  setDone(true);
          } catch { continue; }
        }
      }
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [file, role, industry, persona]);

  const handleRoast = useCallback(async () => {
    setStep("results");
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    await streamFromEndpoint("/roast", setRoastText, setRoastDone, setRoasting);
  }, [streamFromEndpoint]);

  const handleRewrite = useCallback(() => {
    streamFromEndpoint("/rewrite", setRewriteText, setRewriteDone, setRewriting);
  }, [streamFromEndpoint]);

  const canSubmit = file && role.trim() && industry.trim();

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", paddingBottom: "6rem" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header style={{ borderBottom: "1px solid var(--border)", padding: "1.25rem 0" }}>
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span style={{ fontSize: "1.4rem" }}>🔥</span>
            <span className="text-display text-fire" style={{ fontSize: "1.3rem", letterSpacing: "0.1em" }}>
              ROAST MY RESUME
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-ash text-mono">LOCAL AI</span>
            <span className="badge badge-fire">MISTRAL 7B</span>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {step === "upload" && (
          <motion.section
            key="hero"
            variants={stagger}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ padding: "5rem 0 3rem" }}
          >
            <div className="container text-center">
              <motion.div variants={fadeUp}>
                <h1 className="glow-fire" style={{ lineHeight: 1, marginBottom: "1rem" }}>
                  YOUR RESUME<br />
                  <span className="text-fire">DESERVES THIS</span>
                </h1>
              </motion.div>
              <motion.p variants={fadeUp} style={{ fontSize: "1.1rem", margin: "0 auto 3rem", maxWidth: "50ch" }}>
                Upload your resume. Pick a role. Get destroyed by a local AI — then rebuilt from the ashes.
                No cloud. No API keys. No mercy.
              </motion.p>
              <motion.div variants={fadeUp}>
                <UploadZone onFileAccepted={handleFileAccepted} />
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Configure ──────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {step === "configure" && (
          <motion.section
            key="configure"
            variants={stagger}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ padding: "4rem 0" }}
          >
            <div className="container">

              {/* File confirmed */}
              <motion.div variants={fadeUp} className="card flex items-center justify-between" style={{ marginBottom: "2rem" }}>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: "1.5rem" }}>📄</span>
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--text)" }}>{file?.name}</div>
                    <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                      {(file?.size / 1024).toFixed(0)} KB
                    </div>
                  </div>
                </div>
                <button className="btn btn-ghost" onClick={handleReset} style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}>
                  ✕ Change
                </button>
              </motion.div>

              {/* Role & Industry */}
              <motion.div variants={fadeUp}>
                <RoleSelector
                  role={role}
                  industry={industry}
                  onRoleChange={setRole}
                  onIndustryChange={setIndustry}
                />
              </motion.div>

              {/* Persona picker */}
              <motion.div variants={fadeUp} style={{ marginTop: "2rem" }}>
                <div style={{ marginBottom: "0.75rem", fontWeight: 600, color: "var(--text-2)", fontSize: "0.85rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Choose your executioner
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
                  {PERSONAS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPersona(p.id)}
                      style={{
                        background: persona === p.id ? "rgba(255,69,0,0.12)" : "var(--surface)",
                        border: `1px solid ${persona === p.id ? "var(--fire)" : "var(--border)"}`,
                        borderRadius: "var(--radius-lg)",
                        padding: "1rem",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s ease",
                        boxShadow: persona === p.id ? "var(--glow-fire)" : "none",
                      }}
                    >
                      <div style={{ fontSize: "1.4rem", marginBottom: "0.4rem" }}>{p.emoji}</div>
                      <div style={{ fontWeight: 700, color: persona === p.id ? "var(--fire)" : "var(--text)", fontSize: "0.9rem" }}>
                        {p.label}
                      </div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginTop: "0.2rem" }}>
                        {p.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div variants={fadeUp} style={{ marginTop: "2.5rem", textAlign: "center" }}>
                <button
                  className="btn btn-fire animate-pulse-fire"
                  onClick={handleRoast}
                  disabled={!canSubmit}
                  style={{ fontSize: "1.3rem", padding: "1rem 3rem" }}
                >
                  🔥 ROAST ME
                </button>
                {!canSubmit && (
                  <div className="text-muted" style={{ marginTop: "0.75rem", fontSize: "0.85rem" }}>
                    Fill in role and industry to proceed
                  </div>
                )}
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Results ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {step === "results" && (
          <motion.section
            key="results"
            ref={resultsRef}
            initial="hidden"
            animate="visible"
            variants={stagger}
            style={{ padding: "4rem 0" }}
          >
            <div className="container">

              {/* Error banner */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="card-hot"
                    style={{ marginBottom: "1.5rem", color: "var(--fire)" }}
                  >
                    ⚠️ {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Roast card */}
              <motion.div variants={fadeUp}>
                <RoastCard
                  text={roastText}
                  loading={roasting}
                  done={roastDone}
                  persona={PERSONAS.find((p) => p.id === persona)}
                  role={role}
                  industry={industry}
                />
              </motion.div>

              {/* Rewrite trigger */}
              {roastDone && !error && !rewriteText && !rewriting && (
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  style={{ textAlign: "center", margin: "2.5rem 0" }}
                >
                  <div className="divider" />
                  <p style={{ marginBottom: "1.5rem", fontSize: "1rem" }}>
                    Survived the roast? Let the AI rebuild you.
                  </p>
                  <button className="btn btn-fire" onClick={handleRewrite} style={{ fontSize: "1.1rem" }}>
                    ✨ REWRITE MY RESUME
                  </button>
                </motion.div>
              )}

              {/* Rewrite card */}
              <AnimatePresence>
                {(rewriteText || rewriting) && (
                  <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    style={{ marginTop: "2rem" }}
                  >
                    <RewriteCard
                      text={rewriteText}
                      loading={rewriting}
                      done={rewriteDone}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reset */}
              {roastDone && (
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  style={{ textAlign: "center", marginTop: "3rem" }}
                >
                  <button className="btn btn-ghost" onClick={handleReset}>
                    ↩ Roast another resume
                  </button>
                </motion.div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "1.5rem 0", marginTop: "4rem" }}>
        <div className="container flex items-center justify-between">
          <span className="text-muted" style={{ fontSize: "0.8rem" }}>
            Powered by Mistral 7B · Runs 100% locally · No data leaves your machine
          </span>
          <a
            href="https://github.com/Swapnil-bo/Roast-My-Resume"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ash"
            style={{ fontSize: "0.8rem", textDecoration: "none" }}
          >
            GitHub ↗
          </a>
        </div>
      </footer>
    </div>
  );
}