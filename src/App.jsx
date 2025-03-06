import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar.jsx'
import HomePage from './components/HomePage.jsx'

function App() {
  return (
    <Router>
      <div className="App">
        <NavBar />
        <div className="container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* Add more routes as needed */}
            <Route path="/about" element={<h1>About Page</h1>} />
            <Route path="/contact" element={<h1>Contact Page</h1>} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
