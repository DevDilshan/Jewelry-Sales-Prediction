import { useNavigate, useLocation } from 'react-router-dom'
import { setCustomerAuth } from '../../config/api'
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
    feedback: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L10 14.9 5.2 16.9l.9-5.4L2.2 7.7l5.4-.8L10 2z" />
        </svg>
    ),
    shop: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 4h14l-1 10H4L3 4z" />
            <path d="M7 4V3a1 1 0 011-1h4a1 1 0 011 1v1" />
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
        if (location.pathname.includes('/feedback')) return 'feedback'
        if (location.pathname.includes('/shop')) return 'shop'
        if (location.pathname.includes('/profile')) return 'profile'
        return 'overview'
    }

    const activePage = getActive()

    const menuItems = [
        { id: 'overview', label: 'Overview', path: '/dashboard' },
        { id: 'orders', label: 'My Orders', path: '/dashboard/orders' },
        { id: 'feedback', label: 'My Reviews', path: '/dashboard/feedback' },
        { id: 'shop', label: 'Shop', path: '/shop' },
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
                <span>AURELIA</span>
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
                <button
                    type="button"
                    className="user-nav-item logout"
                    onClick={() => {
                        setCustomerAuth(null, null)
                        navigate('/')
                    }}
                >
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
