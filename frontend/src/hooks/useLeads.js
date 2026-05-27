import { useState, useEffect, useCallback } from "react";
import { leadsApi } from "../utils/api";
import toast from "react-hot-toast";

const useLeads = () => {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", status: "", source: "" });

  // ── Fetch leads ─────────────────────────────────────────────────────────────
  const fetchLeads = useCallback(async (filterParams = {}) => {
    try {
      setLoading(true);
      const params = Object.fromEntries(
        Object.entries(filterParams).filter(([, v]) => v !== "")
      );
      const response = await leadsApi.getAll(params);
      setLeads(response.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch dashboard stats ────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const response = await leadsApi.getStats();
      setStats(response.data.stats);
    } catch (err) {
      console.error("Stats error:", err.message);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Add lead ─────────────────────────────────────────────────────────────────
  const addLead = async (formData) => {
    const response = await leadsApi.create(formData);
    setLeads((prev) => [response.data, ...prev]);
    await fetchStats();
    toast.success("Lead added successfully!");
    return response.data;
  };

  // ── Update status ─────────────────────────────────────────────────────────────
  const updateStatus = async (id, status, notes) => {
    const response = await leadsApi.updateStatus(id, { status, notes });
    setLeads((prev) =>
      prev.map((lead) => (lead.id === id ? response.data : lead))
    );
    await fetchStats();
    toast.success("Status updated!");
    return response.data;
  };

  // ── Delete lead ───────────────────────────────────────────────────────────────
  const deleteLead = async (id) => {
    await leadsApi.delete(id);
    setLeads((prev) => prev.filter((lead) => lead.id !== id));
    await fetchStats();
    toast.success("Lead deleted successfully");
  };

  // ── Apply filters ─────────────────────────────────────────────────────────────
  const applyFilters = useCallback(
    (newFilters) => {
      const updated = { ...filters, ...newFilters };
      setFilters(updated);
      fetchLeads(updated);
    },
    [filters, fetchLeads]
  );

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, [fetchLeads, fetchStats]);

  return {
    leads,
    stats,
    loading,
    statsLoading,
    filters,
    addLead,
    updateStatus,
    deleteLead,
    applyFilters,
    refetch: fetchLeads,
  };
};

export default useLeads;
