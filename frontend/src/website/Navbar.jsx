import { Link, useNavigate } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
    const navigate = useNavigate()

    const scrollTo = (id) => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <nav className="site-navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-logo">
                    <div className="navbar-logo-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span>AURELIA</span>
                </Link>

                <div className="navbar-links">
                    <button onClick={() => scrollTo('hero')} className="nav-link">Home</button>
                    <button onClick={() => scrollTo('collections')} className="nav-link">Collections</button>
                    <button onClick={() => scrollTo('about')} className="nav-link">About</button>
                    <button onClick={() => scrollTo('contact')} className="nav-link">Contact</button>
                </div>

                <div className="navbar-actions">
                    <button className="btn-dashboard" onClick={() => navigate('/dashboard')}>
                        My Account
                    </button>
                </div>
            </div>
        </nav>
    )
}
