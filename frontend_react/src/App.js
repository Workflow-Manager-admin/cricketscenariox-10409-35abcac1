import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * Cricket ScenarioX – Full App UI
 * Modern, minimal, sports-themed and fully responsive.
 * UI sections: input form, scenario + poll, poll results, voting, ticker.
 * All states (idle, loading, voted, error) are represented.
 * Uses mock/demo data and disables OpenAI live calls for safety/demo.
 */

// Theme colors from brand config (see README)
const COLORS = {
  primary: "#e9eaed",
  secondary: "#5491f2",
  accent: "#5196f0",
  warning: "#ebba45",
  error: "#e94d4d",
};

const initialForm = {
  player: "",
  runs: "",
  balls: "",
  opponent: "",
  matchStage: "",
};

// Demo/mock scenario and question to use for UI flows.
const demoScenario =
  "With just 34 runs from 26 balls, Virat Kohli faces Pakistan in the high-pressure final. The stadium is electric as he eyes another heroic chase!";
const demoPollQ = "Will Kohli cross 50 runs before the next 20 balls are bowled?";

const demoTicker =
  "Over 2000 fans chimed in – the majority believe Kohli will reach the landmark!";

const demoResults = { yes: 1227, no: 851 };

// Utility randomizer for demo
function randomResults() {
  const yes = Math.floor(400 + Math.random() * 1200);
  const no = Math.floor(350 + Math.random() * 950);
  return { yes, no };
}

