import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './AddressBook.css'


const EMPTY_FORM = { label: '', name: '', line1: '', line2: '', city: '', country: 'Sri Lanka', phone: '' }

export default function AddressBook() {
  const navigate = useNavigate()
  const location = useLocation()

  const [addresses, setAddresses] = useState([
    { id: 1, label: 'Primary Residence', name: 'Eleanor St. James', line1: '128 Rosewood Avenue', line2: 'Penthouse 4B', city: 'Colombo 07', country: 'Sri Lanka', phone: '+94 77 123 4567', isDefault: true },
  ])

  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)  // null = add, id = edit
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteConfirm, setDeleteConfirm] = useState(null) // id to delete

  const openAdd = () => {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (addr) => {
    setEditTarget(addr.id)
    setForm({ label: addr.label, name: addr.name, line1: addr.line1, line2: addr.line2, city: addr.city, country: addr.country, phone: addr.phone })
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editTarget !== null) {
      setAddresses(addresses.map(a => a.id === editTarget ? { ...a, ...form } : a))
    } else {
      const newAddr = { id: Date.now(), ...form, isDefault: addresses.length === 0 }
      setAddresses([...addresses, newAddr])
    }
    setShowModal(false)
  }

  const handleDelete = () => {
    const wasDefault = addresses.find(a => a.id === deleteConfirm)?.isDefault
    let updated = addresses.filter(a => a.id !== deleteConfirm)
    if (wasDefault && updated.length > 0) updated[0].isDefault = true
    setAddresses(updated)
    setDeleteConfirm(null)
  }

  const setDefault = (id) => {
    setAddresses(addresses.map(a => ({ ...a, isDefault: a.id === id })))
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="ab-layout">
      {/* Main */}
      <main className="ab-main">
        <div className="ab-top-bar">
          <div>
            <h1>Address Book</h1>
            <p>Manage your shipping and billing addresses for a seamless checkout.</p>
          </div>
          <button className="ab-add-btn" onClick={openAdd}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add New Address
          </button>
        </div>

        <div className="ab-grid">
          {addresses.map(addr => (
            <div key={addr.id} className={`ab-card ${addr.isDefault ? 'is-default' : ''}`}>
              <div className="ab-card-header">
                <div className="ab-card-label-row">
                  <span className="ab-card-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  </span>
                  <span className="ab-card-label">{addr.label}</span>
                </div>
                {addr.isDefault && <span className="ab-default-badge">DEFAULT</span>}
              </div>

              <div className="ab-card-body">
                <p className="ab-name">{addr.name}</p>
                <p className="ab-address-line">{addr.line1}</p>
                {addr.line2 && <p className="ab-address-line">{addr.line2}</p>}
                <p className="ab-address-line">{addr.city}, {addr.country}</p>
                <div className="ab-phone">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  {addr.phone}
                </div>
              </div>

              <div className="ab-card-footer">
                <div className="ab-card-actions">
                  <button className="ab-action-btn edit" onClick={() => openEdit(addr)}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    EDIT
                  </button>
                  <button className="ab-action-btn delete" onClick={() => setDeleteConfirm(addr.id)}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                    DELETE
                  </button>
                </div>
                {!addr.isDefault && (
                  <button className="ab-set-default" onClick={() => setDefault(addr.id)}>Set as Default</button>
                )}
              </div>
            </div>
          ))}

          {/* Add new slot */}
          <button className="ab-add-slot" onClick={openAdd}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>Add New Shipping Address</span>
          </button>
        </div>
      </main>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="ab-overlay" onClick={() => setShowModal(false)}>
          <div className="ab-modal" onClick={e => e.stopPropagation()}>
            <div className="ab-modal-header">
              <h2>{editTarget ? 'Edit Address' : 'Add New Address'}</h2>
              <button className="ab-modal-close" onClick={() => setShowModal(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="ab-modal-form">
              <div className="ab-field">
                <label>ADDRESS LABEL</label>
                <input type="text" required value={form.label} onChange={e => setForm({...form, label: e.target.value})} placeholder="e.g. Home, Office, Primary Residence" />
              </div>
              <div className="ab-field">
                <label>FULL NAME</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Eleanor St. James" />
              </div>
              <div className="ab-field">
                <label>ADDRESS LINE 1</label>
                <input type="text" required value={form.line1} onChange={e => setForm({...form, line1: e.target.value})} placeholder="Street address, building" />
              </div>
              <div className="ab-field">
                <label>ADDRESS LINE 2 <span className="ab-optional">(optional)</span></label>
                <input type="text" value={form.line2} onChange={e => setForm({...form, line2: e.target.value})} placeholder="Apartment, suite, floor" />
              </div>
              <div className="ab-field-row">
                <div className="ab-field">
                  <label>CITY</label>
                  <input type="text" required value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder="e.g. Colombo 07" />
                </div>
                <div className="ab-field">
                  <label>COUNTRY</label>
                  <select value={form.country} onChange={e => setForm({...form, country: e.target.value})}>
                    <option>Sri Lanka</option>
                    <option>India</option>
                    <option>Maldives</option>
                    <option>Singapore</option>
                    <option>United Kingdom</option>
                    <option>United States</option>
                  </select>
                </div>
              </div>
              <div className="ab-field">
                <label>PHONE NUMBER</label>
                <input type="tel" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+94 77 000 0000" />
              </div>
              <div className="ab-modal-actions">
                <button type="button" className="ab-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="ab-btn-submit">{editTarget ? 'Save Changes' : 'Add Address'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="ab-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="ab-modal ab-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="ab-modal-header">
              <h2>Delete Address</h2>
              <button className="ab-modal-close" onClick={() => setDeleteConfirm(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="ab-confirm-body">
              <div className="ab-confirm-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#e05c5c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <p>Are you sure you want to delete <strong>{addresses.find(a => a.id === deleteConfirm)?.label}</strong>? This cannot be undone.</p>
            </div>
            <div className="ab-modal-actions">
              <button className="ab-btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="ab-btn-danger" onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}