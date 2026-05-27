import React from "react";
import "./Dashboard.css";

const StatCard = ({ label, value, color, icon }) => (
  <div className="stat-card" style={{ "--accent-color": color }}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-info">
      <span className="stat-value">{value ?? "—"}</span>
      <span className="stat-label">{label}</span>
    </div>
  </div>
);

const Dashboard = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="dashboard-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="stat-card skeleton" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    { label: "Total Leads",     value: stats.total,         color: "#4f7cff", icon: "👥" },
    { label: "New",             value: stats.new_leads,     color: "#3b82f6", icon: "🆕" },
    { label: "Interested",      value: stats.interested,    color: "#10b981", icon: "✅" },
    { label: "Not Interested",  value: stats.not_interested,color: "#ef4444", icon: "❌" },
    { label: "Converted",       value: stats.converted,     color: "#8b5cf6", icon: "🏆" },
    { label: "Via WhatsApp",    value: stats.from_whatsapp, color: "#25d366", icon: "💬" },
  ];

  const conversionRate =
    stats.total > 0
      ? Math.round((stats.converted / stats.total) * 100)
      : 0;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Overview</h2>
        <span className="conversion-badge">
          {conversionRate}% Conversion Rate
        </span>
      </div>
      <div className="dashboard-grid">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
