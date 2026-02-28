import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Sidebar.css'

const icons = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="7" height="7" rx="1.5" />
      <rect x="11" y="2" width="7" height="7" rx="1.5" />
      <rect x="2" y="11" width="7" height="7" rx="1.5" />
      <rect x="11" y="11" width="7" height="7" rx="1.5" />
    </svg>
  ),
  products: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="14" height="14" rx="2" />
      <path d="M3 8h14" />
      <path d="M8 3v5" />
    </svg>
  ),
  discounts: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 2.5L17.5 9.5a1 1 0 010 1.41l-6.59 6.59a1 1 0 01-1.41 0L2.5 10.5V4.5a2 2 0 012-2h6z" />
      <circle cx="7" cy="7" r="1.5" fill="currentColor" />
    </svg>
  ),
  feedbacks: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h12a2 2 0 012 2v7a2 2 0 01-2 2H7l-4 3V6a2 2 0 012-2z" />
    </svg>
  ),
  orders: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h1l2 9h8l2-6H6" />
      <circle cx="8" cy="16" r="1.5" />
      <circle cx="14" cy="16" r="1.5" />
    </svg>
  ),
  staff: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 17v-1a3 3 0 00-3-3H8a3 3 0 00-3 3v1" />
      <circle cx="10" cy="7" r="3" />
    </svg>
  ),
}

export default function Sidebar({ activePage, setActivePage }) {
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard' },
    { id: 'products', label: 'Products', path: '/admin/products' },
    { id: 'discounts', label: 'Discounts', path: '/admin/discounts' },
    { id: 'feedbacks', label: 'Feedbacks', path: '/admin/feedbacks' },
    { id: 'orders', label: 'Orders', path: '/admin/orders' },
    { id: 'staff', label: 'Admin', path: '/admin/staff' },
  ]

  const handleNavigate = (item) => {
    setActivePage(item.id)
    navigate(item.path)
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="logo-text">BECEFF</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => handleNavigate(item)}
          >
            <span className="nav-icon">{icons[item.id]}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-section">
          <div className="user-avatar-img">
            <img src="https://i.pravatar.cc/80?img=47" alt="Nayomi Silva" />
          </div>
          <div className="user-info" >
            <p className="user-name" onClick={() => navigate('admin/profile')}>Nayomi Silva</p>
            <p className="user-role">ADMIN</p>
          </div>
          <button
            className="user-menu-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            ⋮
          </button>
        </div>
        {showUserMenu && (
          <div className="user-menu">
            <button onClick={() => {
              setActivePage('profile')
              navigate('/admin/profile')
              setShowUserMenu(false)
            }}>
              My Profile
            </button>
            {/* <button onClick={() => navigate('/')}>Visit Website</button> */}
            <button onClick={() => alert('Logging out...')}>Logout</button>
          </div>
        )}
      </div>
    </aside>
  )
}
