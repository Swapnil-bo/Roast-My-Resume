import { useState } from "react";

// ── Data ─────────────────────────────────────────────────────────────────────
const INDUSTRY_ROLES = {
  "Technology": [
    "Software Engineer", "Frontend Engineer", "Backend Engineer",
    "Full Stack Engineer", "ML Engineer", "AI Engineer",
    "DevOps Engineer", "Data Engineer", "Data Scientist",
    "Product Manager", "Engineering Manager", "CTO",
  ],
  "Finance": [
    "Investment Analyst", "Financial Analyst", "Quantitative Analyst",
    "Risk Analyst", "Portfolio Manager", "Investment Banker",
    "CFO", "Accountant", "Actuary",
  ],
  "Design": [
    "UI Designer", "UX Designer", "Product Designer",
    "Brand Designer", "Motion Designer", "Design Lead",
  ],
  "Marketing": [
    "Growth Marketer", "Content Strategist", "SEO Specialist",
    "Performance Marketer", "Brand Manager", "CMO",
  ],
  "Healthcare": [
    "Data Analyst", "Health Informatics Specialist",
    "Clinical Research Associate", "Product Manager", "Operations Manager",
  ],
  "Consulting": [
    "Strategy Consultant", "Management Consultant",
    "Business Analyst", "Associate", "Engagement Manager",
  ],
  "Research": [
    "Research Scientist", "Research Engineer", "Lab Manager",
    "Postdoctoral Researcher", "Principal Investigator",
  ],
  "Other": [],
};

const INDUSTRIES = Object.keys(INDUSTRY_ROLES);

// ── Component ─────────────────────────────────────────────────────────────────
export default function RoleSelector({ role, industry, onRoleChange, onIndustryChange }) {
  const [customRole, setCustomRole] = useState(false);
  const [customIndustry, setCustomIndustry] = useState(false);

  const suggestedRoles = INDUSTRY_ROLES[industry] || [];

  const handleIndustryChange = (val) => {
    if (val === "__custom__") {
      setCustomIndustry(true);
      onIndustryChange("");
    } else {
      setCustomIndustry(false);
      onIndustryChange(val);
      onRoleChange("");
      setCustomRole(false);
    }
  };

  const handleRoleChipClick = (r) => {
    onRoleChange(r);
    setCustomRole(false);
  };

  const handleCustomRoleToggle = () => {
    setCustomRole(true);
    onRoleChange("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* ── Industry ───────────────────────────────────────────────────────── */}
      <div>
        <label style={labelStyle}>
          Target Industry
        </label>

        {customIndustry ? (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="text"
              placeholder="e.g. Aerospace, Gaming, Legal..."
              value={industry}
              onChange={(e) => onIndustryChange(e.target.value)}
              autoFocus
            />
            <button
              className="btn btn-ghost"
              onClick={() => { setCustomIndustry(false); onIndustryChange(""); }}
              style={{ whiteSpace: "nowrap", padding: "0.6rem 1rem", fontSize: "0.85rem" }}
            >
              ← Back
            </button>
          </div>
        ) : (
          <select value={industry} onChange={(e) => handleIndustryChange(e.target.value)}>
            <option value="" disabled>Select an industry...</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
            <option value="__custom__">✏️ Type my own...</option>
          </select>
        )}
      </div>

      {/* ── Role ───────────────────────────────────────────────────────────── */}
      {(industry || customIndustry) && (
        <div>
          <label style={labelStyle}>
            Target Role
          </label>

          {/* Suggested role chips */}
          {suggestedRoles.length > 0 && !customRole && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
              {suggestedRoles.map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleChipClick(r)}
                  style={{
                    background: role === r ? "rgba(255,69,0,0.15)" : "var(--surface-2)",
                    border: `1px solid ${role === r ? "var(--fire)" : "var(--border)"}`,
                    color: role === r ? "var(--fire)" : "var(--text-2)",
                    borderRadius: "999px",
                    padding: "0.35rem 0.9rem",
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    fontFamily: "var(--font-body)",
                    fontWeight: role === r ? 600 : 400,
                  }}
                >
                  {r}
                </button>
              ))}
              <button
                onClick={handleCustomRoleToggle}
                style={{
                  background: "transparent",
                  border: "1px dashed var(--smoke)",
                  color: "var(--text-muted)",
                  borderRadius: "999px",
                  padding: "0.35rem 0.9rem",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  transition: "all 0.15s ease",
                }}
              >
                ✏️ Custom
              </button>
            </div>
          )}

          {/* Custom role input */}
          {(customRole || suggestedRoles.length === 0) && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                placeholder="e.g. AI Research Engineer, Founding Engineer..."
                value={role}
                onChange={(e) => onRoleChange(e.target.value)}
                autoFocus
              />
              {suggestedRoles.length > 0 && (
                <button
                  className="btn btn-ghost"
                  onClick={() => { setCustomRole(false); onRoleChange(""); }}
                  style={{ whiteSpace: "nowrap", padding: "0.6rem 1rem", fontSize: "0.85rem" }}
                >
                  ← Back
                </button>
              )}
            </div>
          )}

          {/* Selected summary */}
          {role && !customRole && (
            <div style={{ marginTop: "0.6rem", fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Roasting as{" "}
              <span style={{ color: "var(--ember)", fontWeight: 600 }}>{role}</span>
              {" "}in{" "}
              <span style={{ color: "var(--ember)", fontWeight: 600 }}>{industry}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const labelStyle = {
  display: "block",
  marginBottom: "0.6rem",
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "var(--text-2)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};