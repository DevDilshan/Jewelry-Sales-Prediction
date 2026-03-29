import { Link, useNavigate } from 'react-router-dom'
import { getCustomerToken } from '../../config/api'
import CouponBanner from './CouponBanner'
import './Navbar.css'

export default function Navbar() {
    const navigate = useNavigate()
    const signedIn = !!getCustomerToken()

    const scrollToSection = (id) => {
        if (location.pathname !== "/") {
            navigate("/", { state: { scrollTo: id } });
            return;
        }

        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <header className="site-header">
            <CouponBanner />
            <nav className="site-navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-logo">
                    <div className="navbar-logo-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span>Beceff</span>
                </Link>

                <div className="navbar-links">
                    <button type="button" onClick={() => scrollToSection('hero')} className="nav-link">Home</button>
                    <Link to="/shop" className="nav-link">Shop</Link>
                    <button type="button" onClick={() => scrollToSection('showcase')} className="nav-link">Featured</button>
                    <button type="button" onClick={() => scrollToSection('about')} className="nav-link">About</button>
                    <button type="button" onClick={() => scrollToSection('contact')} className="nav-link">Contact</button>
                </div>

                <div className="navbar-actions">
                    {signedIn ? (
                        <button type="button" className="btn-dashboard" onClick={() => navigate('/dashboard')}>
                            My Account
                        </button>
                    ) : (
                        <>
                            <button type="button" className="nav-link" onClick={() => navigate('/login')}>Sign in</button>
                            <button type="button" className="btn-dashboard" onClick={() => navigate('/register')}>
                                Register
                            </button>
                        </>
                    )}
                </div>
            </div>
            </nav>
        </header>
    )
}
