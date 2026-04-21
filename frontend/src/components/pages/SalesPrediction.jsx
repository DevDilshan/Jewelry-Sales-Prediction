import { useEffect, useState } from "react";
import { API_BASE } from "../../config/api.js";
import "./SalesPrediction.css";

const CATEGORY_COLORS = {
  Earring  : "#d4af37",
  Rings    : "#c29460",
  Pendant  : "#b87333",
  Bracelet : "#a0785a",
  Necklace : "#8b6347",
  Brooch   : "#7a5230"
};

const MONTHS = [
  "January","February","March","April",
  "May","June","July","August",
  "September","October","November","December"
];

function getPriorityStyle(priority) {
  if (priority === "high")   return "status-high";
  if (priority === "medium") return "status-medium";
  return "status-low";
}

function getPriorityLabel(priority) {
  if (priority === "high")   return "Urgent";
  if (priority === "medium") return "Monitor";
  return "Normal";
}

export default function SalesPrediction({ setActivePage }) {
  const now       = new Date();
  const nextMonth = now.getMonth() + 2 > 12 ? 1 : now.getMonth() + 2;
  const nextYear  = now.getMonth() + 2 > 12 ? now.getFullYear() + 1 : now.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(nextMonth);
  const [selectedYear,  setSelectedYear]  = useState(nextYear);
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    setActivePage("sales-prediction");
  }, [setActivePage]);

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`${API_BASE}/predictions/predict-all?month=${selectedMonth}&year=${selectedYear}`)
      .then(res => res.json())
      .then(res => {
        if (res.success) setData(res.data);
        else setError("Failed to load predictions.");
      })
      .catch(() => setError("Could not connect to prediction service."))
      .finally(() => setLoading(false));
  }, [selectedMonth, selectedYear]);

  const maxSales = data
    ? Math.max(...data.predictions.map(p => p.predicted_sales))
    : 1;

  const yearOptions = [2025, 2026, 2027];

  return (
    <div className="sp-page">

      {/* ── Header ── */}
      <div className="dashboard-header">
        <div>
          <h1>Sales Prediction</h1>
          <p>AI-powered forecast based on Sri Lankan jewelry buying patterns.</p>
        </div>
        <div className="sp-selector">
          <select className="sp-select" value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}>
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
          <select className="sp-select" value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}>
            {yearOptions.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="sp-loading">
          <div className="sp-spinner" />
          <p>Generating predictions...</p>
        </div>
      )}

      {error && <div className="sp-error">{error}</div>}

      {data && !loading && (
        <>
          {/* ── Season Banner ── */}
          <div className="sp-season-banner">
            <span className="sp-season-icon">📅</span>
            <span className="sp-season-label">{data.season}</span>
            <span className="sp-season-sub">
              — {data.month_name} {data.year}
            </span>
          </div>

          {/* ── Stat Cards ── */}
          <div className="sp-stats-grid">
            <div className="sp-stat-card">
              <p className="sp-stat-label">TOP CATEGORY</p>
              <p className="sp-stat-value">{data.top_category}</p>
              <p className="sp-stat-sub">Highest predicted demand</p>
            </div>
            <div className="sp-stat-card">
              <p className="sp-stat-label">TOTAL PREDICTED UNITS</p>
              <p className="sp-stat-value">
                {data.total_predicted.toLocaleString()}
              </p>
              <p className="sp-stat-sub">Across all 6 categories</p>
            </div>
            <div className="sp-stat-card">
              <p className="sp-stat-label">FORECAST PERIOD</p>
              <p className="sp-stat-value">{data.month_name}</p>
              <p className="sp-stat-sub">{data.year}</p>
            </div>
          </div>

          {/* ── Chart + Insight ── */}
          <div className="sp-main-grid">

            {/* Bar Chart */}
            <div className="sp-card">
              <div className="section-header">
                <h2>Predicted Sales by Category</h2>
                <span className="currency">UNITS</span>
              </div>
              <div className="sp-chart">
                {data.predictions.map(item => {
                  const pct   = (item.predicted_sales / maxSales) * 100;
                  const color = CATEGORY_COLORS[item.category] || "#d4af37";
                  const rec   = data.recommendations.find(
                    r => r.category === item.category
                  );
                  return (
                    <div key={item.category} className="sp-bar-row">
                      <div className="sp-bar-label">{item.category}</div>
                      <div className="sp-bar-track">
                        <div className="sp-bar-fill"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                      <div className="sp-bar-value">
                        {item.predicted_sales.toLocaleString()}
                      </div>
                      {rec && (
                        <span className={`sp-status-badge ${getPriorityStyle(rec.priority)}`}>
                          {getPriorityLabel(rec.priority)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Insight */}
            <div className="sp-card sp-insight-card">
              <h2>AI Insight</h2>
              <div className="sp-insight-icon">💡</div>
              <p className="sp-insight-text">{data.insight}</p>
            </div>
          </div>

          {/* ── Stock Recommendations ── */}
          <div className="sp-card sp-table-card">
            <div className="section-header">
              <h2>Stock Recommendations</h2>
              <span className="currency">
                {data.month_name.toUpperCase()} {data.year}
              </span>
            </div>
            <table className="orders-table">
              <thead>
                <tr>
                  <th>CATEGORY</th>
                  <th>PREDICTED SALES</th>
                  <th>PRIORITY</th>
                  <th>RECOMMENDED ACTION</th>
                  <th>DETAIL</th>
                </tr>
              </thead>
              <tbody>
                {data.recommendations.map(rec => {
                  const color = CATEGORY_COLORS[rec.category] || "#d4af37";
                  return (
                    <tr key={rec.category}>
                      <td>
                        <div className="sp-cat-cell">
                          <div className="sp-cat-dot"
                            style={{ background: color }} />
                          {rec.category}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {rec.predicted.toLocaleString()} units
                      </td>
                      <td>
                        <span className={`sp-status-badge ${getPriorityStyle(rec.priority)}`}>
                          {getPriorityLabel(rec.priority)}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500, color: "#333" }}>
                        {rec.action}
                      </td>
                      <td className="text-light sp-detail-col">
                        {rec.detail}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Category Breakdown ── */}
          <div className="sp-card sp-table-card">
            <div className="section-header">
              <h2>Category Breakdown</h2>
              <span className="currency">SHARE OF TOTAL</span>
            </div>
            <table className="orders-table">
              <thead>
                <tr>
                  <th>CATEGORY</th>
                  <th>PREDICTED UNITS</th>
                  <th>SHARE OF TOTAL</th>
                  <th>DEMAND LEVEL</th>
                </tr>
              </thead>
              <tbody>
                {data.predictions.map(item => {
                  const share = ((item.predicted_sales / data.total_predicted) * 100).toFixed(1);
                  const color = CATEGORY_COLORS[item.category] || "#d4af37";
                  const rec   = data.recommendations.find(r => r.category === item.category);
                  return (
                    <tr key={item.category}>
                      <td>
                        <div className="sp-cat-cell">
                          <div className="sp-cat-dot" style={{ background: color }} />
                          {item.category}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {item.predicted_sales.toLocaleString()}
                      </td>
                      <td>
                        <div className="sp-share-cell">
                          <div className="sp-share-bar">
                            <div className="sp-share-fill"
                              style={{ width: `${share}%`, background: color }} />
                          </div>
                          <span className="text-light">{share}%</span>
                        </div>
                      </td>
                      <td>
                        {rec && (
                          <span className={`sp-status-badge ${getPriorityStyle(rec.priority)}`}>
                            {getPriorityLabel(rec.priority)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </>
      )}
    </div>
  );
}