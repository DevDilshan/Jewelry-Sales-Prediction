import { useEffect, useState } from 'react'
import StatCard from '../common/StatCard'
import './Feedback.css'

export default function Feedbacks({ setActivePage }) {
  useEffect(() => {
    setActivePage('feedbacks')
  }, [setActivePage])

  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const reviews = [
    {
      id: 1,
      name: 'Eleanor Bennett',
      email: 'eleanor.b@email.com',
      rating: 5,
      date: 'Oct 12, 2023',
      review: '"The Diamond Eternity Ring I purchased is absolutely breathtaking',
      status: 'reply',
      initials: 'EB',
      color: '#e8d5f5',
      textColor: '#7c3aed',
    },
    {
      id: 2,
      name: 'Marcus Thorne',
      email: 'm.thorne@luxury.com',
      rating: 5,
      date: 'Oct 10, 2023',
      review: '"Fast delivery and beautiful packaging. My wife loved the sapphire necklace',
      status: 'replied',
      initials: 'MT',
      color: '#fde8d0',
      textColor: '#d97706',
    },
    {
      id: 3,
      name: 'Sophia Kinsley',
      email: 'sophia.k@web.me',
      rating: 4,
      date: 'Oct 08, 2023',
      review: '"Excellent customer service. They helped me choose the perfect...',
      status: 'reply',
      initials: 'SK',
      color: '#d5eef5',
      textColor: '#0891b2',
    },
    {
      id: 4,
      name: 'James Whittaker',
      email: 'jw.hitt@business.com',
      rating: 4,
      date: 'Oct 05, 2023',
      review: '"The custom engraving was slightly off-center. Good service overall but',
      status: 'reply',
      initials: 'JW',
      color: '#fde8d0',
      textColor: '#d97706',
    },
  ]

  const filteredReviews = reviews.filter(review => {
    const matchesSearch =
      review.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.email.toLowerCase().includes(searchQuery.toLowerCase())
    if (filterType === 'all') return matchesSearch
    if (filterType === '5') return review.rating === 5 && matchesSearch
    if (filterType === '4') return review.rating === 4 && matchesSearch
    if (filterType === '3') return review.rating === 3 && matchesSearch
    if (filterType === 'below3') return review.rating < 3 && matchesSearch
    return matchesSearch
  })

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < rating ? 'filled' : 'empty'}`}>★</span>
    ))
  }

  return (
    <div className="feedbacks-page">
      <div className="page-header">
        <div>
          <h1>Customer Feedbacks & Reviews</h1>
          <p>Manage and respond to luxury jewelry client testimonials and store ratings.</p>
        </div>
        <button className="export-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7,10 12,15 17,10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Average Rating"
          value="4.8"
          extra="★★★★★"
          change="+0.2 from last month"
          changeType="positive"
        />
        <StatCard
          title="Total Reviews"
          value="1,240"
          change="12 new reviews today"
          changeType="positive"
        />
        <StatCard
          title="Response Rate"
          value="92%"
          change="Avg. response time: 4.5 hours"
          changeType="positive"
        />
      </div>

      <div className="feedbacks-section">
        <div className="feedbacks-header">
          <div className="search-box-fb">
            <svg className="search-icon-fb" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search by customer name or keyword..."
              className="search-input-fb"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All Reviews
            </button>
            <button
              className={`filter-btn ${filterType === '5' ? 'active' : ''}`}
              onClick={() => setFilterType('5')}
            >
              5 Stars
            </button>
            <button
              className={`filter-btn ${filterType === '4' ? 'active' : ''}`}
              onClick={() => setFilterType('4')}
            >
              4 Stars
            </button>
            <button
              className={`filter-btn ${filterType === '3' ? 'active' : ''}`}
              onClick={() => setFilterType('3')}
            >
              3 Stars
            </button>
            <button
              className={`filter-btn ${filterType === 'below3' ? 'active' : ''}`}
              onClick={() => setFilterType('below3')}
            >
              Below 3
            </button>
          </div>
        </div>

        <table className="reviews-table">
          <thead>
            <tr>
              <th>CUSTOMER</th>
              <th>RATING</th>
              <th>DATE</th>
              <th>REVIEW</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.map(review => (
              <tr key={review.id}>
                <td>
                  <div className="customer-info">
                    <div
                      className="avatar-fb"
                      style={{ background: review.color, color: review.textColor }}
                    >
                      {review.initials}
                    </div>
                    <div>
                      <p className="customer-name">{review.name}</p>
                      <p className="customer-email">{review.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="rating">{renderStars(review.rating)}</div>
                </td>
                <td className="date-cell">{review.date}</td>
                <td>
                  <p className="review-text">{review.review.substring(0, 50)}...</p>
                </td>
                <td>
                  <div className="actions">
                    <button className={`action-btn ${review.status}`}>
                      {review.status === 'replied' ? 'REPLIED' : 'Reply'}
                    </button>
                    <button className="action-view">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <span className="pagination-info">Showing 1-{filteredReviews.length} of <strong>1,240</strong> reviews</span>
          <div className="pagination-buttons">
            <button className="page-btn">‹</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn">›</button>
          </div>
        </div>
      </div>
    </div>
  )
}
