import { useState, useEffect, useRef } from "react";

const DEFAULT_DATA = [
  {
    name: "Physics",
    tasks: [
      { raw: null, pct: null, weight: 15, label: "T1" },
      { raw: null, pct: null, weight: 25, label: "T2" },
      { raw: null, pct: null, weight: 30, label: "T3" },
      { raw: null, pct: null, weight: 30, label: "T4" },
    ],
  },
  {
    name: "Maths Adv",
    tasks: [
      { raw: null, pct: null, weight: 20, label: "T1" },
      { raw: null, pct: null, weight: 25, label: "T2" },
      { raw: null, pct: null, weight: 25, label: "T3" },
      { raw: null, pct: null, weight: 30, label: "T4" },
    ],
  },
  {
    name: "Maths Ext 1",
    tasks: [
      { raw: null, pct: null, weight: 20, label: "T1" },
      { raw: null, pct: null, weight: 25, label: "T2" },
      { raw: null, pct: null, weight: 25, label: "T3" },
      { raw: null, pct: null, weight: 30, label: "T4" },
    ],
  },
  {
    name: "Eng Adv",
    tasks: [
      { raw: null, pct: null, weight: 20, label: "T1" },
      { raw: null, pct: null, weight: 25, label: "T2" },
      { raw: null, pct: null, weight: 25, label: "T3" },
      { raw: null, pct: null, weight: 30, label: "T4" },
    ],
  },
  {
    name: "SOR II",
    tasks: [
      { raw: null, pct: null, weight: 20, label: "T1" },
      { raw: null, pct: null, weight: 25, label: "T2" },
      { raw: null, pct: null, weight: 25, label: "T3" },
      { raw: null, pct: null, weight: 30, label: "T4" },
    ],
  },
  {
    name: "Ancient History",
    tasks: [
      { raw: null, pct: null, weight: 25, label: "T1" },
      { raw: null, pct: null, weight: 20, label: "T2" },
      { raw: null, pct: null, weight: 25, label: "T3" },
      { raw: null, pct: null, weight: 30, label: "T4" },
    ],
  },
];

