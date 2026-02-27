import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './components/pages/Dashboard'
import Sidebar from './components/layouts/Sidebar'
import './App.css'
export default function App() {
  const [activePage, setActivePage] = useState('dashboard')

  return (
    <Router>
      <div className="app-container">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
        <main className="main-content">
          <Routes>
            <Route path="/admin" element={<Dashboard setActivePage={setActivePage} />} />
            <Route path="/admin/dashboard" element={<Dashboard setActivePage={setActivePage} />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}
