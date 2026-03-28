import React from 'react'
import { Route, Routes } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import SignUp from './pages/Auth/SignUp'

function App() {
  return (
    <div>
        <Routes>
          <Route path='/' element={<AdminLayout/>}/>
          <Route path='/signup' element={<SignUp/>}/>
        </Routes>
    </div>
  )
}

export default App
