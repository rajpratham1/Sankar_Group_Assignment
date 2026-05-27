import React, { useEffect, useRef, useState } from "react";
import "./LeadList.css";

const STATUSES = ["New", "Interested", "Not Interested", "Converted"];
const SOURCES  = ["Call", "WhatsApp", "Field"];

const statusClass = (s) => s.toLowerCase().replace(/\s+/g, "-");
const sourceClass  = (s) => s.toLowerCase();

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

// ─── Status Dropdown ──────────────────────────────────────────────────────────
const StatusDropdown = ({ lead, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  const handleSelect = async (status) => {
    if (status === lead.status) { setOpen(false); return; }
    try {
      setUpdating(true);
      setOpen(false);
      await onUpdate(lead.id, status, lead.notes);
    } catch (_) {}
    finally { setUpdating(false); }
  };

  return (
    <div className="status-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className={`badge badge-${statusClass(lead.status)} status-btn`}
        onClick={() => setOpen((v) => !v)}
        disabled={updating}
      >
        {updating ? <span className="spinner" style={{ width: 10, height: 10 }} /> : null}
        {lead.status}
        <span className="chevron">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="status-menu">
          {STATUSES.map((s) => (
            <button
              type="button"
              key={s}
              className={`status-option badge badge-${statusClass(s)} ${s === lead.status ? "active" : ""}`}
              onClick={() => handleSelect(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Single Lead Row ──────────────────────────────────────────────────────────
const LeadRow = ({ lead, onUpdateStatus, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); return; }
    await onDelete(lead.id);
  };

  return (
    <div className="lead-row fade-in">
      <div className="lead-main">
        <div className="lead-avatar">{lead.name.charAt(0).toUpperCase()}</div>
        <div className="lead-info">
          <span className="lead-name">{lead.name}</span>
          <a className="lead-phone" href={`tel:${lead.phone}`}>{lead.phone}</a>
          {lead.notes && <p className="lead-notes">{lead.notes}</p>}
        </div>
      </div>

      <div className="lead-meta">
        <span className={`badge badge-${sourceClass(lead.source)}`}>{lead.source}</span>
        <span className="lead-date">{formatDate(lead.created_at)}</span>
      </div>

      <div className="lead-actions">
        <StatusDropdown lead={lead} onUpdate={onUpdateStatus} />
        <button
          className={`btn btn-sm ${confirmDelete ? "btn-danger" : "btn-ghost"}`}
          onClick={handleDelete}
          title={confirmDelete ? "Click again to confirm" : "Delete lead"}
        >
          {confirmDelete ? "Confirm?" : "🗑"}
        </button>
      </div>
    </div>
  );
};

// ─── Filters Bar ──────────────────────────────────────────────────────────────
const FiltersBar = ({ filters, onFilterChange }) => {
  return (
    <div className="filters-bar">
      <div className="search-wrap">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="form-input search-input"
          placeholder="Search by name or phone..."
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
        />
      </div>
      <select
        className="form-select filter-select"
        value={filters.status}
        onChange={(e) => onFilterChange({ status: e.target.value })}
      >
        <option value="">All Statuses</option>
        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <select
        className="form-select filter-select"
        value={filters.source}
        onChange={(e) => onFilterChange({ source: e.target.value })}
      >
        <option value="">All Sources</option>
        {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );
};

// ─── Lead List (Main Export) ──────────────────────────────────────────────────
const LeadList = ({ leads, loading, filters, onFilterChange, onUpdateStatus, onDelete }) => {
  return (
    <div className="lead-list-wrapper card">
      <div className="list-header">
        <div>
          <h2 className="form-title">All Leads</h2>
          <p className="form-subtitle">{leads.length} lead{leads.length !== 1 ? "s" : ""} found</p>
        </div>
      </div>

      <FiltersBar filters={filters} onFilterChange={onFilterChange} />

      <div className="lead-list">
        {loading ? (
          <div className="list-loading">
            <span className="spinner" />
            <span>Loading leads...</span>
          </div>
        ) : leads.length === 0 ? (
          <div className="list-empty">
            <span className="empty-icon">📋</span>
            <p>No leads found</p>
            <span>Try adjusting your filters or add a new lead</span>
          </div>
        ) : (
          leads.map((lead) => (
            <LeadRow
              key={lead.id}
              lead={lead}
              onUpdateStatus={onUpdateStatus}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default LeadList;
