import React, { useState, useEffect } from "react";
import "./App.css";

// NOTE: Insert your OpenAI API key securely for development.
// In production, use a backend proxy for security.
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || "";

// Accent and sports brand colors
const COLORS = {
  primary: "#e9eaed",
  secondary: "#5491f2",
  accent: "#5196f0",
};

const initialForm = {
  player: "",
  runs: "",
  balls: "",
  opponent: "",
  matchStage: "",
};

// PUBLIC_INTERFACE
function App() {
  // Theme state
  const [theme, setTheme] = useState("light");

  // Match form input states
  const [form, setForm] = useState(initialForm);

  // App steps: input, loading, scenario, poll, ticker
  const [step, setStep] = useState("input");

  // Data states
  const [scenarioSummary, setScenarioSummary] = useState("");
  const [pollQuestion, setPollQuestion] = useState("");
  const [votes, setVotes] = useState({ yes: 0, no: 0 });
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState(""); // Capture user's choice
  const [tickerMsg, setTickerMsg] = useState("");
  const [error, setError] = useState("");

  // Responsive style helpers
  const isMobile = window.matchMedia("(max-width: 600px)").matches;

  // Effect to propagate theme to html
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // PUBLIC_INTERFACE
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // PUBLIC_INTERFACE
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStep("loading");

    try {
      // Call OpenAI for scenario summary
      const scenarioPrompt = `
You are a cricket commentator summarizing dramatic match situations for an interactive fan poll.
Summarize the following cricket match scenario in 2-3 engaging sentences:

- Player: ${form.player}
- Current runs: ${form.runs}
- Balls faced: ${form.balls}
- Opponent: ${form.opponent}
- Match stage: ${form.matchStage}

Make the summary exciting and sports-broadcast style.`;

      const scenarioSummary = await getOpenAICompletion(scenarioPrompt, 100, "scenario");
      setScenarioSummary(scenarioSummary);

      // Generate poll question
      const pollPrompt = `
Given this cricket situation:
"${scenarioSummary}"

Write one short Yes/No question that would get fans to predict the next key event (e.g., "Will the batter reach 50 in this over?"). Only the question, no explanations.`;

      const pollQuestion = await getOpenAICompletion(pollPrompt, 40, "poll");
      setPollQuestion(pollQuestion.replace(/^[^a-zA-Z0-9]+|\\s+$/g, ""));

      setVotes({ yes: 0, no: 0 });
      setUserVote("");
      setHasVoted(false);
      setStep("scenario");
    } catch (err) {
      setError("Failed to contact OpenAI. Please try again.");
      setStep("input");
    }
  };

  // PUBLIC_INTERFACE
  async function getOpenAICompletion(prompt, max_tokens = 120, cacheKey = "") {
    // Simple in-memory cache if same prompt is sent (session-only)
    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API Key not set.");
    }

    const endpoint = "https://api.openai.com/v1/chat/completions";
    const reqBody = {
      model: "gpt-3.5-turbo",
      max_tokens,
      temperature: 0.85,
      messages: [{ role: "user", content: prompt }],
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + OPENAI_API_KEY,
      },
      body: JSON.stringify(reqBody),
    });

    if (!res.ok) {
      throw new Error(`OpenAI Error: ${res.statusText}`);
    }
    const data = await res.json();
    return (
      data.choices?.[0]?.message?.content?.trim() ||
      data.choices?.[0]?.text?.trim() ||
      "Error: No response"
    );
  }

  // PUBLIC_INTERFACE
  const handleVote = (vote) => {
    // Allow voting only once
    if (hasVoted) return;
    setVotes((prev) => ({
      ...prev,
      [vote]: prev[vote] + 1,
    }));
    setUserVote(vote);
    setHasVoted(true);
    setStep("ticker");

    // After a short delay, show ticker
    setTimeout(() => {
      getTickerMessage().catch(() => {
        setTickerMsg("Fans are buzzing after this poll!");
      });
    }, 600);
  };

  // PUBLIC_INTERFACE
  async function getTickerMessage() {
    // Only show ticker after voting and scenario/poll
    const tickerPrompt = `
You're a cricket stadium ticker announcer summarizing social buzz after a poll:
Scenario: "${scenarioSummary}"
Poll: "${pollQuestion}"
Fan votes: Yes: ${votes.yes + (userVote === "yes" ? 1 : 0)}, No: ${votes.no + (userVote === "no" ? 1 : 0)}
Write a 1-sentence ticker message celebrating engagement or noting the results in an exciting, witty tone.
No hashtags or emojis.`;
    try {
      const msg = await getOpenAICompletion(tickerPrompt, 50, "ticker");
      setTickerMsg(msg);
    } catch (e) {
      setTickerMsg("Another exciting poll – thanks for voting!");
    }
  }

  // PUBLIC_INTERFACE
  const handleReset = () => {
    setForm(initialForm);
    setScenarioSummary("");
    setPollQuestion("");
    setVotes({ yes: 0, no: 0 });
    setHasVoted(false);
    setUserVote("");
    setTickerMsg("");
    setStep("input");
    setError("");
  };

  // Core UI
  return (
    <div
      className="App"
      style={{
        minHeight: "100vh",
        background: COLORS.primary,
        color: "#222e3a",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header className="App-header" style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        maxWidth: 480,
        margin: "0 auto",
        width: isMobile ? "98vw" : "90vw",
      }}>
        <button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{
            color: COLORS.accent,
            fontWeight: 900,
            fontSize: "2.4rem",
            marginBottom: 6,
            letterSpacing: 0,
            textShadow: "0 0 3px #b9d4fa",
          }}>Cricket ScenarioX</h1>
          <div style={{
            color: COLORS.secondary,
            fontSize: 18,
            marginBottom: 0,
            fontWeight: 500,
            letterSpacing: 0.3,
          }}>
            Dynamic match moments and polls • Sports-fan interactive
          </div>
        </div>

        {/* Step: Input */}
        {(step === "input" || step === "loading") &&
          <form onSubmit={handleSubmit} className="input-form" style={{
            background: "#fff",
            padding: 26,
            borderRadius: 14,
            boxShadow: "0 4px 16px rgba(70,122,236,0.08)",
            minWidth: isMobile ? "100%" : 340,
            border: `1.5px solid ${COLORS.secondary}`,
            marginBottom: 30,
            width: isMobile ? "95vw" : 340,
            opacity: step === "loading" ? 0.72 : 1,
            pointerEvents: step === "loading" ? "none" : undefined,
            transition: "all 0.24s"
          }}>
            <h2 style={{ color: COLORS.accent, fontWeight: 700, fontSize: 22, marginBottom: 18 }}>Cricket Match Details</h2>
            {error && <div style={{color:"crimson", marginBottom: 10, fontWeight:500}}>{error}</div>}
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Batter</label>
              <input required name="player" value={form.player} onChange={handleChange} style={inputStyle} autoFocus placeholder="e.g., Virat Kohli"/>
            </div>
            <div style={{ marginBottom: 12, display:"flex", gap:12 }}>
              <div>
                <label style={labelStyle}>Runs</label>
                <input required name="runs" value={form.runs} onChange={handleChange} style={{...inputStyle, width:60}} min={0} type="number" placeholder="34"/>
              </div>
              <div>
                <label style={labelStyle}>Balls</label>
                <input required name="balls" value={form.balls} onChange={handleChange} style={{...inputStyle, width:60}} min={1} type="number" placeholder="26"/>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Opponent</label>
              <input required name="opponent" value={form.opponent} onChange={handleChange} style={inputStyle} placeholder="Pakistan"/>
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Match Stage</label>
              <input required name="matchStage" value={form.matchStage} onChange={handleChange} style={inputStyle} placeholder="e.g., Final, Powerplay, Last Over"/>
            </div>
            <button
              disabled={step === "loading"}
              className="btn"
              style={buttonStyle}
              type="submit"
            >{step === "loading" ? "Generating..." : "Generate Scenario & Poll"}</button>
          </form>
        }

        {/* Step: Scenario Summary & Poll */}
        {(step === "scenario" || step === "ticker") && (
          <div className="scenario-summary" style={{
            background: "#fff",
            borderRadius: 13,
            padding: "26px 18px 16px 18px",
            width: isMobile ? "96vw" : 390,
            minWidth: 240,
            boxShadow: "0 2px 10px rgba(70,122,230,0.12)",
            border: `1.5px solid ${COLORS.secondary}`,
            marginBottom: 18
          }}>
            <div style={{
              color: COLORS.accent,
              fontWeight: 600,
              fontSize: 15,
              letterSpacing: 1,
              textTransform: "uppercase",
              marginBottom: 8
            }}>
              Live Scenario
            </div>
            <div style={{
              fontWeight: 700,
              fontSize: 18,
              marginBottom: 18,
              color: "#252c35"
            }}>
              {scenarioSummary}
            </div>
            <div className="scenario-divider" style={{
              borderTop: `1.5px solid ${COLORS.accent}`,
              opacity: 0.19,
              margin: "0 0 12px 0"
            }}></div>
            <div className="poll-question" style={{
              color: COLORS.secondary,
              fontWeight: 600,
              fontSize: 18,
              marginBottom: 14
            }}>
              {pollQuestion}
            </div>
            <div className="poll-options" style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              gap: 26,
              marginBottom: 6
            }}>
              <button
                className="btn"
                style={{
                  ...buttonStyle,
                  borderColor: userVote === "yes" ? COLORS.accent : COLORS.secondary,
                  background: hasVoted && userVote === "yes" ? COLORS.accent : "#f3f6fe",
                  color: hasVoted && userVote === "yes" ? "#fff" : "#1c2c41",
                }}
                onClick={() => handleVote("yes")}
                disabled={hasVoted}
                aria-pressed={userVote === "yes"}
              >Yes</button>
              <button
                className="btn"
                style={{
                  ...buttonStyle,
                  borderColor: userVote === "no" ? COLORS.accent : COLORS.secondary,
                  background: hasVoted && userVote === "no" ? COLORS.accent : "#f3f6fe",
                  color: hasVoted && userVote === "no" ? "#fff" : "#1c2c41",
                }}
                onClick={() => handleVote("no")}
                disabled={hasVoted}
                aria-pressed={userVote === "no"}
              >No</button>
            </div>
            {(hasVoted || step === "ticker") && (
              <div className="poll-results" style={{
                marginTop: 4,
                fontSize: 15,
                color: "#1c334f",
                fontWeight: 500
              }}>
                <span
                  style={{
                    color: COLORS.secondary,
                    fontWeight: userVote === "yes" ? 700 : 500
                  }}
                >Yes: {votes.yes + (userVote === "yes" ? 1 : 0)}
                </span>{" "}
                |{" "}
                <span
                  style={{ color: COLORS.secondary, fontWeight: userVote === "no" ? 700 : 500 }}
                >No: {votes.no + (userVote === "no" ? 1 : 0)}</span>
              </div>
            )}
            {(hasVoted || step === "ticker") && (
              <div style={{
                marginTop: 10,
                textAlign: "center"
              }}>
                <button className="btn" style={{
                  ...buttonStyle,
                  fontSize: 15,
                  background: "#fff",
                  color: COLORS.secondary,
                  border: `1.2px solid ${COLORS.secondary}`,
                  marginTop: 2
                }} onClick={handleReset}>New Scenario</button>
              </div>
            )}
          </div>
        )}

        {/* Step: Ticker (after voting) */}
        {step === "ticker" && (
          <Ticker message={tickerMsg} accent={COLORS.accent} />
        )}
        <div style={{marginTop: 34, marginBottom:6}}>
            <small style={{color:"#929aa8", fontWeight:400, fontSize:14}}>
               <span style={{color:COLORS.secondary}}>Powered by OpenAI GPT</span> &nbsp; | &nbsp; Demo only
            </small>
        </div>
      </header>
    </div>
  );
}

