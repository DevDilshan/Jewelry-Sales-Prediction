import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "./Navbar";
import { API_BASE, uploadUrl } from "../../config/api";
import "./DesignerPortfolioPublicPage.css";

export default function DesignerPortfolioPublicPage() {
  const { portfolioId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setData(null);
    fetch(`${API_BASE}/designer-portfolios/public/${portfolioId}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success && json.data) setData(json.data);
        else setError(json.message || "Portfolio not found.");
      })
      .catch(() => {
        if (!cancelled) setError("Could not load this portfolio.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [portfolioId]);

  const personName = (p) => {
    const s = p?.staff;
    if (s?.firstName || s?.lastName) return [s.firstName, s.lastName].filter(Boolean).join(" ");
    return "";
  };

  return (
    <div className="shop-page dp-public-page">
      <Navbar />
      <div className="shop-inner dp-public-inner">
        <div className="dp-back">
          <Link to="/designers">← All designers</Link>
        </div>

        {loading && <p className="dp-loading">Loading…</p>}
        {error && !loading && <p className="dp-error">{error}</p>}

        {data && !loading && (
          <>
            <header className="dp-public-header">
              <h1>{data.displayName}</h1>
              {data.headline ? <p className="dp-public-headline">{data.headline}</p> : null}
              {personName(data) ? (
                <p className="dp-public-person">
                  {personName(data)}
                  {data.staff?.jobTitle ? ` · ${data.staff.jobTitle}` : ""}
                </p>
              ) : null}
            </header>

            {data.specialties?.length > 0 && (
              <ul className="dp-specialties">
                {data.specialties.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            )}

            {(() => {
              const parts = [];
              if (data.yearsOfExperience != null) parts.push(`${data.yearsOfExperience}+ yrs experience`);
              if (data.completedProjects != null) {
                parts.push(`${Number(data.completedProjects).toLocaleString()} completed projects`);
              }
              if (parts.length === 0) return null;
              return <p className="dp-public-stats">{parts.join(" · ")}</p>;
            })()}

            {data.bio ? <div className="dp-bio">{data.bio}</div> : null}

            {data.images?.length > 0 && (
              <section className="dp-gallery" aria-label="Portfolio images">
                <h2 className="dp-gallery-title">Work</h2>
                <div className="dp-gallery-grid">
                  {data.images.map((img) => (
                    <figure key={img._id} className="dp-gallery-item">
                      <img src={uploadUrl(img.relPath)} alt={img.caption || data.displayName} />
                      {img.caption ? <figcaption>{img.caption}</figcaption> : null}
                    </figure>
                  ))}
                </div>
              </section>
            )}

            <p className="dp-cta">
              <Link to="/custom-design" className="dp-cta-link">
                Request a custom design →
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