// PUBLIC_INTERFACE
function App() {
  // Theme state (light/dark)
  const [theme, setTheme] = useState("light");
  const [form, setForm] = useState(initialForm);
  // UI states: input, loading, scenario, voted, ticker
  const [step, setStep] = useState("input");
  // Data states
  const [scenarioSummary, setScenarioSummary] = useState("");
  const [pollQuestion, setPollQuestion] = useState("");
  const [votes, setVotes] = useState({ yes: 0, no: 0 });
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState(""); // "yes" or "no"
  const [tickerMsg, setTickerMsg] = useState("");
  const [error, setError] = useState("");
  // Responsive helper
  const isMobile =
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 600px)").matches
      : false;

  // Effect: theme propagation
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme === "dark" ? "dark" : "light"
    );
  }, [theme]);

  // Theme toggle
  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Form change
  // PUBLIC_INTERFACE
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Form submit
  // PUBLIC_INTERFACE
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    // Validate (basic)
    if (
      !form.player.trim() ||
      !form.runs ||
      !form.balls ||
      !form.opponent.trim() ||
      !form.matchStage.trim()
    ) {
      setError("Please complete all fields.");
      return;
    }
    setStep("loading");
    // Simulate scenario/question generation (mock OpenAI)
    setTimeout(() => {
      setScenarioSummary(
        `With just ${form.runs} runs from ${form.balls} balls, ${form.player} faces ${form.opponent} in the high-pressure ${form.matchStage}. The stadium is electric as he eyes another heroic chase!`
      );
      setPollQuestion(
        `Will ${form.player} cross 50 runs in the next 20 balls?`
      );
      setVotes(randomResults());
      setHasVoted(false);
      setUserVote("");
      setStep("scenario");
    }, 1200);
  };

  // Vote action
  // PUBLIC_INTERFACE
  const handleVote = (vote) => {
    if (hasVoted) return;
    setUserVote(vote);
    setHasVoted(true);
    setVotes((prev) => ({
      yes: vote === "yes" ? prev.yes + 1 : prev.yes,
      no: vote === "no" ? prev.no + 1 : prev.no,
    }));
    setTimeout(() => {
      setStep("ticker");
      setTickerMsg(getMockTicker(scenarioSummary, pollQuestion, vote));
    }, 800);
  };

  // Public: Reset workflow (start over)
  // PUBLIC_INTERFACE
  const handleReset = () => {
    setForm(initialForm);
    setScenarioSummary("");
    setPollQuestion("");
    setVotes(randomResults());
    setHasVoted(false);
    setUserVote("");
    setTickerMsg("");
    setStep("input");
    setError("");
  };

  // Helper: generate ticker text mock
  function getMockTicker(scenario, pollQ, vote) {
    // A few random options for demo ticker feedback
    const options = [
      "Fans are buzzing after this close poll!",
      "The stadium reacts: huge votes for 'Yes' in this scenario!",
      "Pulse of the crowd – most fans are optimistic for the batter.",
      "A dramatic split! The poll has both camps fired up.",
      "The poll has closed. Cricket fans never disappoint with their passion!",
      "Thousands voted – tension at its peak!",
    ];
    return options[Math.floor(Math.random() * options.length)];
  }

  // --- Render ---
  return (
    <div
      className="App"
      style={{
        background: COLORS.primary,
        color: "#222e3a",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <header
        className="App-header"
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          maxWidth: 500,
          margin: "0 auto",
          width: isMobile ? "98vw" : "95vw",
        }}
      >
        {/* Theme toggle */}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
        {/* Title */}
        <div style={{ marginBottom: 26 }}>
          <h1
            style={{
              color: COLORS.accent,
              fontWeight: 900,
              fontSize: isMobile ? "2rem" : "2.6rem",
              letterSpacing: 0,
              marginBottom: 7,
              textShadow: "0 0 3px #b9d4fa",
            }}
          >
            Cricket ScenarioX
          </h1>
          <div
            style={{
              color: COLORS.secondary,
              fontSize: 18,
              fontWeight: 500,
              marginBottom: 0,
              letterSpacing: 0.2,
            }}
          >
            Dynamic match moments & polls • Sports-fan interactive
          </div>
        </div>
        {/* --- Input Section --- */}
        {(step === "input" || step === "loading") && (
          <form
            onSubmit={handleSubmit}
            className="input-form"
            style={{
              background: "#fff",
              padding: isMobile ? 18 : 26,
              borderRadius: 14,
              boxShadow: "0 4px 16px rgba(70,122,236,0.08)",
              minWidth: isMobile ? "100%" : 340,
              border: `1.5px solid ${COLORS.secondary}`,
              marginBottom: 32,
              width: isMobile ? "97vw" : 360,
              opacity: step === "loading" ? 0.7 : 1,
              pointerEvents: step === "loading" ? "none" : undefined,
              transition: "all 0.22s",
              position: "relative",
            }}
          >
            <h2
              style={{
                color: COLORS.accent,
                fontWeight: 700,
                fontSize: 22,
                marginBottom: 14,
                marginTop: 2,
              }}
            >
              Cricket Match Details
            </h2>
            {error && (
              <div
                style={{
                  color: COLORS.error,
                  marginBottom: 7,
                  fontWeight: 600,
                  fontSize: 15,
                }}
              >
                {error}
              </div>
            )}
            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>Batter</label>
              <input
                required
                name="player"
                value={form.player}
                onChange={handleChange}
                style={inputStyle}
                autoFocus
                placeholder="e.g., Virat Kohli"
              />
            </div>
            <div
              style={{
                marginBottom: 10,
                display: "flex",
                gap: 13,
                flexDirection: "row",
              }}
            >
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Runs</label>
                <input
                  required
                  name="runs"
                  value={form.runs}
                  onChange={handleChange}
                  style={{ ...inputStyle, width: "100%" }}
                  min={0}
                  type="number"
                  placeholder="34"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Balls</label>
                <input
                  required
                  name="balls"
                  value={form.balls}
                  onChange={handleChange}
                  style={{ ...inputStyle, width: "100%" }}
                  min={1}
                  type="number"
                  placeholder="26"
                />
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>Opponent</label>
              <input
                required
                name="opponent"
                value={form.opponent}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Pakistan"
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Match Stage</label>
              <input
                required
                name="matchStage"
                value={form.matchStage}
                onChange={handleChange}
                style={inputStyle}
                placeholder="e.g., Final, Powerplay, Last Over"
              />
            </div>
            <button
              disabled={step === "loading"}
              className="btn"
              style={buttonStyle}
              type="submit"
            >
              {step === "loading" ? (
                <>
                  <span
                    className="loading-spinner"
                    style={{
                      border: `2.5px solid ${COLORS.accent}`,
                      borderTop: "2.5px solid #fff",
                      borderRadius: "50%",
                      width: 14,
                      height: 14,
                      marginRight: 8,
                      display: "inline-block",
                      animation: "spin 0.75s linear infinite",
                      verticalAlign: "middle",
                    }}
                  ></span>
                  Generating...
                </>
              ) : (
                "Generate Scenario & Poll"
              )}
            </button>
            <style>
              {`
              @keyframes spin {
                0% { transform: rotate(0deg);}
                100% { transform: rotate(360deg);}
              }
              `}
            </style>
          </form>
        )}
        {/* --- Scenario & Poll Section --- */}
        {(step === "scenario" || step === "voted" || step === "ticker") && (
          <div
            className="scenario-summary"
            style={{
              background: "#fff",
              borderRadius: 13,
              padding: isMobile ? "18px 8px 12px 8px" : "26px 18px 16px 18px",
              width: isMobile ? "99vw" : 390,
              minWidth: 215,
              boxShadow: "0 2px 12px rgba(70,122,230,0.10)",
              border: `1.5px solid ${COLORS.secondary}`,
              marginBottom: 16,
              position: "relative",
              transition: "box-shadow 0.27s",
            }}
          >
            <div
              style={{
                color: COLORS.accent,
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: 0.6,
                textTransform: "uppercase",
                marginBottom: 7,
              }}
            >
              Live Scenario
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: isMobile ? 15 : 18,
                marginBottom: 14,
                color: "#252c35",
                textAlign: "center",
                minHeight: 48,
              }}
              aria-label="Cricket scenario summary"
            >
              {scenarioSummary || demoScenario}
            </div>
            <div
              style={{
                borderTop: `1.5px solid ${COLORS.accent}`,
                opacity: 0.2,
                margin: "0 0 13px 0",
              }}
            ></div>
            <div
              className="poll-question"
              style={{
                color: COLORS.secondary,
                fontWeight: 600,
                fontSize: isMobile ? 15.5 : 18,
                marginBottom: 12,
                textAlign: "center",
                minHeight: 24,
              }}
              aria-label="Poll question"
            >
              {pollQuestion || demoPollQ}
            </div>
            {/* Poll voting UI */}
            {step !== "ticker" && (
              <div
                className="poll-options"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 20,
                  marginBottom: 6,
                }}
              >
                <button
                  className="btn"
                  style={{
                    ...buttonStyle,
                    borderColor:
                      userVote === "yes" ? COLORS.accent : COLORS.secondary,
                    background:
                      hasVoted && userVote === "yes"
                        ? COLORS.accent
                        : "#f3f6fe",
                    color:
                      hasVoted && userVote === "yes" ? "#fff" : "#1c2c41",
                  }}
                  onClick={() => handleVote("yes")}
                  disabled={hasVoted}
                  aria-pressed={userVote === "yes"}
                >
                  Yes
                </button>
                <button
                  className="btn"
                  style={{
                    ...buttonStyle,
                    borderColor:
                      userVote === "no" ? COLORS.accent : COLORS.secondary,
                    background:
                      hasVoted && userVote === "no"
                        ? COLORS.accent
                        : "#f3f6fe",
                    color: hasVoted && userVote === "no" ? "#fff" : "#1c2c41",
                  }}
                  onClick={() => handleVote("no")}
                  disabled={hasVoted}
                  aria-pressed={userVote === "no"}
                >
                  No
                </button>
              </div>
            )}
            {/* Results */}
            {(hasVoted || step === "ticker") && (
              <div
                className="poll-results"
                style={{
                  marginTop: 3,
                  fontSize: 15.3,
                  fontWeight: 500,
                  color: "#244d7d",
                }}
                aria-live="polite"
              >
                <span
                  style={{
                    color: COLORS.secondary,
                    fontWeight: userVote === "yes" ? 700 : 500,
                  }}
                >
                  Yes: {votes.yes}
                </span>{" "}
                |{" "}
                <span
                  style={{
                    color: COLORS.secondary,
                    fontWeight: userVote === "no" ? 700 : 500,
                  }}
                >
                  No: {votes.no}
                </span>
              </div>
            )}
            {(hasVoted || step === "ticker") && (
              <div style={{ marginTop: 11, textAlign: "center" }}>
                <button
                  className="btn"
                  style={{
                    ...buttonStyle,
                    fontSize: 15,
                    background: "#fff",
                    color: COLORS.secondary,
                    border: `1.2px solid ${COLORS.secondary}`,
                    marginTop: 2,
                  }}
                  onClick={handleReset}
                >
                  New Scenario
                </button>
              </div>
            )}
          </div>
        )}
        {/* --- Ticker --- */}
        {step === "ticker" && (
          <Ticker
            message={tickerMsg || demoTicker}
            accent={COLORS.accent}
            key="ticker"
          />
        )}
        {/* App Attribution / Footer */}
        <div style={{ marginTop: 34, marginBottom: 8 }}>
          <small
            style={{
              color: "#929aa8",
              fontWeight: 400,
              fontSize: 14,
              letterSpacing: 0.1,
            }}
          >
            <span style={{ color: COLORS.secondary, fontWeight: 500 }}>
              Powered by OpenAI (demo only)
            </span>{" "}
            &nbsp; | &nbsp;
            <span style={{ color: COLORS.accent }}>Cricket ScenarioX</span>
          </small>
        </div>
      </header>
    </div>
  );
}

