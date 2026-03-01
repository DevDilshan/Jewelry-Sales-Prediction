import { useNavigate } from 'react-router-dom'
import './UserDashboard.css'

export default function UserDashboard() {
    const navigate = useNavigate()

    const recentOrders = [
        { id: '#AUR-8921', item: 'Solitaire Diamond Ring', date: 'Oct 12, 2023', status: 'DELIVERED', amount: 'LKR 1,250,000' },
        { id: '#AUR-8918', item: 'Heritage Gold Necklace', date: 'Oct 08, 2023', status: 'SHIPPED', amount: 'LKR 650,000' },
        { id: '#AUR-8915', item: 'Ocean Pearl Earrings', date: 'Sep 28, 2023', status: 'DELIVERED', amount: 'LKR 280,000' },
    ]

    const wishlistItems = [
        { id: 1, name: 'Starlight Platinum Watch', price: 'LKR 5,800,000', icon: '⌚' },
        { id: 2, name: 'Ruby Heart Pendant', price: 'LKR 420,000', icon: '❤️' },
    ]

    return (
        <div className="user-dashboard">
            <div className="ud-header">
                <div>
                    <h1>Welcome back, Sarah!</h1>
                    <p>Here's an overview of your account and recent activity.</p>
                </div>
            </div>

            <div className="ud-stats">
                <div className="ud-stat-card">
                    <div className="ud-stat-icon">📦</div>
                    <div>
                        <p className="ud-stat-value">8</p>
                        <p className="ud-stat-label">Total Orders</p>
                    </div>
                </div>
                <div className="ud-stat-card">
                    <div className="ud-stat-icon">❤️</div>
                    <div>
                        <p className="ud-stat-value">2</p>
                        <p className="ud-stat-label">Wishlist Items</p>
                    </div>
                </div>
                <div className="ud-stat-card">
                    <div className="ud-stat-icon">⭐</div>
                    <div>
                        <p className="ud-stat-value">3</p>
                        <p className="ud-stat-label">Reviews Given</p>
                    </div>
                </div>
                <div className="ud-stat-card">
                    <div className="ud-stat-icon">🏆</div>
                    <div>
                        <p className="ud-stat-value">Gold</p>
                        <p className="ud-stat-label">Member Tier</p>
                    </div>
                </div>
            </div>

            <div className="ud-grid">
                <div className="ud-section">
                    <div className="ud-section-header">
                        <h2>Recent Orders</h2>
                        <button className="ud-view-all" onClick={() => navigate('/dashboard/orders')}>View All →</button>
                    </div>
                    <table className="ud-table">
                        <thead>
                            <tr>
                                <th>ORDER ID</th>
                                <th>ITEM</th>
                                <th>DATE</th>
                                <th>STATUS</th>
                                <th>AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map(order => (
                                <tr key={order.id}>
                                    <td className="ud-order-id">{order.id}</td>
                                    <td>{order.item}</td>
                                    <td className="ud-text-light">{order.date}</td>
                                    <td>
                                        <span className={`ud-status ${order.status.toLowerCase()}`}>{order.status}</span>
                                    </td>
                                    <td className="ud-amount">{order.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="ud-section">
                    <div className="ud-section-header">
                        <h2>Your Wishlist</h2>
                        <button className="ud-view-all" onClick={() => navigate('/dashboard/wishlist')}>View All →</button>
                    </div>
                    <div className="ud-wishlist-items">
                        {wishlistItems.map(item => (
                            <div key={item.id} className="ud-wishlist-item">
                                <div className="ud-wishlist-icon">{item.icon}</div>
                                <div className="ud-wishlist-info">
                                    <p className="ud-wishlist-name">{item.name}</p>
                                    <p className="ud-wishlist-price">{item.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
