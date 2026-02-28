import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StatCard from '../common/StatCard'
import SalesChart from '../common/SalesChart'
import './Dashboard.css'

export default function Dashboard({ setActivePage }) {
  const navigate = useNavigate()

  useEffect(() => {
    setActivePage('dashboard')
  }, [setActivePage])

  const featuredItems = [
    { id: 1, name: 'Solitaire Diamond Ring', price: 'LKR 1,250,000', img: '💎' },
    { id: 2, name: 'Heritage Gold Necklace', price: 'LKR 650,000', img: '✨' },
    { id: 3, name: 'Ocean Pearl Earrings', price: 'LKR 280,000', img: '🌊' },
  ]

  const recentOrders = [
    {
      id: '#AUR-8921',
      customer: 'Eleanor Bennett',
      initials: 'EB',
      category: 'Diamond Rings',
      amount: 'LKR 3,450,000',
    },
    {
      id: '#AUR-8922',
      customer: 'Marcus Sterling',
      initials: 'MS',
      category: 'Gold Bracelets',
      amount: 'LKR 950,000',
    },
  ]

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Refined luxury management for Aurelia Fine Jewelry.</p>
        </div>
        <div className="header-actions">
          <div className="search-box-dash">
            <svg className="search-icon-dash" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input type="text" placeholder="Search entries..." className="search-input-dash" />
          </div>
          <button className="notification-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <span className="notification-dot"></span>
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="TOTAL REVENUE"
          value="LKR 4,280,430"
          change="+12.5% vs last month"
          changeType="positive"
        />
        <StatCard
          title="TOTAL ORDERS"
          value="452"
          change="+8.2% increase"
          changeType="positive"
        />
        <StatCard
          title="NEW FEEDBACK"
          value="12"
          change="+5.4% response rate"
          changeType="positive"
        />
      </div>

      <div className="dashboard-grid">
        <div className="chart-section">
          <div className="section-header">
            <h2>Sales Trends</h2>
            <span className="currency">CURRENCY: LKR</span>
          </div>
          <SalesChart />
        </div>

        <div className="featured-section">
          <h2>Featured Items</h2>
          <div className="featured-items">
            {featuredItems.map(item => (
              <div key={item.id} className="featured-item">
                <div className="item-image">{item.img}</div>
                <div className="item-info">
                  <p className="item-name">{item.name}</p>
                  <p className="item-price">{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="recent-orders-section">
        <div className="section-header">
          <h2>Recent Orders</h2>
          <a
            href="#"
            className="view-all-link"
            onClick={(e) => {
              e.preventDefault()
              setActivePage('orders')
              navigate('/orders')
            }}
          >
            VIEW ALL ORDERS
          </a>
        </div>
        <table className="orders-table">
          <thead>
            <tr>
              <th>ORDER ID</th>
              <th>CUSTOMER</th>
              <th>CATEGORY</th>
              <th>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map(order => (
              <tr key={order.id}>
                <td className="order-id">{order.id}</td>
                <td>
                  <div className="order-customer">
                    <div className="order-avatar">{order.initials}</div>
                    <span>{order.customer}</span>
                  </div>
                </td>
                <td className="text-light">{order.category}</td>
                <td className="amount-col">{order.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
