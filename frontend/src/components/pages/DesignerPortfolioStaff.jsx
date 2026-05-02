import { useCallback, useEffect, useMemo, useState } from "react";
import "./DesignerPortfolioStaff.css";
import { api, apiDelete, apiForm, getStaffRole, uploadUrl } from "../../config/api";

function parseSpecialties(str) {
  return String(str || "")
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);
}

const DIGITS_ONLY = /^\d+$/;

function parsePortfolioYears(str) {
  const t = String(str ?? "").trim();
  if (!DIGITS_ONLY.test(t)) {
    return { ok: false, message: "Years of experience must be a whole number from 0 to 80." };
  }
  const v = parseInt(t, 10);
  if (v > 80) return { ok: false, message: "Years of experience cannot be greater than 80." };
  return { ok: true, value: v };
}

function parsePortfolioProjects(str) {
  const t = String(str ?? "").trim();
  if (!DIGITS_ONLY.test(t)) {
    return { ok: false, message: "Completed projects must be a whole number from 0 to 100,000." };
  }
  const v = parseInt(t, 10);
  if (v > 100000) return { ok: false, message: "Completed projects cannot be greater than 100,000." };
  return { ok: true, value: v };
}

/** Designer role — own portfolio via /me */
function PortfolioMeEditor({ setActivePage }) {
  useEffect(() => {
    setActivePage("designer-portfolio");
  }, [setActivePage]);

  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [specialtiesStr, setSpecialtiesStr] = useState("");
  const [yearsStr, setYearsStr] = useState("0");
  const [projectsStr, setProjectsStr] = useState("0");
  const [isPublished, setIsPublished] = useState(false);

  const [createBusy, setCreateBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [caption, setCaption] = useState("");
  const [formError, setFormError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    api("/designer-portfolios/me", { auth: "staff" })
      .then((res) => {
        const row = res.data;
        setData(row);
        if (row) {
          setDisplayName(row.displayName || "");
          setHeadline(row.headline || "");
          setBio(row.bio || "");
          setSpecialtiesStr(Array.isArray(row.specialties) ? row.specialties.join(", ") : "");
          setYearsStr(row.yearsOfExperience != null ? String(row.yearsOfExperience) : "0");
          setProjectsStr(row.completedProjects != null ? String(row.completedProjects) : "0");
          setIsPublished(!!row.isPublished);
        }
      })
      .catch(() => setError("Could not load your portfolio."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    const dn = displayName.trim();
    if (dn.length < 2) {
      setFormError("Display name must be at least 2 characters.");
      return;
    }
    const y = parsePortfolioYears(yearsStr);
    if (!y.ok) {
      setFormError(y.message);
      return;
    }
    const pr = parsePortfolioProjects(projectsStr);
    if (!pr.ok) {
      setFormError(pr.message);
      return;
    }
    setCreateBusy(true);
    try {
      await api("/designer-portfolios/me", {
        method: "POST",
        body: {
          displayName: dn,
          headline: headline.trim().slice(0, 200),
          bio: bio.trim().slice(0, 8000),
          specialties: parseSpecialties(specialtiesStr),
          yearsOfExperience: y.value,
          completedProjects: pr.value,
          isPublished,
        },
        auth: "staff",
      });
      await load();
    } catch (err) {
      setFormError(err.message || "Could not create portfolio.");
    } finally {
      setCreateBusy(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!data) return;
    setFormError("");
    const dn = displayName.trim();
    if (dn.length < 2) {
      setFormError("Display name must be at least 2 characters.");
      return;
    }
    const y = parsePortfolioYears(yearsStr);
    if (!y.ok) {
      setFormError(y.message);
      return;
    }
    const pr = parsePortfolioProjects(projectsStr);
    if (!pr.ok) {
      setFormError(pr.message);
      return;
    }
    setSaveBusy(true);
    try {
      const res = await api("/designer-portfolios/me", {
        method: "PATCH",
        body: {
          displayName: dn,
          headline: headline.trim().slice(0, 200),
          bio: bio.trim().slice(0, 8000),
          specialties: parseSpecialties(specialtiesStr),
          yearsOfExperience: y.value,
          completedProjects: pr.value,
          isPublished,
        },
        auth: "staff",
      });
      setData(res.data);
    } catch (err) {
      setFormError(err.message || "Could not save.");
    } finally {
      setSaveBusy(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !data) return;
    setUploadBusy(true);
    setFormError("");
    try {
      const fd = new FormData();
      fd.append("image", file);
      if (caption.trim()) fd.append("caption", caption.trim().slice(0, 500));
      const res = await apiForm("/designer-portfolios/me/images", fd, { auth: "staff" });
      setData(res.data);
      setCaption("");
    } catch (err) {
      setFormError(err.message || "Upload failed.");
    } finally {
      setUploadBusy(false);
    }
  };

  const removeImage = async (imageId) => {
    if (!data || !imageId) return;
    if (!window.confirm("Remove this image from your portfolio?")) return;
    try {
      const res = await apiDelete(`/designer-portfolios/me/images/${imageId}`, { auth: "staff" });
      setData(res.data);
    } catch (err) {
      setFormError(err.message || "Could not remove image.");
    }
  };

  if (loading) {
    return (
      <div className="dps-page">
        <p className="dps-muted">Loading…</p>
      </div>
    );
  }

  if (error && data === undefined) {
    return (
      <div className="dps-page">
        <p className="dps-error">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="dps-page">
        <div className="dps-header">
          <h1>Your designer portfolio</h1>
          <p className="dps-lead">
            Create your profile first. After saving, you can <strong>add up to 15 photos</strong> (JPEG, PNG, GIF, or WebP) so
            customers can see your work on the website.
          </p>
        </div>
        <form className="dps-form" onSubmit={handleCreate}>
          {formError && <p className="dps-form-error">{formError}</p>}
          <label className="dps-field">
            Display name *
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required minLength={2} maxLength={120} />
          </label>
          <label className="dps-field">
            Headline
            <input value={headline} onChange={(e) => setHeadline(e.target.value)} maxLength={200} placeholder="Short tagline" />
          </label>
          <label className="dps-field">
            Bio
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={6} maxLength={8000} />
          </label>
          <label className="dps-field">
            Specialties (comma-separated)
            <input
              value={specialtiesStr}
              onChange={(e) => setSpecialtiesStr(e.target.value)}
              placeholder="Rings, custom bridal, stone sourcing"
            />
          </label>
          <label className="dps-field">
            Years of experience (0–80)
            <input
              inputMode="numeric"
              value={yearsStr}
              onChange={(e) => setYearsStr(e.target.value.replace(/\D/g, "").slice(0, 3))}
              placeholder="0"
            />
          </label>
          <label className="dps-field">
            Completed projects (0–100,000)
            <input
              inputMode="numeric"
              value={projectsStr}
              onChange={(e) => setProjectsStr(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="0"
            />
          </label>
          <label className="dps-check">
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
            Publish on the website
          </label>
          <button type="submit" className="dps-primary" disabled={createBusy}>
            {createBusy ? "Creating…" : "Create portfolio"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="dps-page">
      <div className="dps-header">
        <h1>Your designer portfolio</h1>
        <p className="dps-lead">
          Edit your profile and photos. Only published portfolios appear under <strong>Our designers</strong> on the site.
        </p>
      </div>

      <form className="dps-form" onSubmit={handleSave}>
        {formError && <p className="dps-form-error">{formError}</p>}
        <label className="dps-field">
          Display name *
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required minLength={2} maxLength={120} />
        </label>
        <label className="dps-field">
          Headline
          <input value={headline} onChange={(e) => setHeadline(e.target.value)} maxLength={200} />
        </label>
        <label className="dps-field">
          Bio
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={6} maxLength={8000} />
        </label>
        <label className="dps-field">
          Specialties (comma-separated)
          <input value={specialtiesStr} onChange={(e) => setSpecialtiesStr(e.target.value)} />
        </label>
        <label className="dps-field">
          Years of experience (0–80)
          <input
            inputMode="numeric"
            value={yearsStr}
            onChange={(e) => setYearsStr(e.target.value.replace(/\D/g, "").slice(0, 3))}
          />
        </label>
        <label className="dps-field">
          Completed projects (0–100,000)
          <input
            inputMode="numeric"
            value={projectsStr}
            onChange={(e) => setProjectsStr(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />
        </label>
        <label className="dps-check">
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
          Publish on the website
        </label>
        <button type="submit" className="dps-primary" disabled={saveBusy}>
          {saveBusy ? "Saving…" : "Save profile"}
        </button>
      </form>

      <section className="dps-images">
        <h2>Add photos to your portfolio</h2>
        <p className="dps-images-hint">
          Choose <strong>Add image</strong> to upload work samples. Optional caption per photo. JPEG, PNG, GIF, or WebP · up to 8
          MB each · max 15 images total.
        </p>
        <div className="dps-upload-row">
          <label className="dps-file">
            <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleUpload} disabled={uploadBusy} />
            {uploadBusy ? "Uploading…" : "Add image"}
          </label>
          <input
            type="text"
            className="dps-caption-input"
            placeholder="Caption (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={500}
          />
        </div>

        <div className="dps-grid">
          {(data.images || []).map((img) => (
            <div key={img._id} className="dps-tile">
              <img src={uploadUrl(img.relPath)} alt={img.caption || ""} />
              {img.caption ? <p className="dps-tile-cap">{img.caption}</p> : null}
              <button type="button" className="dps-remove" onClick={() => removeImage(img._id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/** Admin / PM / viewer / sales — shared list + detail (read-only for viewer & sales) */
function PortfolioDirectory({ setActivePage, readOnly }) {
  useEffect(() => {
    setActivePage("designer-portfolio");
  }, [setActivePage]);

  const canEdit = !readOnly;

  const [list, setList] = useState([]);
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [selectedId, setSelectedId] = useState(null);
  const [data, setData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [specialtiesStr, setSpecialtiesStr] = useState("");
  const [yearsStr, setYearsStr] = useState("0");
  const [projectsStr, setProjectsStr] = useState("0");
  const [isPublished, setIsPublished] = useState(false);

  const [newStaffId, setNewStaffId] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newHeadline, setNewHeadline] = useState("");
  const [newBio, setNewBio] = useState("");
  const [newSpecialties, setNewSpecialties] = useState("");
  const [newYearsStr, setNewYearsStr] = useState("0");
  const [newProjectsStr, setNewProjectsStr] = useState("0");
  const [newPublished, setNewPublished] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState("");

  const [saveBusy, setSaveBusy] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [caption, setCaption] = useState("");
  const [formError, setFormError] = useState("");

  const loadList = useCallback(() => {
    setListError("");
    return api("/designer-portfolios/admin", { auth: "staff" })
      .then((res) => {
        const rows = Array.isArray(res.data) ? res.data : [];
        setList(rows);
        return rows;
      })
      .catch(() => {
        setListError("Could not load portfolios.");
        return [];
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setListError("");
    const p1 = loadList();
    const p2 = canEdit
      ? api("/staff/designers", { auth: "staff" })
          .then((rows) => {
            if (!cancelled) setDesigners(Array.isArray(rows) ? rows : []);
          })
          .catch(() => {
            if (!cancelled) setDesigners([]);
          })
      : Promise.resolve();

    Promise.all([p1, p2]).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [loadList, canEdit]);

  const portfolioStaffIds = useMemo(() => {
    const ids = new Set();
    list.forEach((p) => {
      const sid = p.staff?._id ?? p.staff;
      if (sid) ids.add(String(sid));
    });
    return ids;
  }, [list]);

  const designersWithoutPortfolio = useMemo(
    () => designers.filter((d) => d._id && !portfolioStaffIds.has(String(d._id))),
    [designers, portfolioStaffIds]
  );

  const loadDetail = useCallback(
    (id) => {
      if (!id) {
        setData(null);
        setSelectedId(null);
        return;
      }
      setDetailLoading(true);
      setFormError("");
      api(`/designer-portfolios/admin/${id}`, { auth: "staff" })
        .then((res) => {
          const row = res.data;
          setData(row);
          setSelectedId(id);
          if (row) {
            setDisplayName(row.displayName || "");
            setHeadline(row.headline || "");
            setBio(row.bio || "");
            setSpecialtiesStr(Array.isArray(row.specialties) ? row.specialties.join(", ") : "");
            setYearsStr(row.yearsOfExperience != null ? String(row.yearsOfExperience) : "0");
            setProjectsStr(row.completedProjects != null ? String(row.completedProjects) : "0");
            setIsPublished(!!row.isPublished);
          }
        })
        .catch(() => {
          setFormError("Could not load portfolio.");
          setData(null);
        })
        .finally(() => setDetailLoading(false));
    },
    []
  );

  useEffect(() => {
    if (list.length > 0 && selectedId == null) {
      loadDetail(list[0]._id);
    }
  }, [list, selectedId, loadDetail]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!canEdit || !selectedId || !data) return;
    setFormError("");
    const dn = displayName.trim();
    if (dn.length < 2) {
      setFormError("Display name must be at least 2 characters.");
      return;
    }
    const y = parsePortfolioYears(yearsStr);
    if (!y.ok) {
      setFormError(y.message);
      return;
    }
    const pr = parsePortfolioProjects(projectsStr);
    if (!pr.ok) {
      setFormError(pr.message);
      return;
    }
    setSaveBusy(true);
    try {
      const res = await api(`/designer-portfolios/admin/${selectedId}`, {
        method: "PATCH",
        body: {
          displayName: dn,
          headline: headline.trim().slice(0, 200),
          bio: bio.trim().slice(0, 8000),
          specialties: parseSpecialties(specialtiesStr),
          yearsOfExperience: y.value,
          completedProjects: pr.value,
          isPublished,
        },
        auth: "staff",
      });
      setData(res.data);
      loadList();
    } catch (err) {
      setFormError(err.message || "Could not save.");
    } finally {
      setSaveBusy(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!canEdit) return;
    setCreateError("");
    if (!newStaffId) {
      setCreateError("Select a designer account.");
      return;
    }
    const dn = newDisplayName.trim();
    if (dn.length < 2) {
      setCreateError("Display name must be at least 2 characters.");
      return;
    }
    const y = parsePortfolioYears(newYearsStr);
    if (!y.ok) {
      setCreateError(y.message);
      return;
    }
    const pr = parsePortfolioProjects(newProjectsStr);
    if (!pr.ok) {
      setCreateError(pr.message);
      return;
    }
    setCreateBusy(true);
    try {
      const res = await api("/designer-portfolios/admin", {
        method: "POST",
        body: {
          staffId: newStaffId,
          displayName: dn,
          headline: newHeadline.trim().slice(0, 200),
          bio: newBio.trim().slice(0, 8000),
          specialties: parseSpecialties(newSpecialties),
          yearsOfExperience: y.value,
          completedProjects: pr.value,
          isPublished: newPublished,
        },
        auth: "staff",
      });
      const created = res.data;
      await loadList();
      if (created?._id) loadDetail(created._id);
      setNewStaffId("");
      setNewDisplayName("");
      setNewHeadline("");
      setNewBio("");
      setNewSpecialties("");
      setNewYearsStr("0");
      setNewProjectsStr("0");
      setNewPublished(false);
    } catch (err) {
      setCreateError(err.message || "Could not create portfolio.");
    } finally {
      setCreateBusy(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !selectedId || !canEdit) return;
    setUploadBusy(true);
    setFormError("");
    try {
      const fd = new FormData();
      fd.append("image", file);
      if (caption.trim()) fd.append("caption", caption.trim().slice(0, 500));
      const res = await apiForm(`/designer-portfolios/admin/${selectedId}/images`, fd, { auth: "staff" });
      setData(res.data);
      loadList();
      setCaption("");
    } catch (err) {
      setFormError(err.message || "Upload failed.");
    } finally {
      setUploadBusy(false);
    }
  };

  const removeImage = async (imageId) => {
    if (!canEdit || !selectedId || !imageId) return;
    if (!window.confirm("Remove this image?")) return;
    try {
      const res = await apiDelete(`/designer-portfolios/admin/${selectedId}/images/${imageId}`, { auth: "staff" });
      setData(res.data);
      loadList();
    } catch (err) {
      setFormError(err.message || "Could not remove image.");
    }
  };

  if (loading && list.length === 0) {
    return (
      <div className="dps-page">
        <p className="dps-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="dps-page dps-page--admin">
      <div className="dps-header">
        <h1>Designer portfolios</h1>
        <p className="dps-lead">
          {readOnly
            ? "View published and draft portfolios. Editing is limited to administrators and designers."
            : "Create portfolios for designer accounts, upload work photos, and control visibility on the storefront."}
        </p>
      </div>

      {listError && <p className="dps-error">{listError}</p>}

      {canEdit && (
        <section className="dps-admin-create">
          <h2>New portfolio</h2>
          <p className="dps-images-hint">Assign a portfolio to a staff account with the Designer role (one portfolio per designer).</p>
          {designersWithoutPortfolio.length === 0 ? (
            <p className="dps-muted">No designer accounts without a portfolio — create a designer under Staff first.</p>
          ) : (
            <form className="dps-form dps-form--compact" onSubmit={handleCreate}>
              {createError && <p className="dps-form-error">{createError}</p>}
              <div className="dps-form-row">
                <label className="dps-field">
                  Designer account *
                  <select value={newStaffId} onChange={(e) => setNewStaffId(e.target.value)} required>
                    <option value="">Select…</option>
                    {designersWithoutPortfolio.map((d) => (
                      <option key={d._id} value={d._id}>
                        {[d.firstName, d.lastName].filter(Boolean).join(" ") || d.username} ({d.email})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="dps-field">
                  Display name *
                  <input value={newDisplayName} onChange={(e) => setNewDisplayName(e.target.value)} required minLength={2} maxLength={120} />
                </label>
              </div>
              <label className="dps-field">
                Headline
                <input value={newHeadline} onChange={(e) => setNewHeadline(e.target.value)} maxLength={200} />
              </label>
              <label className="dps-field">
                Bio
                <textarea value={newBio} onChange={(e) => setNewBio(e.target.value)} rows={3} maxLength={8000} />
              </label>
              <label className="dps-field">
                Specialties (comma-separated)
                <input value={newSpecialties} onChange={(e) => setNewSpecialties(e.target.value)} />
              </label>
              <label className="dps-field">
                Years of experience (0–80)
                <input
                  inputMode="numeric"
                  value={newYearsStr}
                  onChange={(e) => setNewYearsStr(e.target.value.replace(/\D/g, "").slice(0, 3))}
                  placeholder="0"
                />
              </label>
              <label className="dps-field">
                Completed projects (0–100,000)
                <input
                  inputMode="numeric"
                  value={newProjectsStr}
                  onChange={(e) => setNewProjectsStr(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="0"
                />
              </label>
              <label className="dps-check">
                <input type="checkbox" checked={newPublished} onChange={(e) => setNewPublished(e.target.checked)} />
                Publish on the website
              </label>
              <button type="submit" className="dps-primary" disabled={createBusy}>
                {createBusy ? "Creating…" : "Create portfolio"}
              </button>
            </form>
          )}
        </section>
      )}

      <div className="dps-admin-layout">
        <aside className="dps-admin-list">
          <h2>All portfolios</h2>
          {list.length === 0 ? (
            <p className="dps-muted">No portfolios yet.</p>
          ) : (
            <ul>
              {list.map((p) => (
                <li key={p._id}>
                  <button
                    type="button"
                    className={selectedId === p._id ? "dps-list-btn active" : "dps-list-btn"}
                    onClick={() => loadDetail(p._id)}
                  >
                    <span className="dps-list-name">{p.displayName}</span>
                    <span className="dps-list-sub">
                      {[p.staff?.firstName, p.staff?.lastName].filter(Boolean).join(" ") || p.staff?.email || "—"}
                    </span>
                    {p.isPublished ? <span className="dps-pill">Live</span> : <span className="dps-pill dps-pill--draft">Draft</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <div className="dps-admin-detail">
          {detailLoading && <p className="dps-muted">Loading…</p>}
          {!detailLoading && !data && <p className="dps-muted">Select a portfolio.</p>}
          {!detailLoading && data && (
            <>
              {formError && <p className="dps-form-error">{formError}</p>}
              <form className="dps-form" onSubmit={handleSave}>
                <label className="dps-field">
                  Display name *
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    minLength={2}
                    maxLength={120}
                    disabled={!canEdit}
                  />
                </label>
                <label className="dps-field">
                  Headline
                  <input value={headline} onChange={(e) => setHeadline(e.target.value)} maxLength={200} disabled={!canEdit} />
                </label>
                <label className="dps-field">
                  Bio
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={6} maxLength={8000} disabled={!canEdit} />
                </label>
                <label className="dps-field">
                  Specialties (comma-separated)
                  <input value={specialtiesStr} onChange={(e) => setSpecialtiesStr(e.target.value)} disabled={!canEdit} />
                </label>
                <label className="dps-field">
                  Years of experience (0–80)
                  <input
                    inputMode="numeric"
                    value={yearsStr}
                    onChange={(e) => setYearsStr(e.target.value.replace(/\D/g, "").slice(0, 3))}
                    disabled={!canEdit}
                  />
                </label>
                <label className="dps-field">
                  Completed projects (0–100,000)
                  <input
                    inputMode="numeric"
                    value={projectsStr}
                    onChange={(e) => setProjectsStr(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    disabled={!canEdit}
                  />
                </label>
                <label className="dps-check">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    disabled={!canEdit}
                  />
                  Publish on the website
                </label>
                {canEdit && (
                  <button type="submit" className="dps-primary" disabled={saveBusy}>
                    {saveBusy ? "Saving…" : "Save profile"}
                  </button>
                )}
              </form>

              <section className="dps-images">
                <h2>Portfolio images</h2>
                {canEdit && (
                  <>
                    <p className="dps-images-hint">JPEG, PNG, GIF, or WebP · up to 8 MB each · max 15 images</p>
                    <div className="dps-upload-row">
                      <label className="dps-file">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          onChange={handleUpload}
                          disabled={uploadBusy}
                        />
                        {uploadBusy ? "Uploading…" : "Add image"}
                      </label>
                      <input
                        type="text"
                        className="dps-caption-input"
                        placeholder="Caption (optional)"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        maxLength={500}
                      />
                    </div>
                  </>
                )}

                <div className="dps-grid">
                  {(data.images || []).map((img) => (
                    <div key={img._id} className="dps-tile">
                      <img src={uploadUrl(img.relPath)} alt={img.caption || ""} />
                      {img.caption ? <p className="dps-tile-cap">{img.caption}</p> : null}
                      {canEdit && (
                        <button type="button" className="dps-remove" onClick={() => removeImage(img._id)}>
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DesignerPortfolioStaff(props) {
  const role = getStaffRole();

  if (role === "designer") {
    return <PortfolioMeEditor {...props} />;
  }

  const readOnly = role === "viewer" || role === "sales";
  return <PortfolioDirectory {...props} readOnly={readOnly} />;
}
