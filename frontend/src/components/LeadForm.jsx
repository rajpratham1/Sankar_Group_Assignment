import React, { useState } from "react";
import "./LeadForm.css";

const INITIAL_FORM = { name: "", phone: "", source: "", notes: "" };

const SOURCES = ["Call", "WhatsApp", "Field"];

const validate = (data) => {
  const errors = {};
  if (!data.name.trim()) {
    errors.name = "Name is required";
  } else if (data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }
  if (!data.phone.trim()) {
    errors.phone = "Phone number is required";
  } else if (!/^[+]?[\d\s\-().]{7,20}$/.test(data.phone.trim())) {
    errors.phone = "Enter a valid phone number";
  }
  if (!data.source) {
    errors.source = "Please select a source";
  }
  return errors;
};

const LeadForm = ({ onSubmit }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      setSubmitting(true);
      await onSubmit(form);
      setForm(INITIAL_FORM);
      setErrors({});
    } catch (err) {
      // Error is handled by the hook via toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="lead-form-wrapper card">
      <div className="form-header">
        <div className="form-header-icon">➕</div>
        <div>
          <h2 className="form-title">Add New Lead</h2>
          <p className="form-subtitle">Fill in the details to add a new lead</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          {/* Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              className={`form-input ${errors.name ? "error" : ""}`}
              placeholder="e.g. Rahul Sharma"
              value={form.name}
              onChange={handleChange}
              maxLength={100}
              autoComplete="off"
            />
            {errors.name && <span className="form-error">⚠ {errors.name}</span>}
          </div>

          {/* Phone */}
          <div className="form-group">
            <label className="form-label" htmlFor="phone">Phone Number *</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className={`form-input ${errors.phone ? "error" : ""}`}
              placeholder="e.g. +91 98765 43210"
              value={form.phone}
              onChange={handleChange}
              maxLength={20}
              autoComplete="off"
            />
            {errors.phone && <span className="form-error">⚠ {errors.phone}</span>}
          </div>

          {/* Source */}
          <div className="form-group">
            <label className="form-label" htmlFor="source">Source *</label>
            <select
              id="source"
              name="source"
              className={`form-select ${errors.source ? "error" : ""}`}
              value={form.source}
              onChange={handleChange}
            >
              <option value="">Select source...</option>
              {SOURCES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.source && <span className="form-error">⚠ {errors.source}</span>}
          </div>

          {/* Notes */}
          <div className="form-group form-group-full">
            <label className="form-label" htmlFor="notes">Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              className="form-textarea"
              placeholder="Any additional information about this lead..."
              value={form.notes}
              onChange={handleChange}
              maxLength={500}
            />
            <span className="char-count">{form.notes.length}/500</span>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => { setForm(INITIAL_FORM); setErrors({}); }}
            disabled={submitting}
          >
            Clear
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? (
              <><span className="spinner" /> Adding Lead...</>
            ) : (
              "Add Lead"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;
