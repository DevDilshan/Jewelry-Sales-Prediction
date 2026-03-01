import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Dashboard from './components/pages/Dashboard'
// import Products from './components/pages/Products'
// import Discounts from './components/pages/Discounts'
// import Feedbacks from './components/pages/Feedbacks'
// import Orders from './components/pages/Orders'
import Admin from './components/pages/Admin'
import Profile from './components/pages/Profile'
import './App.css'
import LandingPage from './website/LandingPage'
import UserDashboard from './components/user/UserDashboard'
import UserOrders from './components/user/UserOrders'
import UserSidebar from './components/user/UserSidebar'
import ProfileSettings from './components/user/UserProfile'
import AddressBook from './components/user/Addressbook'
// import MyReviews from './components/user/Feedback'
import Sidebar from './components/layouts/Sidebar'

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

function AppContent() {
  const [activePage, setActivePage] = useState('dashboard')
  const location = useLocation()

  return (
    <div className="app-container">

      
      {location.pathname.startsWith("/admin") && (
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
      )}

      
      {location.pathname.startsWith("/dashboard") && (
        <UserSidebar />
      )}

      <main className="main-content">
        <Routes>
          <Route path="/admin/dashboard" element={<Dashboard setActivePage={setActivePage} />} />
          {/* <Route path="/admin/products" element={<Products setActivePage={setActivePage} />} /> */}
          {/* <Route path="/admin/discounts" element={<Discounts setActivePage={setActivePage} />} /> */}
          {/* <Route path="/admin/feedbacks" element={<Feedbacks setActivePage={setActivePage} />} /> */}
          {/* <Route path="/admin/orders" element={<Orders setActivePage={setActivePage} />} /> */}
          <Route path="/admin/staff" element={<Admin setActivePage={setActivePage} />} />
          <Route path="/admin/profile" element={<Profile setActivePage={setActivePage} />} />

          <Route path="/" element={<LandingPage />} />

          <Route path="/dashboard" element={<UserDashboard />} /> 
          <Route path="/dashboard/orders" element={<UserOrders />} />
          <Route path="/dashboard/address" element={<AddressBook />} />
          <Route path="/dashboard/profile" element={<ProfileSettings />} />

        </Routes>
      </main>
    </div>
  )
}