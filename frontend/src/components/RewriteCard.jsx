import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Resume Section Parser ─────────────────────────────────────────────────────
const SECTION_PATTERNS = [
  { key: "summary",    labels: ["PROFESSIONAL SUMMARY", "SUMMARY", "PROFILE", "OBJECTIVE"],          emoji: "⚡", color: "var(--ember)" },
  { key: "experience", labels: ["EXPERIENCE", "WORK EXPERIENCE", "PROFESSIONAL EXPERIENCE"],         emoji: "💼", color: "var(--fire)"  },
  { key: "skills",     labels: ["SKILLS", "TECHNICAL SKILLS", "CORE COMPETENCIES", "COMPETENCIES"],  emoji: "🛠", color: "var(--gold)"  },
  { key: "education",  labels: ["EDUCATION", "ACADEMIC BACKGROUND"],                                  emoji: "🎓", color: "var(--ash)"   },
  { key: "projects",   labels: ["PROJECTS", "KEY PROJECTS", "NOTABLE PROJECTS"],                     emoji: "🚀", color: "var(--ember)" },
  { key: "awards",     labels: ["AWARDS", "ACHIEVEMENTS", "CERTIFICATIONS", "HONORS"],               emoji: "🏆", color: "var(--gold)"  },
];

function parseResume(text) {
  if (!text) return null;

  const lines   = text.split("\n");
  const sections = [];
  let current   = null;

  const matchLabel = (line) => {
    const clean = line.trim().toUpperCase().replace(/[:\-–]/g, "").trim();
    return SECTION_PATTERNS.find((p) => p.labels.some((l) => clean === l));
  };

  for (const line of lines) {
    const match = matchLabel(line);
    if (match) {
      if (current) sections.push(current);
      current = { ...match, title: line.trim().replace(/[:\-–]/g, "").trim(), lines: [] };
    } else if (current) {
      current.lines.push(line);
    } else {
      // Pre-header content (name, contact)
      if (!sections.length) {
        if (!current) current = { key: "header", title: "", emoji: "👤", color: "var(--text)", lines: [] };
        current.lines.push(line);
      }
    }
  }
  if (current) sections.push(current);

  return sections.filter((s) => s.lines.some((l) => l.trim()));
}

// ── Stats ─────────────────────────────────────────────────────────────────────
const ACTION_VERBS = [
  "led","built","scaled","drove","reduced","increased","launched","designed",
  "architected","optimized","delivered","managed","created","developed","grew",
  "improved","negotiated","executed","implemented","deployed","automated","owned",
  "spearheaded","pioneered","transformed","accelerated","mentored","established",
];

function computeStats(text) {
  if (!text) return null;
  const words     = text.split(/\s+/).filter(Boolean);
  const lower     = text.toLowerCase();
  const verbCount = ACTION_VERBS.filter((v) => lower.includes(v)).length;
  const hasMetrics = (text.match(/\d+%|\$\d+|\d+x|\d+\+/g) || []).length;
  return { words: words.length, verbs: verbCount, metrics: hasMetrics };
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  const rows = [60, 100, 85, 40, 95, 70, 80, 50, 90, 65, 75, 55];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", padding: "0.5rem 0" }}>
      {rows.map((w, i) => (
        <motion.div
          key={i}
          style={{
            height: i % 4 === 0 ? "10px" : "13px",
            width: `${w}%`,
            background: i % 4 === 0 ? "var(--border)" : "var(--surface-2)",
            borderRadius: "4px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, transparent, rgba(255,179,71,0.2), transparent)",
            }}
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "linear", delay: i * 0.07 }}
          />
        </motion.div>
      ))}
    </div>
  );
}

