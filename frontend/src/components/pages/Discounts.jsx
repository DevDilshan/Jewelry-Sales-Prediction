import { useEffect, useState, useRef } from 'react'
import './Discounts.css'

export default function Discounts({ setActivePage }) {

  useEffect(() => {
    setActivePage('discounts')
  }, [setActivePage])

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [selectedDiscount, setSelectedDiscount] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const menuRef = useRef(null)

  const [discounts, setDiscounts] = useState([
    {
      id: 1,
      name: 'New Year Gift',
      code: 'NEWYEAR09820',
      type: 'Coupon',
      value: '15%',
      status: 'EXPIRED',
      duration: 'Jan 01 - Jan 15',
      startDate: '2026-01-01',
      endDate: '2026-01-15',
    },
    {
      id: 2,
      name: 'Valentine Sale 2026',
      code: 'VALENTINE0001',
      type: 'Coupon',
      value: '20%',
      status: 'ACTIVE',
      duration: 'Feb 13 - Feb 28',
      startDate: '2026-02-13',
      endDate: '2026-02-28',
    },
    {
      id: 3,
      name: 'Christmas Bonus',
      code: 'Christmas1234',
      type: 'Coupon',
      value: '15%',
      status: 'SCHEDULED',
      duration: 'Dec 12 - Dec 26',
      startDate: '2026-12-12',
      endDate: '2026-12-26',
    },
    {
      id: 4,
      name: 'Wedding Celebration',
      code: '',
      type: 'Discount',
      value: '35%',
      status: 'SCHEDULED',
      duration: 'Apr 28 - May 31',
      startDate: '2026-04-28',
      endDate: '2026-05-31',
    },
  ])

  const [newDiscount, setNewDiscount] = useState({
    name: '',
    type: 'Coupon',
    value: '',
    startDate: '',
    endDate: '',
  })

  const [updateForm, setUpdateForm] = useState({
    name: '',
    type: '',
    value: '',
    startDate: '',
    endDate: '',
    status: '',
  })

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredDiscounts = discounts.filter(discount => {
    const matchesSearch =
      discount.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (discount.code && discount.code.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === 'All' || discount.status === statusFilter
    const matchesType = typeFilter === 'All' || discount.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status) => {
    if (status === 'ACTIVE') return 'active'
    if (status === 'SCHEDULED') return 'scheduled'
    if (status === 'EXPIRED') return 'expired'
    return 'active'
  }

  const handleAddDiscount = (e) => {
    e.preventDefault()
    const disc = {
      id: discounts.length + 1,
      name: newDiscount.name,
      code: newDiscount.type === 'Coupon' ? 'AUTO-GENERATED' : '',
      type: newDiscount.type,
      value: `${newDiscount.value}%`,
      status: 'ACTIVE',
      duration: newDiscount.startDate && newDiscount.endDate
        ? `${newDiscount.startDate} - ${newDiscount.endDate}`
        : 'Always On',
      startDate: newDiscount.startDate,
      endDate: newDiscount.endDate,
    }
    setDiscounts([disc, ...discounts])
    setNewDiscount({ name: '', type: 'Coupon', value: '', startDate: '', endDate: '' })
    setShowCreateModal(false)
  }

  const handleView = (discount) => {
    setSelectedDiscount(discount)
    setOpenMenuId(null)
    setShowViewModal(true)
  }

  const handleUpdateOpen = (discount) => {
    setSelectedDiscount(discount)
    setUpdateForm({
      name: discount.name,
      type: discount.type,
      value: discount.value.replace('%', ''),
      startDate: discount.startDate,
      endDate: discount.endDate,
      status: discount.status,
    })
    setOpenMenuId(null)
    setShowUpdateModal(true)
  }

  const handleUpdateSubmit = () => {
    setDiscounts(discounts.map(d =>
      d.id === selectedDiscount.id
        ? {
            ...d,
            name: updateForm.name,
            type: updateForm.type,
            value: `${updateForm.value}%`,
            startDate: updateForm.startDate,
            endDate: updateForm.endDate,
            status: updateForm.status,
            duration: `${updateForm.startDate} - ${updateForm.endDate}`,
          }
        : d
    ))
    setShowUpdateModal(false)
  }

  const handleDelete = (id) => {
    setDiscounts(discounts.filter(d => d.id !== id))
    setOpenMenuId(null)
  }

  return (
    <div className="discounts-page">

      <div className="page-header">
        <div>
          <h1>Discounts & Promotions</h1>
          <p>Manage seasonal offers, promo codes, and luxury rewards.</p>
        </div>
        <button className="create-btn" onClick={() => setShowCreateModal(true)}>
          + Create New Discount
        </button>
      </div>

      <div className="discounts-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by discount name or code..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">Status: All</option>
          <option value="ACTIVE">Active</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="EXPIRED">Expired</option>
        </select>
        <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="All">Type: All</option>
          <option value="Coupon">Coupon</option>
          <option value="Discount">Discount</option>
        </select>
      </div>

      <div className="discounts-table-container">
        <table className="discounts-table">
          <thead>
            <tr>
              <th>DISCOUNT NAME</th>
              <th>TYPE</th>
              <th>VALUE</th>
              <th>STATUS</th>
              <th>DURATION</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredDiscounts.map((discount) => (
              <tr key={discount.id}>
                <td>
                  <div className="discount-info">
                    <p className="discount-name">{discount.name}</p>
                    {discount.type === 'Coupon' && (
                      <p className="discount-code">CODE: {discount.code}</p>
                    )}
                  </div>
                </td>
                <td>{discount.type}</td>
                <td>{discount.value}</td>
                <td>
                  <span className={`status-badge ${getStatusColor(discount.status)}`}>
                    {discount.status}
                  </span>
                </td>
                <td>{discount.duration}</td>
                <td style={{ position: 'relative' }}>
                  <button
                    className="action-icon"
                    onClick={() => setOpenMenuId(openMenuId === discount.id ? null : discount.id)}
                  >
                    ⋮
                  </button>
                  {openMenuId === discount.id && (
                    <div className="action-menu" ref={menuRef}>
                      <button onClick={() => handleView(discount)}>View</button>
                      <button onClick={() => handleUpdateOpen(discount)}>Update</button>
                      <button className="delete-option" onClick={() => handleDelete(discount.id)}>Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Discount</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddDiscount}>
              <div className="form-group">
                <label>Discount Name</label>
                <input type="text" required value={newDiscount.name}
                  onChange={(e) => setNewDiscount({ ...newDiscount, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={newDiscount.type}
                  onChange={(e) => setNewDiscount({ ...newDiscount, type: e.target.value })}>
                  <option value="Coupon">Coupon</option>
                  <option value="Discount">Discount</option>
                </select>
              </div>
              <div className="form-group">
                <label>Discount Percentage</label>
                <input type="number" required placeholder="e.g. 15" value={newDiscount.value}
                  onChange={(e) => setNewDiscount({ ...newDiscount, value: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="text" value={newDiscount.startDate}
                    onChange={(e) => setNewDiscount({ ...newDiscount, startDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="text" value={newDiscount.endDate}
                    onChange={(e) => setNewDiscount({ ...newDiscount, endDate: e.target.value })} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Create Discount</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showViewModal && selectedDiscount && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>View Discounts</h2>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>✕</button>
            </div>
            <div className="view-body">
              <div className="view-row"><span className="view-label">Discount Name :</span> {selectedDiscount.name}</div>
              <div className="view-row"><span className="view-label">Discount Type :</span> {selectedDiscount.type}</div>
              <div className="view-row"><span className="view-label">Percentage :</span> {selectedDiscount.value}</div>
              <div className="view-row"><span className="view-label">Start Date :</span> {selectedDiscount.startDate}</div>
              <div className="view-row"><span className="view-label">End Date :</span> {selectedDiscount.endDate}</div>
              <div className="view-row">
                <span className="view-label">Status</span>
                <div style={{ marginTop: '6px' }}>
                  <span className={`status-badge ${getStatusColor(selectedDiscount.status)}`}>
                    {selectedDiscount.status.charAt(0) + selectedDiscount.status.slice(1).toLowerCase()}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-actions" style={{ padding: '0 28px 24px' }}>
              <button
                className="btn-delete"
                onClick={() => { handleDelete(selectedDiscount.id); setShowViewModal(false) }}
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE MODAL */}
      {showUpdateModal && selectedDiscount && (
        <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Discount</h2>
              <button className="modal-close" onClick={() => setShowUpdateModal(false)}>✕</button>
            </div>
            <div className="view-body">
              <div className="view-row edit-row">
                <span className="view-label">New Discount Name :</span>
                <input className="update-input" value={updateForm.name}
                  onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })} />
              </div>
              <div className="view-row edit-row">
                <span className="view-label">New Discount Type :</span>
                <select className="update-input" value={updateForm.type}
                  onChange={(e) => setUpdateForm({ ...updateForm, type: e.target.value })}>
                  <option value="Coupon">Coupon</option>
                  <option value="Discount">Discount</option>
                </select>
              </div>
              <div className="view-row edit-row">
                <span className="view-label">New Percentage :</span>
                <input className="update-input" type="number" value={updateForm.value}
                  onChange={(e) => setUpdateForm({ ...updateForm, value: e.target.value })} />
              </div>
              <div className="view-row edit-row">
                <span className="view-label">New Start Date :</span>
                <input className="update-input" value={updateForm.startDate}
                  onChange={(e) => setUpdateForm({ ...updateForm, startDate: e.target.value })} />
              </div>
              <div className="view-row edit-row">
                <span className="view-label">New End Date :</span>
                <input className="update-input" value={updateForm.endDate}
                  onChange={(e) => setUpdateForm({ ...updateForm, endDate: e.target.value })} />
              </div>
              <div className="view-row edit-row">
                <span className="view-label">Status</span>
                <select className="update-input" value={updateForm.status}
                  onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}>
                  <option value="ACTIVE">Active</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>
            </div>
            <div className="modal-actions" style={{ padding: '0 28px 24px' }}>
              <button className="btn-submit" onClick={handleUpdateSubmit}>UPDATE</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}