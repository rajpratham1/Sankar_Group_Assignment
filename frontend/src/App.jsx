import React from "react";
import { Toaster } from "react-hot-toast";
import Dashboard from "./components/Dashboard";
import LeadForm from "./components/LeadForm";
import LeadList from "./components/LeadList";
import useLeads from "./hooks/useLeads";
import "./styles/global.css";
import "./App.css";

function App() {
  const {
    leads,
    stats,
    loading,
    statsLoading,
    filters,
    addLead,
    updateStatus,
    deleteLead,
    applyFilters,
  } = useLeads();

  return (
    <div className="app">
      {/* ─── Sidebar ─────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">⚡</span>
          <div>
            <span className="brand-name">LeadCRM</span>
            <span className="brand-tagline">Mini CRM System</span>
          </div>
        </div>

        <nav className="nav">
          <a href="#dashboard" className="nav-item active">
            <span>📊</span> Dashboard
          </a>
          <a href="#leads" className="nav-item">
            <span>👥</span> Leads
          </a>
        </nav>

        <div className="sidebar-footer">
          <p className="footer-note">Built with Node.js + React + PostgreSQL</p>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────────────── */}
      <main className="main-content">
        <header className="page-header">
          <div>
            <h1 className="page-title">Lead Management</h1>
            <p className="page-subtitle">Track and manage your sales pipeline</p>
          </div>
        </header>

        <div className="content-body">
          {/* Dashboard Stats */}
          <section id="dashboard">
            <Dashboard stats={stats} loading={statsLoading} />
          </section>

          {/* Add Lead Form */}
          <section id="add-lead">
            <LeadForm onSubmit={addLead} />
          </section>

          {/* Leads List */}
          <section id="leads">
            <LeadList
              leads={leads}
              loading={loading}
              filters={filters}
              onFilterChange={applyFilters}
              onUpdateStatus={updateStatus}
              onDelete={deleteLead}
            />
          </section>
        </div>
      </main>

      {/* ─── Toast Notifications ──────────────────────────────── */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#181c26",
            color: "#f0f2f8",
            border: "1px solid #252a38",
            borderRadius: "10px",
            fontFamily: "'Inter', sans-serif",
            fontSize: "14px",
          },
          success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
          error:   { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
        }}
      />
    </div>
  );
}

export default App;
