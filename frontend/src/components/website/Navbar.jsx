import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { getCustomerToken } from '../../config/api'
import CouponBanner from './CouponBanner'
import './Navbar.css'

export default function Navbar() {
    const navigate  = useNavigate()
    const location  = useLocation()
    const signedIn  = !!getCustomerToken()
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        const onScroll = () => {
            document.querySelector('.site-navbar')
                ?.classList.toggle('scrolled', window.scrollY > 10)
        }
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // Close mobile drawer on route change
    useEffect(() => { setMenuOpen(false) }, [location.pathname])

    const scrollToSection = (id) => {
        setMenuOpen(false)
        if (location.pathname !== '/') {
            navigate('/', { state: { scrollTo: id } })
            return
        }
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
    }

    const navLinks = (
        <>
            <button type="button" onClick={() => scrollToSection('hero')}     className="nav-link">Home</button>
            <Link   to="/shop"                                                 className="nav-link">Shop</Link>
            <Link   to="/designers"                                            className="nav-link">Designers</Link>
            <Link   to="/custom-design"                                        className="nav-link">Custom design</Link>
            <button type="button" onClick={() => scrollToSection('showcase')} className="nav-link">Featured</button>
            <button type="button" onClick={() => scrollToSection('about')}    className="nav-link">About</button>
            <button type="button" onClick={() => scrollToSection('contact')}  className="nav-link">Contact</button>
        </>
    )

    return (
        <header className="site-header">
            <CouponBanner />
            <nav className="site-navbar">
                <div className="navbar-inner">

                    {/* Logo */}
                    <Link to="/" className="navbar-logo">
                        <div className="navbar-logo-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <span>Beceff</span>
                    </Link>

                    {/* Desktop links */}
                    <div className="navbar-links">
                        {navLinks}
                    </div>

                    {/* Desktop actions */}
                    <div className="navbar-actions">
                        {signedIn ? (
                            <button type="button" className="btn-dashboard" onClick={() => navigate('/dashboard')}>
                                My account
                            </button>
                        ) : (
                            <>
                                <button type="button" className="nav-link" onClick={() => navigate('/login')}>
                                    Sign in
                                </button>
                                <button type="button" className="btn-dashboard" onClick={() => navigate('/register')}>
                                    Register
                                </button>
                            </>
                        )}

                        {/* Mobile hamburger */}
                        <button
                            type="button"
                            className="btn-menu-toggle"
                            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                            onClick={() => setMenuOpen(o => !o)}
                        >
                            {menuOpen ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6"  y1="6" x2="18" y2="18" />
                                </svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <line x1="3" y1="6"  x2="21" y2="6"  />
                                    <line x1="3" y1="12" x2="21" y2="12" />
                                    <line x1="3" y1="18" x2="21" y2="18" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile drawer */}
                <div className={`navbar-mobile-drawer${menuOpen ? ' open' : ''}`}>
                    {navLinks}
                    <div style={{ height: 8 }} />
                    {signedIn ? (
                        <button type="button" className="btn-dashboard" onClick={() => { setMenuOpen(false); navigate('/dashboard') }}>
                            My account
                        </button>
                    ) : (
                        <>
                            <button type="button" className="btn-dashboard" onClick={() => { setMenuOpen(false); navigate('/register') }}>
                                Register
                            </button>
                            <button type="button" className="nav-link" onClick={() => { setMenuOpen(false); navigate('/login') }}>
                                Sign in
                            </button>
                        </>
                    )}
                </div>
            </nav>
        </header>
    )
}