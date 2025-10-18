import React, { useState } from 'react';
import config from '../config.js';

function Admin() {
  const [adminKey, setAdminKey] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportUrl, setExportUrl] = useState('');

  const handleExport = async () => {
    if (!adminKey.trim()) {
      alert('Please enter an admin key');
      return;
    }

    setIsExporting(true);
    try {
      const url = `${config.apiBaseUrl}/api/admin/export-data?adminKey=${encodeURIComponent(adminKey)}`;
      setExportUrl(url);
      
      // Trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = 'study_data.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please check your admin key and try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Study Data Export</h2>
      <div style={{ marginBottom: "1rem" }}>
        <p>Use this page to export all study data for analysis.</p>
      </div>
      
      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="adminKey" style={{ display: "block", marginBottom: "0.5rem" }}>
          Admin Key:
        </label>
        <input
          id="adminKey"
          type="password"
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
          style={{
            width: "100%",
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px"
          }}
          placeholder="Enter your admin key"
        />
      </div>
      
      <button
        onClick={handleExport}
        disabled={isExporting || !adminKey.trim()}
        style={{
          padding: "0.75rem 1.5rem",
          backgroundColor: isExporting || !adminKey.trim() ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: isExporting || !adminKey.trim() ? "not-allowed" : "pointer"
        }}
      >
        {isExporting ? "Exporting..." : "Export Study Data"}
      </button>
      
      {exportUrl && (
        <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
          <p><strong>Export URL:</strong></p>
          <code style={{ wordBreak: "break-all", fontSize: "0.9rem" }}>{exportUrl}</code>
        </div>
      )}
    </div>
  );
}

export default Admin;
