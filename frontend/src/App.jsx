import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/layouts/Sidebar'
import StaffGuard from './components/layouts/StaffGuard'
import Dashboard from './components/pages/Dashboard'
import Products from './components/pages/Products'
import Discounts from './components/pages/Discounts'
import Feedbacks from './components/pages/Feedbacks'
import Orders from './components/pages/Orders'
import Admin from './components/pages/Admin'
import Profile from './components/pages/Profile'
import './App.css'
import LandingPage from './components/website/LandingPage'
import Shop from './components/website/Shop'
import ShopProductPage from './components/website/ShopProductPage'
import Login from './components/pages/Login'
import Register from './components/pages/Register'
import StaffLogin from './components/pages/StaffLogin'
import StaffSetup from './components/pages/StaffSetup'
import StaffForgotPassword from './components/pages/StaffForgotPassword'
import StaffResetPassword from './components/pages/StaffResetPassword'
import CustomerForgotPassword from './components/pages/CustomerForgotPassword'
import CustomerResetPassword from './components/pages/CustomerResetPassword'
import UserDashboard from './components/user/UserDashboard'
import UserOrders from './components/user/UserOrders'
import UserSidebar from './components/user/UserSidebar'
import ProfileSettings from './components/user/UserProfile'
import AddressBook from './components/user/AddressBook'
import MyReviews from './components/user/Feedback'
import SalesPrediction from './components/pages/SalesPrediction'
import CustomDesignPage from './components/website/CustomDesignPage'
import DesignersPage from './components/website/DesignersPage'
import DesignerPortfolioPublicPage from './components/website/DesignerPortfolioPublicPage'
import UserCustomDesign from './components/user/UserCustomDesign'
import CustomDesignRequestsAdmin from './components/pages/CustomDesignRequestsAdmin'
import DesignerPortfolioStaff from './components/pages/DesignerPortfolioStaff'
import AdminCustomers from './components/pages/AdminCustomers'
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
  const path = location.pathname
  const isPublicAdminAuth =
    path === '/admin/login' ||
    path === '/admin/setup-first' ||
    path === '/admin/forgot-password' ||
    path === '/admin/reset-password'
  const isAdminShell = path.startsWith('/admin') && !isPublicAdminAuth

  
  return (
    <div className="app-container">

      {isAdminShell && (
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
      )}

      {location.pathname.startsWith("/dashboard") && (
        <UserSidebar />
      )}

      <main className="main-content">
        <Routes>
          {/* Admin routes — each wrapped with StaffGuard + pageId for role check */}
          <Route path="/admin" element={
            <StaffGuard pageId="dashboard">
              <Dashboard setActivePage={setActivePage} />
            </StaffGuard>
          } />
          <Route path="/admin/products" element={
            <StaffGuard pageId="products">
              <Products setActivePage={setActivePage} />
            </StaffGuard>
          } />
          <Route path="/admin/discounts" element={
            <StaffGuard pageId="discounts">
              <Discounts setActivePage={setActivePage} />
            </StaffGuard>
          } />
          <Route path="/admin/feedbacks" element={
            <StaffGuard pageId="feedbacks">
              <Feedbacks setActivePage={setActivePage} />
            </StaffGuard>
          } />
          <Route path="/admin/orders" element={
            <StaffGuard pageId="orders">
              <Orders setActivePage={setActivePage} />
            </StaffGuard>
          } />
          <Route path="/admin/customers" element={
            <StaffGuard pageId="customers">
              <AdminCustomers setActivePage={setActivePage} />
            </StaffGuard>
          } />
          <Route path="/admin/staff" element={
            <StaffGuard pageId="staff">
              <Admin setActivePage={setActivePage} />
            </StaffGuard>
          } />
          <Route path="/admin/profile" element={
            <StaffGuard pageId="profile">
              <Profile setActivePage={setActivePage} />
            </StaffGuard>
          } />
          <Route path="/admin/sales-prediction" element={
            <StaffGuard pageId="sales-prediction">
              <SalesPrediction setActivePage={setActivePage} />
            </StaffGuard>
          } />
          <Route path="/admin/custom-design-requests" element={
            <StaffGuard pageId="custom-design-requests">
              <CustomDesignRequestsAdmin setActivePage={setActivePage} />
            </StaffGuard>
          } />
          <Route path="/admin/designer-portfolio" element={
            <StaffGuard pageId="designer-portfolio">
              <DesignerPortfolioStaff setActivePage={setActivePage} />
            </StaffGuard>
          } />
          <Route path="/admin/login" element={<StaffLogin />} />
          <Route path="/admin/forgot-password" element={<StaffForgotPassword />} />
          <Route path="/admin/reset-password" element={<StaffResetPassword />} />
          <Route path="/admin/setup-first" element={<StaffSetup />} />

          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/shop/product/:productId" element={<ShopProductPage />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/custom-design" element={<CustomDesignPage />} />
          <Route path="/designers/:portfolioId" element={<DesignerPortfolioPublicPage />} />
          <Route path="/designers" element={<DesignersPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<CustomerForgotPassword />} />
          <Route path="/reset-password" element={<CustomerResetPassword />} />
          <Route path="/register" element={<Register />} />

          {/* Customer dashboard */}
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/dashboard/orders" element={<UserOrders />} />
          <Route path="/dashboard/address" element={<AddressBook />} />
          <Route path="/dashboard/profile" element={<ProfileSettings />} />
          <Route path="/dashboard/feedback" element={<MyReviews />} />
          <Route path="/dashboard/custom-design" element={<UserCustomDesign />} />
        </Routes>
      </main>
    </div>
  )
}