// Helper: sports ticker bar
function Ticker({ message, accent }) {
  return (
    <div
      className="ticker-container"
      style={{
        width: "100vw",
        maxWidth: 580,
        margin: "18px auto 0 auto",
        position: "relative",
        zIndex: 30,
      }}
    >
      <div
        className="ticker"
        style={{
          width: "100%",
          background: accent,
          color: "#fff",
          borderRadius: "0 0 11px 11px",
          borderTop: ".5px solid #fff",
          boxShadow: "0 3px 10px rgba(81,150,240,0.16)",
          fontWeight: 600,
          fontSize: 17,
          padding: "12px 0",
          margin: "0 auto",
          textAlign: "center",
          letterSpacing: 1,
          animation: "ticker-appear 0.65s cubic-bezier(.28,.7,.56,1.0) forwards",
          minHeight: 25,
        }}
      >
        <span>{message}</span>
      </div>
      <style>
        {`
        @keyframes ticker-appear {
          from { opacity: 0; transform: translateY(-48px);}
          to   { opacity: 1; transform: translateY(0);}
        }
        `}
      </style>
    </div>
  );
}

// Inline styles
const labelStyle = {
  fontSize: 14,
  fontWeight: 600,
  color: "#466ac9",
  marginBottom: 2,
  display: "block",
};
const inputStyle = {
  border: "1px solid #dce5f3",
  borderRadius: 8,
  padding: "7px 12px",
  fontSize: 15,
  color: "#1d2547",
  outline: "none",
  width: "100%",
  background: "#f8fafc",
  marginTop: 2,
  transition: "box-shadow 0.19s",
};
const buttonStyle = {
  background: COLORS.accent,
  color: "#fff",
  fontWeight: 700,
  fontSize: 16.5,
  padding: "10px 30px",
  border: `2.3px solid ${COLORS.accent}`,
  borderRadius: 9,
  margin: "10px 0",
  cursor: "pointer",
  transition: "all 0.14s",
  boxShadow: "0 2px 4px rgba(81,150,240,0.08)",
};

export default App;
