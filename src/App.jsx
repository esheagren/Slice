import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar.jsx'
import HomePage from './components/HomePage.jsx'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="header">
          <NavBar />
        </header>
        <div className="main-layout">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<div className="content-page"><h2>About</h2></div>} />
            <Route path="/contact" element={<div className="content-page"><h2>Contact</h2></div>} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
