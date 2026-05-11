import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import axios from "axios";

const COLORS = { low: "#22c55e", medium: "#f59e0b", high: "#ef4444" };

function App() {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ low: 0, medium: 0, high: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8085/openidm/managed/smartAuthAudit?_queryFilter=true&_pageSize=20&_sortKeys=-timestamp",
        { headers: { "X-OpenIDM-Username": "openidm-admin", "X-OpenIDM-Password": "openidm-admin" } }
      );
      const data = res.data.result || [];
      setEvents(data);
      const low = data.filter(e => e.riskLevel === "low").length;
      const medium = data.filter(e => e.riskLevel === "medium").length;
      const high = data.filter(e => e.riskLevel === "high").length;
      setStats({ low, medium, high, total: data.length });
    } catch (e) {
      console.error("Failed to fetch events", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 10000);
    return () => clearInterval(interval);
  }, []);

  const testRisk = async (scenario) => {
    setTesting(true);
    const scenarios = {
      low: { user_id: "testuser", ip_address: "192.168.1.1", user_agent: "Chrome", login_hour: 14, failed_attempts_24h: 0, is_new_device: 0, is_unusual_country: 0, login_day: 1 },
      medium: { user_id: "testuser", ip_address: "192.168.1.1", user_agent: "Chrome", login_hour: 23, failed_attempts_24h: 3, is_new_device: 0, is_unusual_country: 0, login_day: 1 },
      high: { user_id: "testuser", ip_address: "10.0.0.1", user_agent: "Chrome", login_hour: 3, failed_attempts_24h: 6, is_new_device: 1, is_unusual_country: 1, login_day: 6 }
    };
    try {
      const res = await axios.post("http://localhost:8000/risk-score", scenarios[scenario]);
      setTestResult(res.data);
      setTimeout(fetchEvents, 2000);
    } catch (e) {
      console.error("Test failed", e);
    }
    setTesting(false);
  };

  const pieData = [
    { name: "Low", value: stats.low },
    { name: "Medium", value: stats.medium },
    { name: "High", value: stats.high }
  ].filter(d => d.value > 0);

  const barData = [
    { name: "Low", count: stats.low, fill: "#22c55e" },
    { name: "Medium", count: stats.medium, fill: "#f59e0b" },
    { name: "High", count: stats.high, fill: "#ef4444" }
  ];

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "#f1f5f9", fontFamily: "system-ui, sans-serif", padding: "24px" }}>
      
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#38bdf8", margin: 0 }}>
          🔐 SmartAuth — Live Risk Dashboard
        </h1>
        <p style={{ color: "#94a3b8", margin: "4px 0 0 0" }}>
          AI-driven adaptive authentication — ForgeRock AM 7 + XGBoost
        </p>
      </div>

      {/* Stats cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
        {[
          { label: "Total Events", value: stats.total, color: "#38bdf8" },
          { label: "Low Risk", value: stats.low, color: "#22c55e" },
          { label: "Medium Risk", value: stats.medium, color: "#f59e0b" },
          { label: "High Risk", value: stats.high, color: "#ef4444" }
        ].map(card => (
          <div key={card.label} style={{ background: "#1e293b", borderRadius: "12px", padding: "20px", borderLeft: `4px solid ${card.color}` }}>
            <p style={{ color: "#94a3b8", margin: "0 0 8px 0", fontSize: "14px" }}>{card.label}</p>
            <p style={{ color: card.color, fontSize: "36px", fontWeight: "bold", margin: 0 }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", marginBottom: "32px" }}>
        <div style={{ background: "#1e293b", borderRadius: "12px", padding: "20px" }}>
          <h2 style={{ color: "#e2e8f0", fontSize: "16px", marginTop: 0 }}>Risk Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
              <Bar dataKey="count">
                {barData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: "#1e293b", borderRadius: "12px", padding: "20px" }}>
          <h2 style={{ color: "#e2e8f0", fontSize: "16px", marginTop: 0 }}>Risk Breakdown</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({name, value}) => `${name}: ${value}`}>
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[entry.name.toLowerCase()]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Test buttons */}
      <div style={{ background: "#1e293b", borderRadius: "12px", padding: "20px", marginBottom: "32px" }}>
        <h2 style={{ color: "#e2e8f0", fontSize: "16px", marginTop: 0 }}>Test Risk Engine</h2>
        <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
          {["low", "medium", "high"].map(level => (
            <button key={level} onClick={() => testRisk(level)} disabled={testing}
              style={{ padding: "10px 24px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "14px",
                background: COLORS[level], color: "#fff", opacity: testing ? 0.6 : 1 }}>
              Test {level.charAt(0).toUpperCase() + level.slice(1)} Risk
            </button>
          ))}
        </div>
        {testResult && (
          <div style={{ background: "#0f172a", borderRadius: "8px", padding: "16px" }}>
            <p style={{ margin: 0, color: COLORS[testResult.risk_level] }}>
              ● {testResult.risk_level.toUpperCase()} RISK — Score: {testResult.score} — Action: {testResult.action.toUpperCase()}
            </p>
            {testResult.top_factors.length > 0 && (
              <p style={{ margin: "8px 0 0 0", color: "#94a3b8", fontSize: "14px" }}>
                Factors: {testResult.top_factors.join(", ")}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Events table */}
      <div style={{ background: "#1e293b", borderRadius: "12px", padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ color: "#e2e8f0", fontSize: "16px", margin: 0 }}>Recent Auth Events</h2>
          <button onClick={fetchEvents} style={{ padding: "6px 16px", borderRadius: "6px", border: "1px solid #334155", background: "transparent", color: "#94a3b8", cursor: "pointer" }}>
            Refresh
          </button>
        </div>
        {loading ? (
          <p style={{ color: "#94a3b8" }}>Loading...</p>
        ) : events.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>No events yet — trigger a login or use the test buttons above.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ color: "#64748b", textAlign: "left" }}>
                {["User", "Risk Level", "Action", "Score", "Hour", "IP", "Browser", "Timestamp"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", borderBottom: "1px solid #334155" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((e, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #1e293b" }}>
                  <td style={{ padding: "10px 12px", color: "#e2e8f0" }}>{e.userId}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ background: COLORS[e.riskLevel] + "33", color: COLORS[e.riskLevel], padding: "2px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "bold" }}>
                      {e.riskLevel}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", color: "#94a3b8" }}>{e.riskAction}</td>
                  <td style={{ padding: "10px 12px", color: "#94a3b8" }}>{e.riskScore}</td>
                  <td style={{ padding: "10px 12px", color: "#94a3b8" }}>{e.loginHour}</td>
                  <td style={{ padding: "10px 12px", color: "#94a3b8" }}>{e.ipAddress}</td>
                  <td style={{ padding: "10px 12px", color: "#94a3b8" }}>{e.browser}</td>
                  <td style={{ padding: "10px 12px", color: "#94a3b8" }}>{e.timestamp?.substring(0, 19)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}

export default App;