// ── Section Block ─────────────────────────────────────────────────────────────
function ResumeSection({ section, index }) {
  const isHeader = section.key === "header";
  const content  = section.lines.join("\n").trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        borderLeft: isHeader ? "none" : `3px solid ${section.color}`,
        borderRadius: "var(--radius)",
        padding: isHeader ? "1.25rem 1.25rem 1rem" : "1rem 1.25rem",
        marginBottom: 0,
      }}
    >
      {/* Section label */}
      {!isHeader && (
        <div style={{
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: section.color,
          marginBottom: "0.6rem",
          fontFamily: "var(--font-mono)",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}>
          {section.emoji} {section.title || section.key}
        </div>
      )}

      {/* Content */}
      {isHeader ? (
        <div>
          {section.lines.filter(Boolean).map((line, i) => (
            <div
              key={i}
              style={{
                color: i === 0 ? "var(--text)" : "var(--text-muted)",
                fontSize: i === 0 ? "1.15rem" : "0.82rem",
                fontWeight: i === 0 ? 700 : 400,
                lineHeight: 1.5,
                fontFamily: i === 0 ? "var(--font-display)" : "var(--font-body)",
                letterSpacing: i === 0 ? "0.05em" : 0,
              }}
            >
              {line}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {content.split("\n").filter(Boolean).map((line, i) => {
            const isBullet  = line.trim().startsWith("-") || line.trim().startsWith("•");
            const isSubhead = !isBullet && line.trim().length < 60 && !line.trim().includes(",") && i > 0;
            const cleaned   = line.replace(/^[-•]\s*/, "").trim();
            const firstWord = cleaned.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "");
            const isVerb    = ACTION_VERBS.includes(firstWord);

            if (isBullet) {
              return (
                <div key={i} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                  <span style={{ color: section.color, marginTop: "0.25rem", flexShrink: 0, fontSize: "0.7rem" }}>▸</span>
                  <span style={{ color: "var(--text-2)", fontSize: "0.88rem", lineHeight: 1.65 }}>
                    {isVerb ? (
                      <>
                        <span style={{ color: "var(--text)", fontWeight: 600 }}>{cleaned.split(" ")[0]}</span>
                        {" " + cleaned.split(" ").slice(1).join(" ")}
                      </>
                    ) : cleaned}
                  </span>
                </div>
              );
            }

            if (isSubhead) {
              return (
                <div key={i} style={{
                  color: "var(--text)",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  marginTop: i > 0 ? "0.5rem" : 0,
                  lineHeight: 1.4,
                }}>
                  {line.trim()}
                </div>
              );
            }

            return (
              <div key={i} style={{ color: "var(--text-2)", fontSize: "0.88rem", lineHeight: 1.65 }}>
                {line.trim()}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────
function StatsBar({ stats }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{
        display: "flex",
        gap: "0.6rem",
        flexWrap: "wrap",
        marginBottom: "1.25rem",
      }}
    >
      <span className="badge badge-gold">📝 {stats.words} words</span>
      <span className="badge badge-fire">⚡ {stats.verbs} action verbs</span>
      <span className="badge badge-gold">📊 {stats.metrics} metrics</span>
      {stats.verbs >= 8  && <span className="badge badge-fire">🔥 Strong verbs</span>}
      {stats.metrics >= 3 && <span className="badge badge-gold">💰 Data-driven</span>}
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function RewriteCard({ text, loading, done }) {
  const [copied,   setCopied]   = useState(false);
  const [viewMode, setViewMode] = useState("structured"); // "structured" | "raw"

  const sections = useMemo(() => (done ? parseResume(text) : null), [text, done]);
  const stats    = useMemo(() => (done ? computeStats(text) : null),  [text, done]);
  const hasSections = sections && sections.length > 1;

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "rewritten-resume.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--gold)",
        borderRadius: "var(--radius-lg)",
        padding: "1.5rem",
        boxShadow: "0 0 20px rgba(255,179,71,0.12), 0 0 60px rgba(255,179,71,0.04)",
        position: "relative",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between" style={{ marginBottom: "1.25rem" }}>
        <div className="flex items-center gap-1">
          <span style={{ fontSize: "1.3rem" }}>✨</span>
          <div>
            <div className="text-display" style={{
              fontSize: "1.1rem",
              letterSpacing: "0.06em",
              color: "var(--gold)",
            }}>
              REWRITTEN RESUME
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>
              {done ? "AI-powered rebuild complete" : "Rebuilding from the ashes..."}
            </div>
          </div>
        </div>

        {/* Actions */}
        {done && (
          <div className="flex items-center gap-1">
            {/* View toggle */}
            {hasSections && (
              <div style={{
                display: "flex",
                background: "var(--bg-2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                overflow: "hidden",
              }}>
                {["structured", "raw"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    style={{
                      background: viewMode === mode ? "var(--surface-2)" : "transparent",
                      color: viewMode === mode ? "var(--gold)" : "var(--text-muted)",
                      border: "none",
                      padding: "0.3rem 0.7rem",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      fontFamily: "var(--font-mono)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            )}
            <button
              className="btn btn-ghost"
              onClick={handleCopy}
              style={{ padding: "0.35rem 0.85rem", fontSize: "0.8rem" }}
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
            <button
              className="btn btn-ghost"
              onClick={handleDownload}
              style={{ padding: "0.35rem 0.85rem", fontSize: "0.8rem", color: "var(--gold)", borderColor: "var(--gold)" }}
            >
              ↓ .txt
            </button>
          </div>
        )}
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* Skeleton */}
        {loading && !text && (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ marginBottom: "1rem", fontSize: "0.82rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Rebuilding your resume...
              </motion.span>
            </div>
            <Skeleton />
          </motion.div>
        )}

        {/* Streaming */}
        {loading && text && !done && (
          <motion.div
            key="streaming"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              lineHeight: 1.9,
              color: "var(--text-2)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {text}
            <span className="streaming-cursor" style={{ color: "var(--gold)" }} />
          </motion.div>
        )}

        {/* Done — Structured */}
        {done && viewMode === "structured" && hasSections && (
          <motion.div
            key="structured"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {stats && <StatsBar stats={stats} />}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {sections.map((section, i) => (
                <ResumeSection key={section.key + i} section={section} index={i} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Done — Raw */}
        {done && (viewMode === "raw" || !hasSections) && (
          <motion.div
            key="raw"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {stats && <StatsBar stats={stats} />}
            <pre style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              lineHeight: 1.9,
              color: "var(--text-2)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              margin: 0,
            }}>
              {text}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Done badge ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ marginTop: "1.25rem", display: "flex", justifyContent: "flex-end" }}
          >
            <span className="badge badge-gold">✓ Rebuild complete</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}