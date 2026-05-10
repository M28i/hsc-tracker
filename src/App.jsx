import { useState, useEffect, useRef } from "react";

const HSC_SUBJECTS = [
  "Agriculture",
  "Ancient History",
  "Biology",
  "Business Studies",
  "Chemistry",
  "Community and Family Studies",
  "Design and Technology",
  "Drama",
  "Earth & Environmental Science",
  "Economics",
  "Engineering Studies",
  "English Advanced",
  "English Extension 1",
  "English Extension 2",
  "English Standard",
  "Food Technology",
  "Geography",
  "History Extension",
  "Industrial Technology",
  "Investigating Science",
  "Legal Studies",
  "Mathematics Advanced",
  "Mathematics Extension 1",
  "Mathematics Extension 2",
  "Mathematics Standard 2",
  "Modern History",
  "Music 1",
  "Music 2",
  "PDHPE",
  "Physics",
  "Society and Culture",
  "Software Design and Development",
  "Studies of Religion I",
  "Studies of Religion II",
  "Textiles and Design",
  "Visual Arts",
];

const TASK_LABELS = ["T1", "T2", "T3", "T4"];
const DEFAULT_WEIGHTS = [25, 25, 25, 25];

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function makeSubject() {
  return { id: makeId(), name: null, weights: [...DEFAULT_WEIGHTS], sims: {}, scores: {} };
}

function calcSubject(subject, target = 85) {
  let weightedSum = 0;
  let completedWeight = 0;
  let remainingWeight = 0;

  subject.weights.forEach((w, ti) => {
    const score = subject.scores?.[ti];
    const sim = subject.sims[ti];
    const value = score !== undefined && score !== null
      ? score
      : (sim !== undefined && sim !== null ? sim : null);
    if (value !== null) {
      weightedSum += (value * w) / 100;
      completedWeight += w;
    } else {
      remainingWeight += w;
    }
  });

  const currentPct = completedWeight > 0 ? (weightedSum / completedWeight) * 100 : 0;
  const neededFromRemaining = target - weightedSum;
  const neededAvg = remainingWeight > 0 ? (neededFromRemaining / remainingWeight) * 100 : null;
  const finalPct = remainingWeight === 0 ? weightedSum : null;

  return { currentWeighted: weightedSum, currentPct, neededAvg, completedWeight, remainingWeight, finalPct };
}

function isInvalidWeights(subject) {
  if (!subject.name) return false;
  const sum = subject.weights.reduce((a, b) => a + b, 0);
  return sum !== 100;
}

function getPctColor(pct) {
  if (pct >= 90) return "#22c55e";
  if (pct >= 80) return "#84cc16";
  if (pct >= 70) return "#eab308";
  if (pct >= 60) return "#f97316";
  return "#ef4444";
}

function getDifficultyTag(neededAvg) {
  if (neededAvg === null) return { text: "DONE", color: "#22c55e", bg: "rgba(34,197,94,0.12)" };
  if (neededAvg <= 75) return { text: "EASY", color: "#22c55e", bg: "rgba(34,197,94,0.12)" };
  if (neededAvg <= 85) return { text: "DOABLE", color: "#84cc16", bg: "rgba(132,204,22,0.12)" };
  if (neededAvg <= 92) return { text: "STRETCH", color: "#eab308", bg: "rgba(234,179,8,0.12)" };
  if (neededAvg <= 100) return { text: "HARD", color: "#f97316", bg: "rgba(249,115,22,0.12)" };
  return { text: "UNLIKELY", color: "#ef4444", bg: "rgba(239,68,68,0.12)" };
}

