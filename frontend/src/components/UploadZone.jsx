import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MAX_SIZE_MB = 5;

export default function UploadZone({ onFileAccepted }) {
  const [dragging, setDragging] = useState(false);
  const [error, setError]       = useState("");
  const inputRef                = useRef(null);

  // ── Validation ──────────────────────────────────────────────────────────
  const validate = useCallback((file) => {
    if (!file) return "No file selected.";
    if (!file.name.toLowerCase().endsWith(".pdf"))
      return "Only PDF files are accepted. No .docx, no .png, just PDF.";
    if (file.size > MAX_SIZE_MB * 1024 * 1024)
      return `File too large. Max size is ${MAX_SIZE_MB}MB.`;
    return null;
  }, []);

  const handleFile = useCallback((file) => {
    const err = validate(file);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    onFileAccepted(file);
  }, [validate, onFileAccepted]);

  // ── Drag handlers ────────────────────────────────────────────────────────
  const onDragOver  = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragging(false);
    }
  };
  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const onInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const openPicker = () => inputRef.current?.click();

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ width: "100%", maxWidth: "560px", margin: "0 auto" }}>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        onChange={onInputChange}
        style={{ display: "none" }}
      />

      {/* ── Drop Zone ──────────────────────────────────────────────────── */}
      <motion.div
        className={`dropzone ${dragging ? "active" : ""}`}
        onClick={openPicker}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        animate={{
          borderColor: dragging ? "var(--fire)" : "var(--border)",
          backgroundColor: dragging ? "rgba(255,69,0,0.06)" : "var(--bg-2)",
          boxShadow: dragging ? "var(--glow-fire)" : "none",
        }}
        transition={{ duration: 0.15 }}
        style={{ cursor: "pointer", userSelect: "none" }}
      >
        {/* Icon */}
        <motion.div
          animate={{ scale: dragging ? 1.15 : 1, rotate: dragging ? -4 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{ fontSize: "3rem", marginBottom: "1rem", display: "block" }}
        >
          {dragging ? "🔥" : "📄"}
        </motion.div>

        {/* Text */}
        <AnimatePresence mode="wait">
          {dragging ? (
            <motion.div
              key="dragging"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <div className="text-display text-fire" style={{ fontSize: "1.4rem", marginBottom: "0.25rem" }}>
                DROP IT LIKE IT'S HOT
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <div className="text-display" style={{ fontSize: "1.3rem", marginBottom: "0.4rem", color: "var(--text)" }}>
                DRAG & DROP YOUR RESUME
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
                or{" "}
                <span style={{ color: "var(--ember)", textDecoration: "underline", textDecorationStyle: "dashed" }}>
                  click to browse
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Constraints */}
        <div style={{ marginTop: "1.25rem", display: "flex", justifyContent: "center", gap: "0.75rem" }}>
          <span className="badge badge-ash">PDF only</span>
          <span className="badge badge-ash">Max {MAX_SIZE_MB}MB</span>
          <span className="badge badge-ash">Text-based</span>
        </div>
      </motion.div>

      {/* ── Error ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: "0.75rem",
              padding: "0.75rem 1rem",
              background: "rgba(255,69,0,0.08)",
              border: "1px solid rgba(255,69,0,0.3)",
              borderRadius: "var(--radius)",
              color: "var(--fire)",
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scanned PDF warning ─────────────────────────────────────────── */}
      <AnimatePresence>
        {!error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              marginTop: "0.75rem",
              fontSize: "0.78rem",
              color: "var(--text-muted)",
              textAlign: "center",
            }}
          >
            ⚠️ Scanned or image-only PDFs won't work — use a text-based PDF
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}