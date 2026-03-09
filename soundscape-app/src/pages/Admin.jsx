import React, { useState } from "react";
import { Link } from "react-router-dom";
import config from "../config.js";

function Admin() {
  // Auth gate state
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Verified admin key (held in memory only)
  const [adminKey, setAdminKey] = useState("");

  // Survey bypass state
  const [bypassEnabled, setBypassEnabled] = useState(!!localStorage.getItem("adminBypass"));

  // CSV export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleVerify = async () => {
    if (!passwordInput.trim()) {
      setAuthError("Please enter the admin password.");
      return;
    }

    setIsVerifying(true);
    setAuthError("");

    try {
      const response = await fetch(`${config.apiBaseUrl}/api/admin/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminKey: passwordInput.trim() }),
      });

      if (!response.ok) {
        throw new Error("Invalid admin password");
      }

      setAdminKey(passwordInput.trim());
      setAuthenticated(true);
    } catch {
      setAuthError("Invalid admin password. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleToggleBypass = () => {
    if (bypassEnabled) {
      localStorage.removeItem("adminBypass");
      setBypassEnabled(false);
    } else {
      localStorage.setItem("adminBypass", adminKey);
      setBypassEnabled(true);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportError("");
    setExportSuccess(false);

    try {
      const response = await fetch(
        `${config.apiBaseUrl}/api/admin/export-data?adminKey=${encodeURIComponent(adminKey)}`,
        { method: "GET", headers: { Accept: "text/csv" } }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Export failed" }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const csvContent = await response.text();
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `study_data_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setExportSuccess(true);
    } catch (error) {
      console.error("Export failed:", error);
      setExportError(error.message || "Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // --- Password gate ---
  if (!authenticated) {
    return (
      <div className="container" style={{ paddingTop: "var(--spacing-xl)", paddingBottom: "var(--spacing-2xl)" }}>
        <div style={{ marginBottom: "var(--spacing-lg)" }}>
          <Link to="/settings" className="btn btn-ghost" style={{ fontSize: "1rem" }}>&larr; Back to Settings</Link>
        </div>

        <h1 style={{ marginBottom: "var(--spacing-xl)", textAlign: "center" }}>Admin</h1>

        <div className="card" style={{ maxWidth: "420px", margin: "0 auto" }}>
          <div className="card-body">
            <p style={{ marginBottom: "1rem", color: "#666" }}>
              Enter the admin password to continue.
            </p>

            <input
              type="password"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setAuthError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && passwordInput.trim() && !isVerifying) {
                  handleVerify();
                }
              }}
              className="form-input"
              placeholder="Admin password"
              disabled={isVerifying}
              style={{ marginBottom: "1rem" }}
            />

            {authError && (
              <div
                style={{
                  marginBottom: "1rem",
                  padding: "0.75rem",
                  backgroundColor: "#f8d7da",
                  color: "#721c24",
                  border: "1px solid #f5c6cb",
                  borderRadius: "4px",
                }}
              >
                {authError}
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={isVerifying || !passwordInput.trim()}
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              {isVerifying ? "Verifying..." : "Unlock"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Authenticated admin page ---
  return (
    <div className="container" style={{ paddingTop: "var(--spacing-xl)", paddingBottom: "var(--spacing-2xl)" }}>
      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <Link to="/settings" className="btn btn-ghost" style={{ fontSize: "1rem" }}>&larr; Back to Settings</Link>
      </div>

      <h1 style={{ marginBottom: "var(--spacing-xl)", textAlign: "center" }}>Admin</h1>

      {/* Survey Limit Override */}
      <div className="card" style={{ maxWidth: "560px", margin: "0 auto var(--spacing-xl)" }}>
        <div className="card-body">
          <h2 className="card-title" style={{ marginBottom: "1rem" }}>Survey Limit Override</h2>
          <p style={{ marginBottom: "1rem", color: "#666" }}>
            When enabled, the daily one-survey limit is bypassed. This lets you take the survey
            multiple times in a single day.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.75rem 1rem",
              borderRadius: "4px",
              backgroundColor: bypassEnabled ? "#fff3cd" : "#f8f9fa",
              border: `1px solid ${bypassEnabled ? "#ffc107" : "#dee2e6"}`,
            }}
          >
            <span style={{ fontWeight: "500", color: bypassEnabled ? "#856404" : "#495057" }}>
              {bypassEnabled ? "Override is ON" : "Override is OFF"}
            </span>
            <button
              onClick={handleToggleBypass}
              className={bypassEnabled ? "btn btn-ghost" : "btn btn-primary"}
              style={{ minWidth: "80px" }}
            >
              {bypassEnabled ? "Disable" : "Enable"}
            </button>
          </div>
        </div>
      </div>

      {/* CSV Export */}
      <div className="card" style={{ maxWidth: "560px", margin: "0 auto" }}>
        <div className="card-body">
          <h2 className="card-title" style={{ marginBottom: "1rem" }}>Study Data Export</h2>
          <p style={{ marginBottom: "1rem", color: "#666" }}>
            Download the complete study data as a CSV file.
          </p>

          {exportError && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "0.75rem",
                backgroundColor: "#f8d7da",
                color: "#721c24",
                border: "1px solid #f5c6cb",
                borderRadius: "4px",
              }}
            >
              {exportError}
            </div>
          )}

          {exportSuccess && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "0.75rem",
                backgroundColor: "#d4edda",
                color: "#155724",
                border: "1px solid #c3e6cb",
                borderRadius: "4px",
              }}
            >
              Data exported successfully! Check your downloads folder.
            </div>
          )}

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="btn btn-primary"
            style={{ width: "100%" }}
          >
            {isExporting ? "Exporting..." : "Export Study Data"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Admin;
