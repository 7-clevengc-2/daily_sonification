import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import studyService from "../services/studyService";
import config from "../config.js";

const MIN_DAY = 1;
const MAX_DAY = 14;

function clampDay(value) {
  if (Number.isNaN(value)) return MIN_DAY;
  return Math.min(Math.max(value, MIN_DAY), MAX_DAY);
}

function Settings() {
  // Study Day state
  const [currentDay, setCurrentDay] = useState(studyService.getCurrentStudyDay());
  const [inputDay, setInputDay] = useState(currentDay);
  const [dayStatus, setDayStatus] = useState(null);

  // Admin Export state
  const [adminKey, setAdminKey] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [exportSuccess, setExportSuccess] = useState(false);

  useEffect(() => {
    const storedDay = studyService.getCurrentStudyDay();
    setCurrentDay(storedDay);
    setInputDay(storedDay);
  }, []);

  const handleDaySubmit = (event) => {
    event.preventDefault();
    const numericDay = clampDay(Number(inputDay));
    studyService.setCurrentStudyDay(numericDay);
    setCurrentDay(numericDay);
    setInputDay(numericDay);
    setDayStatus({ type: "success", message: `Study day set to ${numericDay}.` });
  };

  const handleIncrement = () => {
    const nextDay = clampDay(currentDay + 1);
    studyService.setCurrentStudyDay(nextDay);
    setCurrentDay(nextDay);
    setInputDay(nextDay);
    setDayStatus({ type: "success", message: `Study day advanced to ${nextDay}.` });
  };

  const handleReset = () => {
    studyService.setCurrentStudyDay(MIN_DAY);
    setCurrentDay(MIN_DAY);
    setInputDay(MIN_DAY);
    setDayStatus({ type: "info", message: "Study day reset to Day 1." });
  };

  const handleExport = async () => {
    if (!adminKey.trim()) {
      setExportError("Please enter an admin key");
      return;
    }

    setIsExporting(true);
    setExportError("");
    setExportSuccess(false);

    try {
      const response = await fetch(
        `${config.apiBaseUrl}/api/admin/export-data?adminKey=${encodeURIComponent(adminKey)}`,
        {
          method: "GET",
          headers: { Accept: "text/csv" },
        }
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
      setExportError("");
    } catch (error) {
      console.error("Export failed:", error);
      setExportError(error.message || "Export failed. Please check your admin key and try again.");
      setExportSuccess(false);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: "var(--spacing-xl)", paddingBottom: "var(--spacing-2xl)" }}>
      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <Link to="/home" className="btn btn-ghost" style={{ fontSize: "1rem" }}>&larr; Back to Home</Link>
      </div>

      <h1 style={{ marginBottom: "var(--spacing-xl)", textAlign: "center" }}>Settings</h1>

      {/* Study Day Manager Section */}
      <div className="card" style={{ maxWidth: "560px", margin: "0 auto var(--spacing-xl)" }}>
        <div className="card-body">
          <h2 className="card-title" style={{ marginBottom: "1rem" }}>Study Day Manager</h2>
          <p style={{ marginBottom: "1rem", color: "#666" }}>
            Updates the locally stored study day used by the survey flow. Does not modify any
            server-side data or study session records.
          </p>

          <div style={{ marginBottom: "1.5rem" }}>
            <strong>Current Day:</strong> Day {currentDay} of {MAX_DAY}
          </div>

          <form onSubmit={handleDaySubmit} style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Set study day (1-{MAX_DAY})
            </label>
            <input
              type="number"
              min={MIN_DAY}
              max={MAX_DAY}
              value={inputDay}
              onChange={(e) => setInputDay(e.target.value)}
              className="form-input"
              style={{ marginBottom: "1rem" }}
            />
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
              Save Day
            </button>
          </form>

          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
            <button type="button" className="btn btn-outline" onClick={handleIncrement} style={{ flex: 1 }}>
              Next Day
            </button>
            <button type="button" className="btn btn-ghost" onClick={handleReset} style={{ flex: 1 }}>
              Reset to Day 1
            </button>
          </div>

          {dayStatus && (
            <div
              style={{
                marginTop: "1rem",
                padding: "0.75rem 1rem",
                borderRadius: "4px",
                backgroundColor: dayStatus.type === "success" ? "#e8f5e9" : "#e3f2fd",
                color: dayStatus.type === "success" ? "#1b5e20" : "#0d47a1",
                fontSize: "0.95rem",
              }}
            >
              {dayStatus.message}
            </div>
          )}
        </div>
      </div>

      {/* Admin Data Export Section */}
      <div className="card" style={{ maxWidth: "560px", margin: "0 auto" }}>
        <div className="card-body">
          <h2 className="card-title" style={{ marginBottom: "1rem" }}>Study Data Export</h2>
          <p style={{ marginBottom: "1rem", color: "#666" }}>
            Enter your admin key to download the complete study data as a CSV file.
          </p>

          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="adminKey" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Admin Key:
            </label>
            <input
              id="adminKey"
              type="password"
              value={adminKey}
              onChange={(e) => {
                setAdminKey(e.target.value);
                setExportError("");
                setExportSuccess(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && adminKey.trim() && !isExporting) {
                  handleExport();
                }
              }}
              className="form-input"
              placeholder="Enter your admin key"
              disabled={isExporting}
            />
          </div>

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
            disabled={isExporting || !adminKey.trim()}
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

export default Settings;
