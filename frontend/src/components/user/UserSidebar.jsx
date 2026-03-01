import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './UserSidebar.css'

const icons = {
    overview: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="7" height="7" rx="1.5" />
            <rect x="11" y="2" width="7" height="7" rx="1.5" />
            <rect x="2" y="11" width="7" height="7" rx="1.5" />
            <rect x="11" y="11" width="7" height="7" rx="1.5" />
        </svg>
    ),
    orders: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="14" height="14" rx="2" />
            <path d="M3 8h14" />
            <path d="M8 3v5" />
        </svg>
    ),
    wishlist: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 17s-7-4.35-7-8.65C3 5.55 5.24 3.5 7.5 3.5c1.54 0 2.5.99 2.5.99S11.96 3.5 12.5 3.5C14.76 3.5 17 5.55 17 8.35 17 12.65 10 17 10 17z" />
        </svg>
    ),
    address: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" />
            <circle cx="12" cy="10" r="2.5" />
        </svg>
    ),
    feedback: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4z" />
        </svg>
    ),
    profile: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 17v-1a3 3 0 00-3-3H8a3 3 0 00-3 3v1" />
            <circle cx="10" cy="7" r="3" />
        </svg>
    ),
}

export default function UserSidebar() {
    const navigate = useNavigate()
    const location = useLocation()

    const getActive = () => {
        if (location.pathname.includes('/orders')) return 'orders'
        if (location.pathname.includes('/wishlist')) return 'wishlist'
        if (location.pathname.includes('/profile')) return 'profile'
        if (location.pathname.includes('/address')) return 'address'
        if (location.pathname.includes('/feedback')) return 'feedback'
        return 'overview'
    }

    const activePage = getActive()

    const menuItems = [
        { id: 'overview', label: 'Overview', path: '/dashboard' },
        { id: 'orders', label: 'My Orders', path: '/dashboard/orders' },
        { id: 'wishlist', label: 'Wishlist', path: '/dashboard/wishlist' },
        { id: 'address', label: 'Address Book', path: '/dashboard/address' },
        { id: 'feedback', label: 'Feedback', path: '/dashboard/feedback' },
        { id: 'profile', label: 'Profile', path: '/dashboard/profile' },
    ]

    return (
        <aside className="user-sidebar">
            <div className="user-sidebar-logo" onClick={() => navigate('/')}>
                <div className="user-logo-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <span>BECEFF</span>
            </div>

            <nav className="user-sidebar-nav">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        className={`user-nav-item ${activePage === item.id ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                    >
                        <span className="user-nav-icon">{icons[item.id]}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="user-sidebar-footer">
                <button className="user-nav-item" onClick={() => navigate('/')}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 10l7-7 7 7" />
                        <path d="M5 8v8a1 1 0 001 1h3v-4h2v4h3a1 1 0 001-1V8" />
                    </svg>
                    <span>Back to Website</span>
                </button>
                <button className="user-nav-item logout" onClick={() => alert('Logging out...')}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17H4a1 1 0 01-1-1V4a1 1 0 011-1h3" />
                        <polyline points="11,14 15,10 11,6" />
                        <line x1="15" y1="10" x2="7" y2="10" />
                    </svg>
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    )
}
