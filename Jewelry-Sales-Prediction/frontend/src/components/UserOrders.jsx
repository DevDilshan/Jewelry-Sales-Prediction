import './UserOrders.css'

export default function UserOrders() {
    const orders = [
        { id: '#AUR-8921', item: 'Solitaire Diamond Ring', category: 'Diamond Rings', date: 'Oct 12, 2023', status: 'COMPLETED', amount: 'LKR 1,250,000' },
        { id: '#AUR-8918', item: 'Heritage Gold Necklace', category: 'Gold Necklaces', date: 'Oct 08, 2023', status: 'PROCESSING', amount: 'LKR 650,000' },
        { id: '#AUR-8915', item: 'Ocean Pearl Earrings', category: 'Pearl Collection', date: 'Sep 28, 2023', status: 'COMPLETED', amount: 'LKR 280,000' },
        { id: '#AUR-8910', item: 'Royal Sapphire Pendant', category: 'Necklaces', date: 'Sep 15, 2023', status: 'COMPLETED', amount: 'LKR 890,000' },
        { id: '#AUR-8905', item: 'Emerald Cut Ring', category: 'Diamond Rings', date: 'Sep 02, 2023', status: 'COMPLETED', amount: 'LKR 1,750,000' },
        { id: '#AUR-8898', item: 'Gold Charm Bracelet', category: 'Gold Bracelets', date: 'Aug 20, 2023', status: 'COMPLETED', amount: 'LKR 320,000' },
        { id: '#AUR-8890', item: 'Diamond Stud Earrings', category: 'Diamond Earrings', date: 'Aug 05, 2023', status: 'COMPLETED', amount: 'LKR 540,000' },
        { id: '#AUR-8882', item: 'Platinum Band Ring', category: 'Rings', date: 'Jul 18, 2023', status: 'COMPLETED', amount: 'LKR 980,000' },
    ]

    const getStatusClass = (status) => status.toLowerCase()

    return (
        <div className="user-orders-page">
            <div className="uo-header">
                <div>
                    <h1>My Orders</h1>
                    <p>Track and manage all your jewelry purchases.</p>
                </div>
            </div>

            <div className="uo-summary">
                <div className="uo-summary-card">
                    <span className="uo-summary-num">8</span>
                    <span className="uo-summary-label">Total Orders</span>
                </div>
                <div className="uo-summary-card">
                    <span className="uo-summary-num">6</span>
                    <span className="uo-summary-label">Delivered</span>
                </div>
                <div className="uo-summary-card">
                    <span className="uo-summary-num">1</span>
                    <span className="uo-summary-label">In Transit</span>
                </div>
                <div className="uo-summary-card">
                    <span className="uo-summary-num">LKR 6.66M</span>
                    <span className="uo-summary-label">Total Spent</span>
                </div>
            </div>

            <div className="uo-table-container">
                <table className="uo-table">
                    <thead>
                        <tr>
                            <th>ORDER ID</th>
                            <th>ITEM</th>
                            <th>CATEGORY</th>
                            <th>DATE</th>
                            <th>STATUS</th>
                            <th>AMOUNT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td className="uo-id">{order.id}</td>
                                <td className="uo-item">{order.item}</td>
                                <td className="uo-category">{order.category}</td>
                                <td className="uo-date">{order.date}</td>
                                <td>
                                    <span className={`uo-status ${getStatusClass(order.status)}`}>{order.status}</span>
                                </td>
                                <td className="uo-amount">{order.amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
