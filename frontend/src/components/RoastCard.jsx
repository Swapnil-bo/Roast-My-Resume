import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Parser ────────────────────────────────────────────────────────────────────
function parseRoast(text) {
  if (!text) return null;

  const extract = (label) => {
    const regex = new RegExp(`${label}:?\\s*([\\s\\S]*?)(?=\\n[A-Z ]+:|$)`, "i");
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  };

  const extractList = (label) => {
    const block = extract(label);
    if (!block) return [];
    return block
      .split("\n")
      .map((l) => l.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean);
  };

  return {
    verdict:     extract("VERDICT"),
    problems:    extractList("PROBLEMS"),
    notTerrible: extractList("NOT TERRIBLE"),
    survivalTip: extract("SURVIVAL TIP"),
  };
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "0.5rem 0" }}>
      {[100, 80, 90, 60, 85, 70].map((w, i) => (
        <motion.div
          key={i}
          style={{
            height: "14px",
            width: `${w}%`,
            background: "var(--surface-2)",
            borderRadius: "4px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, transparent, rgba(255,69,0,0.15), transparent)",
            }}
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear", delay: i * 0.1 }}
          />
        </motion.div>
      ))}
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────
function Section({ emoji, label, color, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      style={{
        background: "var(--bg-2)",
        border: `1px solid var(--border)`,
        borderLeft: `3px solid ${color}`,
        borderRadius: "var(--radius)",
        padding: "1rem 1.25rem",
      }}
    >
      <div style={{
        fontSize: "0.72rem",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: color,
        marginBottom: "0.6rem",
        fontFamily: "var(--font-mono)",
      }}>
        {emoji} {label}
      </div>
      {children}
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function RoastCard({ text, loading, done, persona, role, industry }) {
  const [copied, setCopied] = useState(false);
  const parsed = useMemo(() => (done ? parseRoast(text) : null), [text, done]);
  const showRaw = done && !parsed?.verdict;

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Silent fail — clipboard blocked by browser
    });
  };

  return (
    <div className="card-hot" style={{ position: "relative" }}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between" style={{ marginBottom: "1.5rem" }}>
        <div className="flex items-center gap-1">
          <span style={{ fontSize: "1.3rem" }}>{persona?.emoji ?? "🔥"}</span>
          <div>
            <div className="text-display text-fire" style={{ fontSize: "1.1rem", letterSpacing: "0.06em" }}>
              {persona?.label ?? "AI ROAST"}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>
              {role} · {industry}
            </div>
          </div>
        </div>

        {done && (
          <button
            className="btn btn-ghost"
            onClick={handleCopy}
            style={{ padding: "0.35rem 0.85rem", fontSize: "0.8rem" }}
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        )}
      </div>

      {/* ── Loading state ─────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {loading && !text && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div style={{ marginBottom: "1rem", fontSize: "0.82rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {persona?.label ?? "AI"} is reading your resume...
              </motion.span>
            </div>
            <Skeleton />
          </motion.div>
        )}

        {/* ── Streaming raw text ────────────────────────────────────────── */}
        {loading && text && !done && (
          <motion.div
            key="streaming"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.88rem",
              lineHeight: 1.8,
              color: "var(--text-2)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {text}
            <span className="streaming-cursor" />
          </motion.div>
        )}

        {/* ── Parsed structured result ──────────────────────────────────── */}
        {done && parsed?.verdict && (
          <motion.div
            key="parsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}
          >
            {/* Verdict */}
            <Section emoji="💀" label="Verdict" color="var(--fire)" delay={0}>
              <p style={{ color: "var(--text)", fontWeight: 500, fontSize: "1rem", maxWidth: "none" }}>
                {parsed.verdict}
              </p>
            </Section>

            {/* Problems */}
            {parsed.problems.length > 0 && (
              <Section emoji="🔥" label="Brutal Problems" color="var(--ember)" delay={0.08}>
                <ol style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {parsed.problems.map((p, i) => (
                    <li key={i} style={{ color: "var(--text-2)", fontSize: "0.92rem", lineHeight: 1.6 }}>
                      {p}
                    </li>
                  ))}
                </ol>
              </Section>
            )}

            {/* Not Terrible */}
            {parsed.notTerrible.length > 0 && (
              <Section emoji="🌱" label="Not Totally Embarrassing" color="var(--gold)" delay={0.16}>
                <ol style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {parsed.notTerrible.map((p, i) => (
                    <li key={i} style={{ color: "var(--text-2)", fontSize: "0.92rem", lineHeight: 1.6 }}>
                      {p}
                    </li>
                  ))}
                </ol>
              </Section>
            )}

            {/* Survival Tip */}
            {parsed.survivalTip && (
              <Section emoji="🚑" label="Survival Tip" color="var(--ash)" delay={0.24}>
                <p style={{ color: "var(--text)", fontSize: "0.92rem", maxWidth: "none", fontStyle: "italic" }}>
                  {parsed.survivalTip}
                </p>
              </Section>
            )}
          </motion.div>
        )}

        {/* ── Fallback raw if parsing fails ─────────────────────────────── */}
        {showRaw && (
          <motion.div
            key="raw"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.88rem",
              lineHeight: 1.8,
              color: "var(--text-2)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Done badge ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ marginTop: "1.25rem", display: "flex", justifyContent: "flex-end" }}
          >
            <span className="badge badge-fire">✓ Roast complete</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}