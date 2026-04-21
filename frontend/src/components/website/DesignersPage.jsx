import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import { API_BASE, uploadUrl } from "../../config/api";
import "./DesignersPage.css";

export default function DesignersPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetch(`${API_BASE}/designer-portfolios/public?limit=50`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success && Array.isArray(json.data)) setList(json.data);
        else setError("Could not load designers.");
      })
      .catch(() => {
        if (!cancelled) setError("Could not load designers.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const thumb = (p) => {
    const first = p.images?.[0];
    return first?.relPath ? uploadUrl(first.relPath) : null;
  };

  const designerName = (p) => {
    const s = p.staff;
    if (s?.firstName || s?.lastName) return [s.firstName, s.lastName].filter(Boolean).join(" ");
    return p.displayName;
  };

  return (
    <div className="shop-page designers-page">
      <Navbar />
      <div className="shop-inner designers-inner">
        <header className="designers-header">
          <h1>Our designers</h1>
          <p className="designers-lead">
            Explore portfolios from our jewelry designers and see past work. When you&apos;re ready,{" "}
            <Link to="/custom-design">request a custom design</Link> with your own sketch.
          </p>
        </header>

        {loading && <p className="designers-loading">Loading…</p>}
        {error && <p className="designers-error">{error}</p>}

        {!loading && !error && list.length === 0 && (
          <p className="designers-empty">Designer portfolios will appear here when published.</p>
        )}

        <div className="designers-grid">
          {list.map((p) => (
            <Link key={p._id} to={`/designers/${p._id}`} className="designer-card">
              <div className="designer-card-image">
                {thumb(p) ? (
                  <img src={thumb(p)} alt="" />
                ) : (
                  <span className="designer-card-placeholder">✦</span>
                )}
              </div>
              <div className="designer-card-body">
                <h2>{p.displayName}</h2>
                {p.headline ? <p className="designer-card-headline">{p.headline}</p> : null}
                <p className="designer-card-meta">{designerName(p)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