function EditableWeight({ weight, onChange, hasError }) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleSubmit = () => {
    const num = parseInt(inputVal.trim(), 10);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      onChange(num);
    }
    setEditing(false);
    setInputVal("");
  };

  const asterisk = hasError ? (
    <span style={{
      position: "absolute",
      top: -9,
      left: "50%",
      transform: "translateX(-50%)",
      color: "#ef4444",
      fontSize: 13,
      fontWeight: 700,
      lineHeight: 1,
      pointerEvents: "none",
    }}>*</span>
  ) : null;

  if (editing) {
    return (
      <span style={{ position: "relative", display: "inline-block" }}>
        {asterisk}
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          placeholder={`${weight}`}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") { setEditing(false); setInputVal(""); }
          }}
          onBlur={handleSubmit}
          style={{
            background: "#1e293b",
            border: `1px solid ${hasError ? "#ef4444" : "#6366f1"}`,
            borderRadius: 3,
            color: "#f8fafc",
            fontSize: 9,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600,
            padding: "1px 4px",
            outline: "none",
            width: 32,
            textAlign: "center",
          }}
        />
      </span>
    );
  }

  return (
    <span
      onClick={(e) => { e.stopPropagation(); setEditing(true); }}
      style={{
        position: "relative",
        display: "inline-block",
        background: hasError ? "rgba(239,68,68,0.18)" : "rgba(100,116,139,0.15)",
        color: hasError ? "#fca5a5" : undefined,
        padding: "1px 5px",
        borderRadius: 3,
        cursor: "pointer",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = hasError ? "rgba(239,68,68,0.3)" : "rgba(99,102,241,0.25)"}
      onMouseLeave={(e) => e.currentTarget.style.background = hasError ? "rgba(239,68,68,0.18)" : "rgba(100,116,139,0.15)"}
      title={hasError ? "Weights must add up to 100" : "Click to change weight"}
    >
      {asterisk}
      w:{weight}%
    </span>
  );
}

