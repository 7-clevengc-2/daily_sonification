import React, { useState } from 'react';
import config from '../config.js';

function Admin() {
  const [adminKey, setAdminKey] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleExport = async () => {
    if (!adminKey.trim()) {
      setError('Please enter an admin key');
      return;
    }

    setIsExporting(true);
    setError('');
    setSuccess(false);

    try {
      // Use fetch to download the CSV file
      const response = await fetch(
        `${config.apiBaseUrl}/api/admin/export-data?adminKey=${encodeURIComponent(adminKey)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'text/csv',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Export failed' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Get the CSV content as text
      const csvContent = await response.text();
      
      // Create a blob from the CSV content
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `study_data_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccess(true);
      setError('');
    } catch (error) {
      console.error('Export failed:', error);
      setError(error.message || 'Export failed. Please check your admin key and try again.');
      setSuccess(false);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Study Data Export</h2>
      <div style={{ marginBottom: "1rem" }}>
        <p>Use this page to export all study data for analysis.</p>
        <p style={{ fontSize: "0.9rem", color: "#666" }}>
          Enter your admin key to download the complete study data as a CSV file.
        </p>
      </div>
      
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
            setError('');
            setSuccess(false);
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && adminKey.trim() && !isExporting) {
              handleExport();
            }
          }}
          style={{
            width: "100%",
            padding: "0.75rem",
            border: `1px solid ${error ? "#dc3545" : "#ccc"}`,
            borderRadius: "4px",
            fontSize: "1rem"
          }}
          placeholder="Enter your admin key"
          disabled={isExporting}
        />
      </div>
      
      {error && (
        <div style={{ 
          marginBottom: "1rem", 
          padding: "0.75rem", 
          backgroundColor: "#f8d7da", 
          color: "#721c24",
          border: "1px solid #f5c6cb",
          borderRadius: "4px"
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ 
          marginBottom: "1rem", 
          padding: "0.75rem", 
          backgroundColor: "#d4edda", 
          color: "#155724",
          border: "1px solid #c3e6cb",
          borderRadius: "4px"
        }}>
          ✓ Data exported successfully! Check your downloads folder.
        </div>
      )}
      
      <button
        onClick={handleExport}
        disabled={isExporting || !adminKey.trim()}
        style={{
          padding: "0.75rem 1.5rem",
          backgroundColor: isExporting || !adminKey.trim() ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: isExporting || !adminKey.trim() ? "not-allowed" : "pointer",
          fontSize: "1rem",
          fontWeight: "500",
          width: "100%"
        }}
      >
        {isExporting ? "Exporting..." : "Export Study Data"}
      </button>
    </div>
  );
}

export default Admin;
