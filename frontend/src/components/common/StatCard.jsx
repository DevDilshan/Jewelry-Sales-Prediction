import './StatCard.css'

export default function StatCard({ title, value, change, changeType, extra }) {
  return (
    <div className="stat-card">
      <p className="stat-title">{title}</p>
      <div className="stat-value-row">
        <h3 className="stat-value">{value}</h3>
        {extra && <span className="stat-extra">{extra}</span>}
      </div>
      <p className={`stat-change ${changeType}`}>
        {change}
      </p>
    </div>
  )
}