function calcSubject(subject, simScores, target = 85) {
  let weightedSum = 0;
  let completedWeight = 0;
  let remainingWeight = 0;

  subject.tasks.forEach((t, ti) => {
    const simVal = simScores?.[ti];
    const pct = simVal !== undefined && simVal !== null ? simVal : t.pct;
    if (pct !== null && pct !== undefined) {
      weightedSum += (pct * t.weight) / 100;
      completedWeight += t.weight;
    } else {
      remainingWeight += t.weight;
    }
  });

  const currentPct = completedWeight > 0 ? (weightedSum / completedWeight) * 100 : 0;
  const neededFromRemaining = target - weightedSum;
  const neededAvg = remainingWeight > 0 ? (neededFromRemaining / remainingWeight) * 100 : null;
  const finalPct = remainingWeight === 0 ? weightedSum : null;

  return { currentWeighted: weightedSum, currentPct, neededAvg, completedWeight, remainingWeight, finalPct };
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

function EditableWeight({ weight, onChange }) {
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

  if (editing) {
    return (
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
          border: "1px solid #6366f1",
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
    );
  }

  return (
    <span
      onClick={(e) => { e.stopPropagation(); setEditing(true); }}
      style={{
        background: "rgba(100,116,139,0.15)",
        padding: "1px 5px",
        borderRadius: 3,
        cursor: "pointer",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(99,102,241,0.25)"}
      onMouseLeave={(e) => e.currentTarget.style.background = "rgba(100,116,139,0.15)"}
      title="Click to change weight"
    >
      w:{weight}%
    </span>
  );
}

function SimCell({ task, simValue, onSimChange, onClear, currentWeight, onWeightChange }) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const inputRef = useRef(null);
  const hasSim = simValue !== undefined && simValue !== null;

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleSubmit = () => {
    const trimmed = inputVal.trim().replace("%", "");
    const num = parseFloat(trimmed);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      onSimChange(num);
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
          display: "flex", justifyContent: "space-between",
        }}>
          <span>{task.label}</span>
          <EditableWeight weight={currentWeight} onChange={onWeightChange} />
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
          <span>{task.label}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{
              background: "rgba(99,102,241,0.2)", color: "#818cf8",
              padding: "1px 5px", borderRadius: 3, fontSize: 8, fontWeight: 700,
            }}>
              SIM
            </span>
            <EditableWeight weight={currentWeight} onChange={onWeightChange} />
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
        display: "flex", justifyContent: "space-between",
      }}>
        <span>{task.label}</span>
        <EditableWeight weight={currentWeight} onChange={onWeightChange} />
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
  const [simScores, setSimScores] = useState({});
  const [customWeights, setCustomWeights] = useState(
    DEFAULT_DATA.map((s) => s.tasks.map((t) => t.weight))
  );

  useEffect(() => {
    try {
      const savedSims = localStorage.getItem("hsc-tracker-sims");
      if (savedSims) setSimScores(JSON.parse(savedSims));
    } catch (e) {}
    try {
      const savedTarget = localStorage.getItem("hsc-tracker-target");
      if (savedTarget) setTarget(JSON.parse(savedTarget));
    } catch (e) {}
    try {
      const savedWeights = localStorage.getItem("hsc-tracker-weights");
      if (savedWeights) setCustomWeights(JSON.parse(savedWeights));
    } catch (e) {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem("hsc-tracker-sims", JSON.stringify(simScores)); } catch (e) {}
    try { localStorage.setItem("hsc-tracker-target", JSON.stringify(target)); } catch (e) {}
    try { localStorage.setItem("hsc-tracker-weights", JSON.stringify(customWeights)); } catch (e) {}
  }, [simScores, target, customWeights, loaded]);

  const setWeight = (si, ti, val) => {
    setCustomWeights((prev) => {
      const next = prev.map((row) => [...row]);
      next[si][ti] = val;
      return next;
    });
  };

  const data = DEFAULT_DATA;

  const hasSims = Object.values(simScores).some(
    (sub) => sub && Object.values(sub).some((v) => v !== undefined && v !== null)
  );

  const setSimScore = (si, ti, val) => {
    setSimScores((prev) => ({
      ...prev,
      [si]: { ...(prev[si] || {}), [ti]: val },
    }));
  };

  const clearSim = (si, ti) => {
    setSimScores((prev) => {
      const next = { ...prev };
      if (next[si]) {
        const sub = { ...next[si] };
        delete sub[ti];
        next[si] = sub;
      }
      return next;
    });
  };

  const clearAllSims = () => setSimScores({});

  const allCalcs = data.map((s, si) => {
    const subjectWithWeights = {
      ...s,
      tasks: s.tasks.map((t, ti) => ({ ...t, weight: customWeights[si][ti] })),
    };
    return calcSubject(subjectWithWeights, simScores[si], target);
  });

  const overallCurrentPct =
    allCalcs.reduce((sum, c) => sum + c.currentPct, 0) / allCalcs.length;

  const priorityRanking = data
    .map((s, i) => ({ name: s.name, ...allCalcs[i] }))
    .filter((s) => s.neededAvg !== null)
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
        {data.map((subject, si) => {
          const calc = allCalcs[si];
          const diff = getDifficultyTag(calc.neededAvg);
          const subjectHasSims = simScores[si] && Object.values(simScores[si]).some((v) => v !== undefined && v !== null);

          return (
            <div key={si} style={{
              background: "#111827",
              border: subjectHasSims ? "1px solid rgba(99,102,241,0.25)" : "1px solid #1e293b",
              borderRadius: 12, marginBottom: 12, overflow: "hidden",
              transition: "border-color 0.2s",
            }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 18px 10px", flexWrap: "wrap", gap: 8,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>
                    {subject.name}
                  </h2>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: diff.color, background: diff.bg,
                    padding: "2px 8px", borderRadius: 4, letterSpacing: "0.5px",
                  }}>
                    {diff.text}
                  </span>
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
                </div>
              </div>

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

              <div style={{
                display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
                gap: 1, background: "#1e293b", borderTop: "1px solid #1e293b",
              }}>
                {subject.tasks.map((task, ti) => {
                  if (task.pct !== null) {
                    return (
                      <div key={ti} style={{ background: "#111827", padding: "10px 12px" }}>
                        <div style={{
                          fontSize: 9, fontWeight: 600, color: "#64748b",
                          fontFamily: "'JetBrains Mono', monospace",
                          display: "flex", justifyContent: "space-between",
                        }}>
                          <span>{task.label}</span>
                          <EditableWeight weight={customWeights[si][ti]} onChange={(val) => setWeight(si, ti, val)} />
                        </div>
                        <div style={{
                          fontSize: 18, fontWeight: 700, color: getPctColor(task.pct),
                          fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.2, marginTop: 4,
                        }}>
                          {task.pct.toFixed(1)}%
                        </div>
                        {task.raw && (
                          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{task.raw}</div>
                        )}
                      </div>
                    );
                  }
                  return (
                    <SimCell
                      key={ti}
                      task={task}
                      simValue={simScores[si]?.[ti]}
                      onSimChange={(val) => setSimScore(si, ti, val)}
                      onClear={() => clearSim(si, ti)}
                      currentWeight={customWeights[si][ti]}
                      onWeightChange={(val) => setWeight(si, ti, val)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
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
            All subjects fully simulated — check your projected finals above!
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