function SimCell({ label, simValue, permanentValue, onSimChange, onPermanentChange, onClear, onKeep, currentWeight, onWeightChange, hasError }) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const inputRef = useRef(null);
  const hasPermanent = permanentValue !== undefined && permanentValue !== null;
  const hasSim = !hasPermanent && simValue !== undefined && simValue !== null;

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleSubmit = () => {
    const trimmed = inputVal.trim().replace("%", "");
    const num = parseFloat(trimmed);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      if (hasPermanent) onPermanentChange(num);
      else onSimChange(num);
    }
    setEditing(false);
    setInputVal("");
  };

  if (editing) {
    return (
      <div style={{
        background: "#0c1222",
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}>
        <div style={{
          fontSize: 9, fontWeight: 600, color: "#64748b",
          fontFamily: "'JetBrains Mono', monospace",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span>{label}</span>
          <EditableWeight weight={currentWeight} onChange={onWeightChange} hasError={hasError} />
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="e.g. 85"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") { setEditing(false); setInputVal(""); }
          }}
          onBlur={handleSubmit}
          style={{
            background: "#1e293b",
            border: "1px solid #6366f1",
            borderRadius: 6,
            color: "#f8fafc",
            fontSize: 15,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            padding: "6px 8px",
            outline: "none",
            width: "100%",
            boxSizing: "border-box",
          }}
        />
        <div style={{ fontSize: 9, color: "#6366f1" }}>Enter % then press Enter</div>
      </div>
    );
  }

  if (hasPermanent) {
    return (
      <div
        style={{
          background: "rgba(34,197,94,0.06)",
          padding: "10px 12px",
          cursor: "pointer",
          position: "relative",
          borderLeft: "2px solid #22c55e",
        }}
        onClick={() => setEditing(true)}
      >
        <div style={{
          fontSize: 9, fontWeight: 600, color: "#64748b",
          fontFamily: "'JetBrains Mono', monospace",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span>{label}</span>
          <EditableWeight weight={currentWeight} onChange={onWeightChange} hasError={hasError} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
          <div style={{
            fontSize: 18, fontWeight: 700,
            color: getPctColor(permanentValue),
            fontFamily: "'JetBrains Mono', monospace",
            lineHeight: 1.2,
          }}>
            {permanentValue.toFixed(1)}%
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            style={{
              background: "rgba(239,68,68,0.15)", border: "none", borderRadius: 4,
              color: "#f87171", cursor: "pointer", padding: "2px 6px", fontSize: 10,
              fontWeight: 600, lineHeight: "16px",
            }}
            title="Clear score"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  if (hasSim) {
    return (
      <div
        style={{
          background: "rgba(99,102,241,0.08)",
          padding: "10px 12px",
          cursor: "pointer",
          position: "relative",
          borderLeft: "2px solid #6366f1",
        }}
        onClick={() => setEditing(true)}
      >
        <div style={{
          fontSize: 9, fontWeight: 600, color: "#64748b",
          fontFamily: "'JetBrains Mono', monospace",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span>{label}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{
              background: "rgba(99,102,241,0.2)", color: "#818cf8",
              padding: "1px 5px", borderRadius: 3, fontSize: 8, fontWeight: 700,
            }}>
              SIM
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onKeep(); }}
              style={{
                background: "rgba(34,197,94,0.18)",
                border: "1px solid rgba(34,197,94,0.35)",
                borderRadius: 3,
                color: "#4ade80",
                cursor: "pointer",
                padding: "0px 5px",
                fontSize: 8,
                fontWeight: 700,
                lineHeight: 1.4,
                display: "inline-flex",
                alignItems: "center",
                gap: 2,
                fontFamily: "inherit",
              }}
              title="Keep as permanent score"
            >
              ✓ keep
            </button>
            <EditableWeight weight={currentWeight} onChange={onWeightChange} hasError={hasError} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
          <div style={{
            fontSize: 18, fontWeight: 700,
            color: getPctColor(simValue),
            fontFamily: "'JetBrains Mono', monospace",
            lineHeight: 1.2,
          }}>
            {simValue.toFixed(1)}%
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            style={{
              background: "rgba(239,68,68,0.15)", border: "none", borderRadius: 4,
              color: "#f87171", cursor: "pointer", padding: "2px 6px", fontSize: 10,
              fontWeight: 600, lineHeight: "16px",
            }}
            title="Clear simulated score"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#0f172a",
        padding: "10px 12px",
        cursor: "pointer",
        transition: "background 0.15s",
      }}
      onClick={() => setEditing(true)}
      onMouseEnter={(e) => e.currentTarget.style.background = "#131c31"}
      onMouseLeave={(e) => e.currentTarget.style.background = "#0f172a"}
    >
      <div style={{
        fontSize: 9, fontWeight: 600, color: "#64748b",
        fontFamily: "'JetBrains Mono', monospace",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span>{label}</span>
        <EditableWeight weight={currentWeight} onChange={onWeightChange} hasError={hasError} />
      </div>
      <div style={{
        fontSize: 12, color: "#475569", fontWeight: 600,
        marginTop: 6, display: "flex", alignItems: "center", gap: 4,
      }}>
        <span style={{ fontSize: 14, color: "#6366f1", lineHeight: 1 }}>+</span>
        <span style={{ fontStyle: "italic" }}>Try a score</span>
      </div>
    </div>
  );
}

export default function HSCTracker() {
  const [target, setTarget] = useState(85);
  const [loaded, setLoaded] = useState(false);
  const [subjects, setSubjects] = useState(() => [makeSubject()]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hsc-tracker-subjects");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setSubjects(parsed);
      }
    } catch (e) {}
    try {
      const savedTarget = localStorage.getItem("hsc-tracker-target");
      if (savedTarget) setTarget(JSON.parse(savedTarget));
    } catch (e) {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem("hsc-tracker-subjects", JSON.stringify(subjects)); } catch (e) {}
    try { localStorage.setItem("hsc-tracker-target", JSON.stringify(target)); } catch (e) {}
  }, [subjects, target, loaded]);

  const updateSubject = (id, updater) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? updater(s) : s)));
  };

  const addSubject = () => setSubjects((prev) => [...prev, makeSubject()]);

  const removeSubject = (id) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const setSubjectName = (id, name) =>
    updateSubject(id, (s) => ({ ...s, name: name || null }));

  const setWeight = (id, ti, val) =>
    updateSubject(id, (s) => {
      const next = [...s.weights];
      next[ti] = val;
      return { ...s, weights: next };
    });

  const setSim = (id, ti, val) =>
    updateSubject(id, (s) => ({ ...s, sims: { ...s.sims, [ti]: val } }));

  const setPermanent = (id, ti, val) =>
    updateSubject(id, (s) => ({ ...s, scores: { ...(s.scores || {}), [ti]: val } }));

  const keepSim = (id, ti) =>
    updateSubject(id, (s) => {
      const sim = s.sims[ti];
      if (sim === undefined || sim === null) return s;
      const nextSims = { ...s.sims };
      delete nextSims[ti];
      return { ...s, sims: nextSims, scores: { ...(s.scores || {}), [ti]: sim } };
    });

  const clearCell = (id, ti) =>
    updateSubject(id, (s) => {
      const nextSims = { ...s.sims };
      delete nextSims[ti];
      const nextScores = { ...(s.scores || {}) };
      delete nextScores[ti];
      return { ...s, sims: nextSims, scores: nextScores };
    });

  const clearAllSims = () =>
    setSubjects((prev) => prev.map((s) => ({ ...s, sims: {} })));

  const hasSims = subjects.some((s) =>
    Object.values(s.sims).some((v) => v !== undefined && v !== null)
  );

  const namedValid = subjects.filter((s) => s.name && !isInvalidWeights(s));

  const overallCurrentPct =
    namedValid.length > 0
      ? namedValid.reduce((sum, s) => sum + calcSubject(s, target).currentPct, 0) / namedValid.length
      : 0;

  const priorityRanking = namedValid
    .map((s) => ({ name: s.name, ...calcSubject(s, target) }))
    .filter((c) => c.neededAvg !== null)
    .sort((a, b) => b.neededAvg - a.neededAvg);

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: "#0a0e17",
      color: "#e2e8f0",
      minHeight: "100vh",
      padding: "24px 16px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 900, margin: "0 auto 24px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f8fafc", margin: 0, letterSpacing: "-0.5px" }}>
              HSC Assessment Tracker
            </h1>
            <span style={{ fontSize: 12, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>2026</span>
          </div>
          {hasSims && (
            <button
              onClick={clearAllSims}
              style={{
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.3)",
                borderRadius: 6, color: "#818cf8", cursor: "pointer",
                padding: "5px 12px", fontSize: 11, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              <span>✕</span> Clear all simulated scores
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: 10, padding: "12px 18px", flex: "1 1 140px", minWidth: 140,
          }}>
            <div style={{ fontSize: 11, color: "#818cf8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Current Average {hasSims ? "(w/ sims)" : ""}
            </div>
            <div style={{
              fontSize: 28, fontWeight: 700, color: "#f8fafc",
              fontFamily: "'JetBrains Mono', monospace", marginTop: 2,
            }}>
              {overallCurrentPct.toFixed(1)}%
            </div>
          </div>

          <div style={{
            background: "linear-gradient(135deg, rgba(234,179,8,0.12), rgba(234,179,8,0.04))",
            border: "1px solid rgba(234,179,8,0.2)",
            borderRadius: 10, padding: "12px 18px", flex: "1 1 140px", minWidth: 140,
          }}>
            <div style={{ fontSize: 11, color: "#eab308", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Target</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
              <div style={{
                fontSize: 28, fontWeight: 700, color: "#f8fafc",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {target}%
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <button onClick={() => setTarget((t) => Math.min(100, t + 5))} style={{
                  background: "rgba(234,179,8,0.2)", border: "none", borderRadius: 4,
                  color: "#eab308", cursor: "pointer", padding: "1px 6px", fontSize: 11, lineHeight: "14px",
                }}>▲</button>
                <button onClick={() => setTarget((t) => Math.max(50, t - 5))} style={{
                  background: "rgba(234,179,8,0.2)", border: "none", borderRadius: 4,
                  color: "#eab308", cursor: "pointer", padding: "1px 6px", fontSize: 11, lineHeight: "14px",
                }}>▼</button>
              </div>
            </div>
          </div>

          <div style={{
            background: "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04))",
            border: "1px solid rgba(239,68,68,0.18)",
            borderRadius: 10, padding: "12px 18px", flex: "1 1 180px", minWidth: 180,
          }}>
            <div style={{ fontSize: 11, color: "#f87171", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Top Priority</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc", marginTop: 4 }}>
              {priorityRanking.length > 0 ? priorityRanking[0].name : "All done!"}
            </div>
            {priorityRanking.length > 0 && (
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                Needs {priorityRanking[0].neededAvg.toFixed(1)}% avg on remaining
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {subjects.map((subject) => {
          const calc = calcSubject(subject, target);
          const invalid = isInvalidWeights(subject);
          const hasName = !!subject.name;
          const diff = hasName && !invalid ? getDifficultyTag(calc.neededAvg) : null;
          const subjectHasSims = Object.values(subject.sims).some((v) => v !== undefined && v !== null);
          const availableNames = HSC_SUBJECTS.filter(
            (n) => n === subject.name || !subjects.some((other) => other.name === n)
          );

          return (
            <div key={subject.id} style={{
              background: "#111827",
              border: invalid
                ? "1px solid rgba(239,68,68,0.4)"
                : subjectHasSims
                  ? "1px solid rgba(99,102,241,0.25)"
                  : "1px solid #1e293b",
              borderRadius: 12, marginBottom: 12, overflow: "hidden",
              transition: "border-color 0.2s",
            }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 18px 10px", flexWrap: "wrap", gap: 8,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <select
                    value={subject.name || ""}
                    onChange={(e) => setSubjectName(subject.id, e.target.value)}
                    style={{
                      background: hasName ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.12)",
                      border: hasName ? "1px solid rgba(99,102,241,0.18)" : "1px solid rgba(99,102,241,0.35)",
                      color: hasName ? "#f1f5f9" : "#818cf8",
                      fontSize: 15,
                      fontWeight: 700,
                      fontFamily: "inherit",
                      padding: "5px 10px",
                      cursor: "pointer",
                      outline: "none",
                      borderRadius: 6,
                      minWidth: 180,
                    }}
                  >
                    <option value="">— select subject —</option>
                    {availableNames.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  {hasName && diff && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: diff.color, background: diff.bg,
                      padding: "2px 8px", borderRadius: 4, letterSpacing: "0.5px",
                    }}>
                      {diff.text}
                    </span>
                  )}
                  {hasName && invalid && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: "#ef4444", background: "rgba(239,68,68,0.12)",
                      padding: "2px 8px", borderRadius: 4, letterSpacing: "0.5px",
                    }}>
                      WEIGHTS ≠ 100
                    </span>
                  )}
                  {subjectHasSims && (
                    <span style={{
                      fontSize: 9, fontWeight: 600, color: "#818cf8",
                      background: "rgba(99,102,241,0.12)",
                      padding: "2px 6px", borderRadius: 4,
                    }}>
                      SIMULATED
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  {hasName && !invalid && (
                    <>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 10, color: "#64748b", fontWeight: 500 }}>CURRENT</div>
                        <div style={{
                          fontSize: 18, fontWeight: 700, color: getPctColor(calc.currentPct),
                          fontFamily: "'JetBrains Mono', monospace",
                        }}>
                          {calc.currentPct.toFixed(1)}%
                        </div>
                      </div>
                      {calc.neededAvg !== null ? (
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 10, color: "#64748b", fontWeight: 500 }}>NEED AVG</div>
                          <div style={{
                            fontSize: 18, fontWeight: 700,
                            color: calc.neededAvg > 100 ? "#ef4444" : calc.neededAvg > 92 ? "#f97316" : "#eab308",
                            fontFamily: "'JetBrains Mono', monospace",
                          }}>
                            {calc.neededAvg.toFixed(1)}%
                          </div>
                        </div>
                      ) : calc.finalPct !== null ? (
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 10, color: "#64748b", fontWeight: 500 }}>FINAL</div>
                          <div style={{
                            fontSize: 18, fontWeight: 700,
                            color: calc.finalPct >= target ? "#22c55e" : "#ef4444",
                            fontFamily: "'JetBrains Mono', monospace",
                          }}>
                            {calc.finalPct.toFixed(1)}%
                          </div>
                        </div>
                      ) : null}
                    </>
                  )}
                  <button
                    onClick={() => removeSubject(subject.id)}
                    style={{
                      background: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      borderRadius: 6,
                      color: "#f87171",
                      cursor: "pointer",
                      padding: "4px 9px",
                      fontSize: 13,
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                    title="Remove subject"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {hasName && !invalid && (
                <div style={{ padding: "0 18px 6px" }}>
                  <div style={{
                    height: 4, background: "#1e293b", borderRadius: 2, overflow: "hidden", display: "flex",
                  }}>
                    <div style={{
                      width: `${calc.completedWeight}%`,
                      background: `linear-gradient(90deg, ${getPctColor(calc.currentPct)}88, ${getPctColor(calc.currentPct)})`,
                      borderRadius: 2, transition: "width 0.3s ease",
                    }} />
                  </div>
                  <div style={{ fontSize: 10, color: "#475569", marginTop: 3 }}>
                    {calc.completedWeight}% of total weight {calc.remainingWeight === 0 ? "— all filled" : "completed"}
                  </div>
                </div>
              )}

              {hasName && (
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 1, background: "#1e293b", borderTop: "1px solid #1e293b",
                }}>
                  {TASK_LABELS.map((label, ti) => (
                    <SimCell
                      key={ti}
                      label={label}
                      simValue={subject.sims[ti]}
                      permanentValue={subject.scores?.[ti]}
                      onSimChange={(val) => setSim(subject.id, ti, val)}
                      onPermanentChange={(val) => setPermanent(subject.id, ti, val)}
                      onClear={() => clearCell(subject.id, ti)}
                      onKeep={() => keepSim(subject.id, ti)}
                      currentWeight={subject.weights[ti]}
                      onWeightChange={(val) => setWeight(subject.id, ti, val)}
                      hasError={invalid}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div
          onClick={addSubject}
          style={{
            background: "#0f172a",
            border: "1px dashed #334155",
            borderRadius: 12,
            padding: "18px 18px",
            marginBottom: 12,
            cursor: "pointer",
            textAlign: "center",
            color: "#64748b",
            transition: "border-color 0.2s, color 0.2s, background 0.2s",
            fontWeight: 600,
            fontSize: 13,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#6366f1";
            e.currentTarget.style.color = "#818cf8";
            e.currentTarget.style.background = "rgba(99,102,241,0.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#334155";
            e.currentTarget.style.color = "#64748b";
            e.currentTarget.style.background = "#0f172a";
          }}
        >
          <span style={{ fontSize: 18, marginRight: 6, verticalAlign: "middle" }}>+</span>
          <span style={{ verticalAlign: "middle" }}>Add subject</span>
        </div>
      </div>

      <div style={{
        maxWidth: 900, margin: "20px auto 0", background: "#111827",
        border: "1px solid #1e293b", borderRadius: 12, padding: "16px 18px",
      }}>
        <h3 style={{
          fontSize: 13, fontWeight: 700, color: "#94a3b8", margin: "0 0 12px",
          textTransform: "uppercase", letterSpacing: "0.5px",
        }}>
          Improvement Priority — hardest to reach {target}%
        </h3>
        {priorityRanking.length === 0 && (
          <div style={{ fontSize: 14, color: "#64748b", padding: "8px 0" }}>
            {namedValid.length === 0
              ? "Pick a subject and fill in weights to see priorities."
              : "All subjects fully simulated — check your projected finals above!"}
          </div>
        )}
        {priorityRanking.map((s, i) => {
          const diff = getDifficultyTag(s.neededAvg);
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "8px 0",
              borderBottom: i < priorityRanking.length - 1 ? "1px solid #1e293b" : "none",
            }}>
              <span style={{
                fontSize: 14, fontWeight: 700, color: "#475569",
                fontFamily: "'JetBrains Mono', monospace", width: 22,
              }}>
                {i + 1}.
              </span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", flex: 1 }}>{s.name}</span>
              <span style={{
                fontSize: 10, fontWeight: 700, color: diff.color, background: diff.bg,
                padding: "2px 8px", borderRadius: 4,
              }}>
                {diff.text}
              </span>
              <span style={{
                fontSize: 14, fontWeight: 700, color: diff.color,
                fontFamily: "'JetBrains Mono', monospace", width: 55, textAlign: "right",
              }}>
                {s.neededAvg.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>

      <div style={{
        maxWidth: 900, margin: "16px auto 0", fontSize: 11,
        color: "#475569", textAlign: "center", lineHeight: 1.6,
      }}>
        Click any <span style={{ color: "#6366f1", fontWeight: 600 }}>+ Try a score</span> slot to simulate a result and see how it affects your averages.
      </div>
    </div>
  );
}