// Helper: sports ticker bar
function Ticker({ message, accent }) {
  return (
    <div style={{
      width: "100vw",
      maxWidth: 580,
      margin: "16px auto 0 auto",
      position: "relative"
    }}>
      <div
        className="ticker"
        style={{
          width: "100%",
          background: accent,
          color: "#fff",
          borderRadius: "0 0 11px 11px",
          borderTop: `.5px solid #fff`,
          boxShadow: "0 3px 10px rgba(81,150,240,0.13)",
          fontWeight: 600,
          fontSize: 17,
          padding: "10px 0",
          margin: "0 auto",
          textAlign: "center",
          letterSpacing: 1,
          animation: "ticker-appear 0.6s cubic-bezier(.28,.7,.56,1.0) forwards",
        }}
      >
        <span>{message}</span>
      </div>
      <style>
        {`
        @keyframes ticker-appear {
          from { opacity: 0; transform: translateY(-20px);}
          to   { opacity: 1; transform: translateY(0);}
        }
        `}
      </style>
    </div>
  );
}

const labelStyle = {
  fontSize: 14,
  fontWeight: 600,
  color: "#466ac9",
  marginBottom: 2,
  display: "block"
};
const inputStyle = {
  border: "1px solid #dce5f3",
  borderRadius: 8,
  padding: "7px 12px",
  fontSize: 15,
  color: "#1d2547",
  outline: "none",
  width: "100%",
  background: "#f5f8fd",
  marginTop: 2,
  transition: "box-shadow 0.2s",
};
const buttonStyle = {
  background: COLORS.accent,
  color: "#fff",
  fontWeight: 700,
  fontSize: 17,
  padding: "10px 32px",
  border: `2.5px solid ${COLORS.accent}`,
  borderRadius: 9,
  margin: "8px 0",
  cursor: "pointer",
  transition: "all 0.17s",
  boxShadow: "0 2px 4px rgba(81,150,240,0.09)",
};

export default App;
